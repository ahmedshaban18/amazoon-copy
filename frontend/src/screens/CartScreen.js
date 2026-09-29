/* eslint-disable no-use-before-define */
import { parseRequestUrl, rerender, showMessage } from '../utils';
import { getProduct } from '../api';
import { getCartItems, setCartItems } from '../localStorage';

/* ================= ADD TO CART (ADD ONLY) ================= */
const addToCart = (item) => {
  if (!item || !item.product || typeof item.price !== 'number') {
    showMessage('Invalid product data');
    return;
  }

  const cartItems = getCartItems();
  const existItem = cartItems.find(x => x.product === item.product);

  if (existItem) {
    if (existItem.qty + 1 > item.countInStock) {
      showMessage('Reached maximum available stock');
      return;
    }

    setCartItems(
      cartItems.map(x =>
        x.product === item.product
          ? { ...x, qty: x.qty + 1 }
          : x
      )
    );
  } else {
    setCartItems([...cartItems, { ...item, qty: 1 }]);
  }
};

/* ================= UPDATE QTY ================= */
const updateQty = (productId, qty) => {
  const cartItems = getCartItems().map(item =>
    item.product === productId
      ? { ...item, qty }
      : item
  );

  setCartItems(cartItems);
  rerender(CartScreen);
};

/* ================= REMOVE ================= */
const removeFromCart = (id) => {
  setCartItems(getCartItems().filter(x => x.product !== id));
  rerender(CartScreen);
};

/* ================= SCREEN ================= */
const CartScreen = {
  after_render: () => {

    /* Quantity change */
    Array.from(document.getElementsByClassName('qty-select')).forEach(select => {
      select.addEventListener('change', (e) => {
        updateQty(select.id, Number(e.target.value));
      });
    });

    /* Delete */
    Array.from(document.getElementsByClassName('delete-button')).forEach(btn => {
      btn.addEventListener('click', () => {
        removeFromCart(btn.id);
      });
    });

    /* Checkout */
    document.getElementById('checkout-button')
      .addEventListener('click', () => {
        document.location.hash = '/signin';
      });
  },

  render: async () => {
    const request = parseRequestUrl();

    /* Add product from URL */
    if (request.id) {
      const product = await getProduct(request.id);
      if (product) {
        const existItem = getCartItems().find(x => x.product === product._id);
        if (!existItem) {
          addToCart({
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
          });
        }
      }
    }

    let cartItems = getCartItems();

    /* Sync with backend */
    const updatedItems = await Promise.all(
      cartItems.map(async item => {
        const product = await getProduct(item.product);
        if (!product) return null;

        return {
          ...item,
          price: product.price,
          countInStock: product.countInStock,
          name: product.name,
          image: product.image,
        };
      })
    );

    cartItems = updatedItems.filter(Boolean);
    setCartItems(cartItems);

    return `
    <div class="small-container-cart">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${
            cartItems.length === 0
              ? `<tr>
                  <td colspan="3">
                    Cart is empty.
                    <a href="/#/shop">Go Shopping</a>
                  </td>
                </tr>`
              : cartItems.map(item => `
                <tr>
                  <td>
                    <div class="cart-info">
                      <img src="${item.image}" />
                      <div>
                        <p>
                          <a href="/#/product/${item.product}">
                            ${item.name}
                          </a>
                        </p>
                        <small>$${item.price.toFixed(2)}</small>
                        <br>
                        <a class="delete-button" id="${item.product}">
                          Delete
                        </a>
                      </div>
                    </div>
                  </td>

                  <td>
                    <select class="qty-select" id="${item.product}">
                      ${
                        [...Array(item.countInStock).keys()]
                          .map(x => `
                            <option value="${x + 1}"
                              ${item.qty === x + 1 ? 'selected' : ''}>
                              ${x + 1}
                            </option>
                          `)
                          .join('')
                      }
                    </select>
                  </td>

                  <td>
                    $${(item.price * item.qty).toFixed(2)}
                  </td>
                </tr>
              `).join('')
          }
        </tbody>
      </table>

      <div class="cart-action">
        <h3>
          Subtotal (${cartItems.reduce((a, c) => a + c.qty, 0)} items)
          : $${cartItems.reduce((a, c) => a + c.price * c.qty, 0).toFixed(2)}
        </h3>

        <button id="checkout-button" class="primary fw">
          Proceed to Checkout
        </button>
      </div>
    </div>
    `;
  }
};

export default CartScreen;
