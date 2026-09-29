import Rating from '../components/Rating';
import { getProducts } from '../api';
import { parseRequestUrl, rerender, showMessage, escapeHTML } from '../utils';
import { getCartItems, setCartItems } from '../localStorage';

const ShopScreen = {
  render: async () => {
    const { q, sort, category } = parseRequestUrl();
    const sortOrder = sort || 'newest';
    const searchKeyword = q || '';
    const products = await getProducts({ searchKeyword, sort: sortOrder, category });
    if (products.error) {
      return `<div class="error">${escapeHTML(products.error)}</div>`;
    }

    return `
    <section class="n-product">
    <div class="header-container">
    <div class="search">
      <form class="search-form" id="search-form">
        <input type="text" name="q" id="q" value="${escapeHTML(decodeURIComponent(searchKeyword))}" placeholder="Search products..." />
        <button type="submit">
          <i class="fa fa-search"></i>
        </button>
      </form>
    </div>
    <div class="bottom-row">
      <h2>Products</h2>
      <div class="sort-container">
        <label for="sort">Sort by:</label>
        <select id="sort" name="sort" value="${escapeHTML(sortOrder)}">
          <option value="newest" ${sortOrder === 'newest' ? 'selected' : ''}>Newest</option>
          <option value="oldest" ${sortOrder === 'oldest' ? 'selected' : ''}>Oldest</option>
          <option value="lowest" ${sortOrder === 'lowest' ? 'selected' : ''}>Price: Low to High</option>
          <option value="highest" ${sortOrder === 'highest' ? 'selected' : ''}>Price: High to Low</option>
        </select>
      </div>
    </div>
  </div>

      <div class="n-content">
        ${products
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
    </section>
    `;
  },

  after_render: () => {
    document
      .getElementById('search-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const searchKeyword = document.getElementById('q').value;
        document.location.hash = `/shop/?q=${encodeURIComponent(searchKeyword)}`;
      });

      document.getElementById('sort').addEventListener('change', (e) => {
        const sortOrder = e.target.value;
        const url = parseRequestUrl();
        const searchKeyword = document.getElementById('q').value || '';
        const category = url.category ? decodeURIComponent(url.category) : undefined;

        let newUrl = `/shop/?sort=${encodeURIComponent(sortOrder)}`;
        if (searchKeyword) newUrl += `&q=${encodeURIComponent(searchKeyword)}`;
        if (category !== undefined) newUrl += `&category=${encodeURIComponent(category)}`;
        document.location.hash = newUrl;
      });

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
            rerender(ShopScreen);
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
              : `
                <ul class="cart-items-list">
                  ${cartItems
                    .map(
                      (item) => `
                        <li class="cart-item">
                          <img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.name)}" />
                          <div class="item-details">
                            <span class="item-name">${escapeHTML(item.name)}</span>
                            <span class="item-qty">Qty: ${item.qty}</span>
                          </div>
                          <span class="item-price">$${item.price}</span>
                        </li>`
                    )
                    .join('')}
                </ul>
              `}
            <a href="/#/cart" class="small-cart-checkout">View Full Cart</a>
          </div>
        </div>`;

        document.body.appendChild(cartPopup);

        document.getElementById('close-cart').addEventListener('click', () => {
          cartPopup.remove();
        });
      });
    });
  },
};

export default ShopScreen;
