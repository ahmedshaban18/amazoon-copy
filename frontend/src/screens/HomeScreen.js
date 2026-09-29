import { getProducts } from '../api';
import Rating from '../components/Rating';
import { parseRequestUrl, rerender, showMessage, escapeHTML } from '../utils';
import { getCartItems, setCartItems } from '../localStorage';
import axios from "axios";
import { apiUrl } from "../config";

const HomeScreen = {
  render: async () => {
    const { data: bestRating } = await axios.get(`${apiUrl}/api/products/bestrating`);
    const categoriesData = await getProducts('/api/products/categories');

    const categoryNames = categoriesData.map(item => item.category);
    const uniqueCategories = [...new Set(categoryNames)];

    return `
  <section class="home">
  <div class="home-container">
    
    <div class="home-content">
      <h6>New Arrivals</h6>
      <h1>
        New Arrivals <br />
        Ready to rock
      </h1>
      <p>
        Discover the latest products with premium quality and unbeatable prices.
      </p>

      <div class="home-buttons">
        <a href="/#/shop" class="btn primary">
          Shop Now
        </a>
      </div>
    </div>

    <div class="home-image"></div>

  </div>
</section>




      <section class="categories-section">
        <h2>Shop by Category</h2>
        <div class="categories-container">
          ${uniqueCategories
            .map(
              (category) => 
                `<div class="category-card">
                  <a href="/#/shop?category=${encodeURIComponent(category)}">${escapeHTML(category)}</a>
                </div>`
            )
            .join('')}
        </div>
      </section>

      <section class="bestrating">
        <h2>Best rating</h2>
        <div class="bestrating-container">
          <div class="n-content">
            ${bestRating
              .map(
                (product) => 
                  `<div class="row">
                    <div class="row-image">
                      <a href="/#/product/${product._id}">
                        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
                      </a>
                    </div>
                    <h3> 
                      <a href="/#/product/${product._id}">
                        ${escapeHTML(product.name)}
                      </a>
                    </h3>
                    <div class="start">
                      ${Rating.render({
                        value: product.rating,
                        text: `${escapeHTML(product.numReviews.toString())} reviews`,
                      })}
                    </div>
                    <div class="row-in">
                      <div class="row-left">
                        <button 
                          class="add-to-cart-button" 
                          data-id="${product._id}"
                          data-name="${escapeHTML(product.name)}"
                          data-image="${escapeHTML(product.image)}"
                          data-price="${escapeHTML(product.price.toString())}"
                          data-stock="${product.countInStock}">
                          Add to Cart
                          <i class="ri-shopping-cart-fill"></i>
                        </button>
                      </div>
                      <div class="row-right">
                        <h6>$${escapeHTML(product.price.toString())}</h6>
                      </div>
                    </div>
                  </div>`
              )
              .join('')}
          </div>
        </div>
      </section>
    `;
  },

  after_render: () => {
document.querySelectorAll('.add-to-cart-button').forEach((button) => {
  button.addEventListener('click', (e) => {

    const btn = e.currentTarget;
    const price = parseFloat(btn.dataset.price);
    if (isNaN(price)) {
      console.error('Invalid price:', btn.dataset.price);
      showMessage('Product price is invalid');
      return;
    }

    const product = {
      product: btn.dataset.id,
      name: btn.dataset.name,
      image: btn.dataset.image,
      price: price,
      countInStock: parseInt(btn.dataset.stock) || 0,
      qty: 1
    };


        if (!product.product || !product.name || !product.image) {
          console.error('Missing product data:', product);
          showMessage('Product data is incomplete');
          return;
        }

        if (product.countInStock === 0) {
          showMessage('This product is out of stock', () => {
            rerender(HomeScreen);
          });
          return;
        }

        let cartItems = getCartItems();
        const existItem = cartItems.find((item) => item.product === product.product);

        if (existItem) {
          const newQty = existItem.qty + 1;
          if (newQty > product.countInStock) {
            showMessage('Reached maximum available stock.');
            return;
          }
          cartItems = cartItems.map((item) =>
            item.product === existItem.product ? { ...item, qty: newQty } : item
          );
        } else {
          cartItems = [...cartItems, { ...product, qty: 1 }];
        }
        setCartItems(cartItems);

        const oldCart = document.getElementById('small-cart-popup');
        if (oldCart) oldCart.remove();

        const cartPopup = document.createElement('div');
        cartPopup.id = 'small-cart-popup';
        cartPopup.innerHTML = `
          <div class="small-cart">
            <div class="small-cart-content">
              <span id="close-cart" class="close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" height="26" viewBox="0 96 960 960" width="26">
                  <path d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"/>
                </svg>
              </span>
              <h3>Shopping Cart</h3>
              ${cartItems.length === 0
                ? '<p class="empty-cart-text">Your cart is empty.</p>'
                : `<ul class="cart-items-list">
                    ${cartItems.map(item => 
                      `<li class="cart-item">
                        <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" />
                        <div class="item-details">
                          <span class="item-name">${escapeHTML(item.name)}</span>
                          <span class="item-qty">Qty: ${item.qty}</span>
                        </div>
                        <span class="item-price">$${escapeHTML(item.price.toString())}</span>
                      </li>`
                    ).join('')}
                  </ul>`}
              <a href="/#/cart" class="small-cart-checkout">View Full Cart</a>
            </div>
          </div>
        `;

        document.body.appendChild(cartPopup);
        document.getElementById('close-cart').addEventListener('click', () => {
          cartPopup.remove();
        });
      });
    });
  },
};

export default HomeScreen;
