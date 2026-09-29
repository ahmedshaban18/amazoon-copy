import {
  parseRequestUrl,
  showLoading,
  hideLoading,
  showMessage,
  rerender,
  escapeHTML,
} from '../utils';
import { getProduct, createReview } from '../api';
import Rating from '../components/Rating';
import { getCartItems, getUserInfo, setCartItems } from '../localStorage';

const ProductScreen = {
  after_render: () => {
    const request = parseRequestUrl();
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
            rerender(ProductScreen);
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
              ${
                cartItems.length === 0
                  ? '<p class="empty-cart-text">Your cart is empty.</p>'
                  : `
                    <ul class="cart-items-list">
                      ${cartItems
                        .map(
                          (item) => `
                        <li class="cart-item">
                          <img src="${item.image}" alt="${escapeHTML(item.name)}" />
                          <div class="item-details">
                            <span class="item-name">${escapeHTML(item.name)}</span>
                            <span class="item-qty">Qty: ${item.qty}</span>
                          </div>
                          <span class="item-price">$${item.price}</span>
                        </li>
                      `
                        )
                        .join('')}
                    </ul>
                  `
              }
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

    if (document.getElementById('review-form')) {
      document.getElementById('review-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const data = await createReview(request.id, {
          comment: document.getElementById('comment').value,
          rating: document.getElementById('rating').value,
        });
        hideLoading();
        if (data.error) {
          showMessage(data.error);
        } else {
          showMessage('Review Added Successfully', () => {
            rerender(ProductScreen);
          });
        }
      });
    }
  },

  render: async () => {
    const request = parseRequestUrl();
    showLoading();
    const product = await getProduct(request.id);
    if (product.error) {
      hideLoading();
      return `<div>${escapeHTML(product.error)}</div>`;
    }

    hideLoading();
    const userInfo = getUserInfo();

    return `
      <div class="content">
        <div class="back-to-result">
          <a href="/#/">Back to result</a>
        </div>
        <div class="product-container">
        <div class="product-image">
          <img src="${product.image}" alt="${escapeHTML(product.name)}" />
        </div>
        <div class="product-details">
          <h1 class="product-title">${escapeHTML(product.name)}</h1>
          <p class="product-category">Category: ${escapeHTML(product.category)}</p>
          <p class="product-brand">Brand: ${escapeHTML(product.brand)}</p>
          <p class="product-stock">
            Status:
            ${
              product.countInStock > 0
                ? `<span class="success">In Stock</span>`
                : `<span class="error">Unavailable</span>`
            }
          </p>
          <p class="product-rating">
            ${Rating.render({ value: product.rating, text: `${product.numReviews} reviews` })}
          </p>
          <p class="product-price">Price: $${product.price}</p>
          <p class="product-description">
            <strong>Description:</strong> ${escapeHTML(product.description)}
          </p>
          <button class="add-to-cart-button"
            data-id="${product._id}"
            data-name="${escapeHTML(product.name)}"
            data-image="${product.image}"
            data-price="${product.price}"
            data-stock="${product.countInStock}">
            Add to Cart <i class="ri-shopping-cart-fill"></i>
          </button>
        </div>
      </div>


      ${
        product.relatedProducts && product.relatedProducts.length > 0
          ? `
          <div class="related-products">
            <h2>Related Products</h2>
            <div class="n-content">
              ${product.relatedProducts
                .map(
                  (product) => `
                    <div class="row">
                      <div class="row-image">
                        <a href="/#/product/${escapeHTML(product._id)}">
                          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}">
                        </a>
                      </div>
                      <h3>
                        <a href="/#/product/${escapeHTML(product._id)}">${escapeHTML(product.name)}</a>
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
                            data-id="${escapeHTML(product._id)}"
                            data-name="${escapeHTML(product.name)}"
                            data-image="${escapeHTML(product.image)}"
                            data-price="${escapeHTML(product.price.toString())}"
                            data-stock="${escapeHTML(product.countInStock.toString())}">
                            Add to Cart
                            <i class="ri-shopping-cart-fill"></i>
                          </button>
                        </div>
                        <div class="row-right">
                          <h6>$${escapeHTML(product.price.toString())}</h6>
                        </div>
                      </div>
                    </div>
                  `
                )
                .join('\n')}
            </div>
          </div>
          `
          : '<div class="no-related-products">No related products found.</div>'
      }


      <div class="review-section">
      <h2>Customer Reviews</h2>
      ${product.reviews.length === 0 ? `<div class="no-review">No reviews yet.</div>` : ''}
      <div class="reviews-grid">
        ${product.reviews
          .map(
            (review) => `
            <div class="review-card">
              <div class="review-header">
                <span class="review-name">${escapeHTML(review.name)}</span>
                <span class="review-date">${escapeHTML(review.createdAt.substring(0, 10))}</span>
              </div>
              <div class="review-rating">
                ${Rating.render({ value: review.rating })}
              </div>
              <div class="review-comment">${escapeHTML(review.comment)}</div>
            </div>
          `
          )
          .join('\n')}
      </div>

      <div class="review-form-wrapper">
        ${
          userInfo.name
            ? `
            <h3>Write a Review</h3>
            <form id="review-form" class="review-form">
              <label for="rating">Rating</label>
              <select required name="rating" id="rating">
                <option value="">Select</option>
                <option value="1">1 = Poor</option>
                <option value="2">2 = Fair</option>
                <option value="3">3 = Good</option>
                <option value="4">4 = Very Good</option>
                <option value="5">5 = Excellent</option>
              </select>

              <label for="comment">Comment</label>
              <textarea required name="comment" id="comment" placeholder="Write your review here..."></textarea>

              <button type="submit" class="submit-review-btn">Submit</button>
            </form>
          `
            : `<div class="signin-msg">Please <a href="/#/signin">Signin</a> to write a review.</div>`
        }
      </div>
    </div>
    `;
  },
};

export default ProductScreen;
