import {
  getCartItems,
  getShipping,
  getPayment,
  cleanCart,
} from '../localStorage';
import CheckoutSteps from '../components/CheckoutSteps';
import { showLoading, hideLoading, showMessage, escapeHTML } from '../utils';
import { createOrder } from '../api';

const convertCartToOrder = () => {
  const orderItems = getCartItems();
  if (orderItems.length === 0) {
    document.location.hash = '/cart';
  }
  const shipping = getShipping();
  if (!shipping.address) {
    document.location.hash = '/shipping';
  }
  const payment = getPayment();
  if (!payment.paymentMethod) {
    document.location.hash = '/payment';
  }
  const itemsPrice = orderItems.reduce((a, c) => a + c.price * c.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Math.round(0.15 * itemsPrice * 100) / 100;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;
  return {
    orderItems,
    shipping,
    payment,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

const PlaceOrderScreen = {
  after_render: async () => {
    document
      .getElementById('placeorder-button')
      .addEventListener('click', async () => {
        const order = convertCartToOrder();
        showLoading();
        const data = await createOrder(order);
        hideLoading();
        if (data.error) {
          showMessage(data.error);
        } else {
          cleanCart();
          document.location.hash = `/order/${data.order._id}`;
        }
      });
  },
  render: () => {
    const {
      orderItems,
      shipping,
      payment,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
    } = convertCartToOrder();

    return `
    <div>
      ${CheckoutSteps.render({
        step1: true,
        step2: true,
        step3: true,
        step4: true,
      })}
      <div class="order-page">
        <div class="order-grid">
          <div class="order-info">
            <div class="order-box">
              <h2>Shipping</h2>
              <div>
                ${escapeHTML(shipping.address)}, 
                ${escapeHTML(shipping.city)}, 
                ${escapeHTML(shipping.postalCode)}, 
                ${escapeHTML(shipping.country)},
                ${escapeHTML(shipping.phone)},
              </div>
            </div>
            <div class="order-box">
              <h2>Payment</h2>
              <div>
                Payment Method : ${escapeHTML(payment.paymentMethod)}
              </div>
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
                  .join('\n')}
              </ul>
            </div>
          </div>
          <div class="order-summary">
            <h2>Order Summary</h2>
            <ul>
              <li><div>Items</div><div>$${itemsPrice}</div></li>
              <li><div>Shipping</div><div>$${shippingPrice}</div></li>
              <li><div>Tax</div><div>$${taxPrice}</div></li>
              <li class="total"><div>Order Total</div><div>$${totalPrice}</div></li> 
              <li>
                <button id="placeorder-button" class="primary-btn">Place Order</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    `;
  },
};

export default PlaceOrderScreen;