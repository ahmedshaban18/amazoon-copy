import {
  parseRequestUrl,
  showLoading,
  hideLoading,
  showMessage,
  rerender,
  escapeHTML,
} from "../utils";
import {
  getOrder,
  getPaypalClientId,
  payOrder,
  deliverOrder,
} from "../api";
import { getUserInfo } from "../localStorage";

const loadPaypalSdk = async () => {
  try {
    const clientId = await getPaypalClientId();

    // إزالة أي نسخة سابقة من SDK
    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) existingScript.remove();

    showLoading();

    const script = document.createElement("script");
    script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${clientId}&currency=USD&intent=capture&commit=true&vault=false&components=buttons,funding-eligibility&enable-funding=venmo,card`;
    script.id = "paypal-sdk";
    script.async = true;
    script.setAttribute('data-csp-nonce', 'random-nonce-value');

    script.onload = () => {
      hideLoading();
      renderPaypalButtons();
    };

    script.onerror = (err) => {
      hideLoading();
      showMessage("Failed to load PayPal. Please disable ad-blockers and try again.");
      console.error("PayPal SDK error:", err);
    };

    document.body.appendChild(script);
  } catch (err) {
    hideLoading();
    showMessage("Error loading payment options");
    console.error("PayPal loading error:", err);
  }
};

const renderPaypalButtons = () => {

  if (window.popupBlockerDisabled === false) {
    showMessage("Please allow popups for this site to complete payment");
    return;
  }
  
  try {
    const totalPrice = window.totalPriceForPay;

    // زر PayPal الرئيسي
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'pill',
        label: 'paypal',
        tagline: false,
        height: 45
      },
      fundingSource: paypal.FUNDING.PAYPAL,
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: totalPrice,
              currency_code: "USD",
              breakdown: {
                item_total: { value: totalPrice, currency_code: "USD" }
              }
            }
          }],
          application_context: {
            shipping_preference: 'NO_SHIPPING'
          }
        });
      },
      onApprove: async (data, actions) => {
        try {
          showLoading();
          const details = await actions.order.capture();
          await payOrder(parseRequestUrl().id, {
            orderID: data.orderID,
            payerID: data.payerID,
            paymentID: details.id
          });
          hideLoading();
          showMessage("Payment successful!", () => {
            rerender(OrderScreen);
          });
        } catch (err) {
          hideLoading();
          showMessage("Payment processing failed. Please try again.");
          console.error("Payment approval error:", err);
        }
      },
      onError: (err) => {
        showMessage(`Payment error: ${err.message}`);
        console.error("PayPal button error:", err);
      },
      onCancel: () => {
        showMessage("Payment cancelled");
      }
    }).render('#paypal-button');

    // زر الدفع بالبطاقة
    paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'black',
        shape: 'rect',
        label: 'pay',
        height: 45
      },
      fundingSource: paypal.FUNDING.CARD,
      createOrder: (data, actions) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: totalPrice,
              currency_code: "USD"
            }
          }]
        });
      },
      onApprove: async (data, actions) => {
        try {
          showLoading();
          const details = await actions.order.capture();
          await payOrder(parseRequestUrl().id, {
            orderID: data.orderID,
            payerID: data.payerID,
            paymentID: details.id
          });
          hideLoading();
          showMessage("Card payment successful!", () => {
            rerender(OrderScreen);
          });
        } catch (err) {
          hideLoading();
          showMessage("Card payment failed. Please try again.");
          console.error("Card payment error:", err);
        }
      },
      onError: (err) => {
        showMessage(`Card payment error: ${err.message}`);
        console.error("Card button error:", err);
      }
    }).render('#card-button');

  } catch (err) {
    showMessage("Error initializing payment buttons");
    console.error("PayPal buttons rendering error:", err);
  }
};


const OrderScreen = {
  after_render: async () => {
    const request = parseRequestUrl();
    const { isPaid, totalPrice, payment } = await getOrder(request.id);
    window.totalPriceForPay = totalPrice;

    if (!isPaid && payment.paymentMethod === "paypal") {
      await loadPaypalSdk();
    }

    const deliverBtn = document.getElementById("deliver-order-button");
    if (deliverBtn) {
      deliverBtn.addEventListener("click", async () => {
        showLoading();
        try {
          await deliverOrder(request.id);
          hideLoading();
          showMessage("Order Delivered");
          rerender(OrderScreen);
        } catch (err) {
          hideLoading();
          showMessage(`Delivery failed: ${err.message}`);
        }
      });
    }
  },

  render: async () => {
    const { isAdmin } = getUserInfo();
    const request = parseRequestUrl();
    const {
      _id,
      shipping,
      payment,
      orderItems,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      isDelivered,
      deliveredAt,
      isPaid,
      paidAt,
    } = await getOrder(request.id);

    return `
    <div class="order-page container">
      <h1 class="page-title">Order ${escapeHTML(_id)}</h1>
      <div class="order-grid">
        <div class="order-info">
          <div class="order-box">
            <h2>Shipping</h2>
            <p>${escapeHTML(shipping.address)}, ${escapeHTML(shipping.city)}, ${escapeHTML(shipping.postalCode)}, ${escapeHTML(shipping.country)} , ${escapeHTML(shipping.phone)}</p>
            ${
              isDelivered
                ? `<div class="status success">Delivered at ${escapeHTML(deliveredAt)}</div>`
                : `<div class="status error">Not Delivered</div>`
            }
          </div>
          <div class="order-box">
            <h2>Payment</h2>
            <p>Payment Method: ${escapeHTML(payment.paymentMethod)}</p>
            ${
              isPaid
                ? `<div class="status success">Paid at ${escapeHTML(paidAt)}</div>`
                : `<div class="status error">Not Paid</div>`
            }
          </div>

          <div class="order-box">
            <h2>Shopping Cart</h2>
            <ul class="cart-list">
              ${orderItems
                .map(
                  (item) => `
                <li class="cart-item">
                  <div class="cart-image">
                    <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" />
                  </div>
                  <div class="cart-name">
                    <a href="/#/product/${escapeHTML(item.product)}">${escapeHTML(item.name)}</a>
                    <div>Qty: ${item.qty}</div>
                  </div>
                  <div class="cart-price">$${item.price}</div>
                </li>
              `
                )
                .join('')}
            </ul>
          </div>
        </div>

        <div class="order-summary">
          <h2>Order Summary</h2>
          <ul>
            <li><span>Items</span><span>$${itemsPrice}</span></li>
            <li><span>Shipping</span><span>$${shippingPrice}</span></li>
            <li><span>Tax</span><span>$${taxPrice}</span></li>
            <li class="total"><strong>Order Total</strong><strong>$${totalPrice}</strong></li>
            ${
              !isPaid && payment.paymentMethod === "paypal"
                ? `
                  <li><div id="paypal-button" class="paypal-button-container"></div></li>
                  <li><div id="card-button" class="paypal-button-container"></div></li>
                `
                : ""
            }
            ${
              isPaid && !isDelivered && isAdmin
                ? `<li><button id="deliver-order-button" class="primary-btn">Deliver Order</button></li>`
                : ''
            }
          </ul>
        </div>
      </div>
    </div>
    `;
  },
};

export default OrderScreen;