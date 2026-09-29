import DashboardMenu from "../components/DashboardMenu";
import { getProducts, createProduct, deleteProduct  } from "../api";
import { showLoading, hideLoading, rerender, showMessage, escapeHTML, parseRequestUrl } from "../utils";

const ProductListScreen = {
  after_render: () => {
    document
      .getElementById("create-product-button")
      .addEventListener("click", async () => {
        const data = await createProduct();
        document.location.hash = `/product/${data.product._id}/edit`;
      });

    const editButtons = document.getElementsByClassName("table-button");
    Array.from(editButtons).forEach((editButton) => {
      editButton.addEventListener("click", () => {
        document.location.hash = `/product/${editButton.id}/edit`;
      });
    });

    const deleteButtons = document.getElementsByClassName("table-button-delete");
    Array.from(deleteButtons).forEach((deleteButton) => {
      deleteButton.addEventListener("click", async () => {
        if (confirm("Are you sure to delete this product?")) {
          showLoading();
          const data = await deleteProduct(deleteButton.id);
          if (data.error) {
            showMessage(data.error);
          } else {
            rerender(ProductListScreen);
          }
          hideLoading();
        }
      });
    });

    document.getElementById("sort-select").addEventListener("change", (e) => {
      const sort = e.target.value;
      const url = parseRequestUrl();
      const searchKeyword = document.getElementById("search-q").value || '';
      let newHash = `/dashboard/products?sort=${encodeURIComponent(sort)}`;
      if (searchKeyword) newHash += `&q=${encodeURIComponent(searchKeyword)}`;
      document.location.hash = newHash;
    });

    document.getElementById("search-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const searchKeyword = document.getElementById("search-q").value;
      const url = parseRequestUrl();
      const sort = url.sort || 'newest';
      document.location.hash = `/dashboard/products?q=${encodeURIComponent(searchKeyword)}&sort=${encodeURIComponent(sort)}`;
    });
  },

  render: async () => {
    const { sort, q } = parseRequestUrl();
    const sortOrder = sort || "newest";
    const searchKeyword = q || "";
    const products = await getProducts({ searchKeyword, sort: sortOrder });

    return `
      <div class="dashboard">
        ${DashboardMenu.render({ selected: 'products' })}
        <div class="dashboard-content">
   <h1>Products</h1>
<div class="dashboard-toolbar">
<!-- Search -->
<div class="search">
  <form class="search-form" id="search-form">
    <input
      type="text"
      name="q"
      id="search-q"
      placeholder="Search products..."
      value="${escapeHTML(decodeURIComponent(searchKeyword))}"
    />
    <button type="submit">
      <i class="fa fa-search"></i>
    </button>
  </form>
</div>

  <!-- Wrapper فيه الزرار والسورت -->
  <div class="toolbar-bottom-row">
    <button id="create-product-button">Create Product</button>

    <div class="sort-wrapper">
      <label for="sort-select">Sort by:</label>
      <select id="sort-select">
        <option value="newest" ${sortOrder === 'newest' ? 'selected' : ''}>Newest</option>
        <option value="oldest" ${sortOrder === 'oldest' ? 'selected' : ''}>Oldest</option>
        <option value="lowest" ${sortOrder === 'lowest' ? 'selected' : ''}>Price: Low to High</option>
        <option value="highest" ${sortOrder === 'highest' ? 'selected' : ''}>Price: High to Low</option>
      </select>
    </div>
  </div>
</div>

          <div class="product-list">
            <div class="products-cards-container">
              ${products
                .map(
                  (product) => `
                    <div class="product-card">
                      <div class="product-card-image">
                        <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" />
                      </div>
                      <div class="product-card-details">
                        <h3>${escapeHTML(product.name)}</h3>
                        <p><strong>ID:</strong> ${escapeHTML(product._id)}</p>
                        <p><strong>Price:</strong> $${escapeHTML(product.price)}</p>
                        <p><strong>Category:</strong> ${escapeHTML(product.category)}</p>
                        <p><strong>Brand:</strong> ${escapeHTML(product.brand)}</p>
                        <p><strong>In Stock:</strong> ${escapeHTML(product.countInStock)}</p>
                        <div class="card-actions">
                          <button id="${escapeHTML(product._id)}" class="table-button">Edit</button>
                          <button id="${escapeHTML(product._id)}" class="table-button-delete">Delete</button>
                        </div>
                      </div>
                    </div>
                  `
                )
                .join("\n")}
            </div>
          </div>
        </div>
      </div>
    `;
  },
};

export default ProductListScreen;
