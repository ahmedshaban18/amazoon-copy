import {
  parseRequestUrl,
  showLoading,
  showMessage,
  hideLoading,
} from '../utils';
import { getProduct, updateProduct, uploadProductImage } from '../api';

const ProductEditScreen = {
  after_render: () => {
    const request = parseRequestUrl();
    document
    .getElementById('edit-product-form')
    .addEventListener('submit', async (e) => {
      e.preventDefault();

      // فحص الحقول المطلوبة
      const requiredFields = [
        { id: 'name', label: 'name' },
        { id: 'price', label: 'price' },
        { id: 'image', label: 'image' },
        { id: 'brand', label: 'brand' },
        { id: 'category', label: 'category' },
        { id: 'countInStock', label: 'countInStock' },
        { id: 'description', label: 'description' },
      ];
      for (const field of requiredFields) {
        const value = document.getElementById(field.id).value.trim();
        if (!value) {
          showMessage(`You forgot to fill ${field.label}`);
          return;
        }
      }

      showLoading();
      const data = await updateProduct({
        _id: request.id,
        name: document.getElementById('name').value,
        price: document.getElementById('price').value,
        image: document.getElementById('image').value,
        brand: document.getElementById('brand').value,
        category: document.getElementById('category').value,
        countInStock: document.getElementById('countInStock').value,
        description: document.getElementById('description').value,
      });
      hideLoading();
      if (data.error) {
        showMessage(data.error);
      } else {
        document.location.hash = '/productlist';
      }
    });

    document.getElementById('image-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        showMessage('Only JPG, PNG, and WEBP image files are allowed.');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);
      showLoading();
      const data = await uploadProductImage(formData);
      hideLoading();
      if (data.error || data.message) {
        showMessage(data.error || data.message);
      } else {
        showMessage('Image uploaded successfully.');
        document.getElementById('image').value = data.image;
      }
    });
  },
  render: async () => {
    const request = parseRequestUrl();
    const product = await getProduct(request.id);
    return `
    <div class="edit-product-page">
    <div class="back-link">
      <a href="/#/productlist">Back to products</a>
    </div>
  
    <div class="form-container">
      <form id="edit-product-form">
        <ul class="form-items">
          <li>
            <h1>Edit Product ${product._id.substring(0, 8)}</h1>
          </li>
          <li>
            <label for="name">Name</label>
            <input type="text" name="name" value="${product.name}" id="name" placeholder="name of product" />
          </li>
          <li>
            <label for="price">Price</label>
            <input type="number" name="price" value="${product.price}" id="price" placeholder="price" />
          </li>
          <li>
            <label for="image">Image (680 x 830)</label>
            <input type="text" name="image" value="${product.image}" id="image" placeholder="image link" />
            <input type="file" name="image-file" id="image-file" />
          </li>
          <li>
            <label for="brand">Brand</label>
            <input type="text" name="brand" value="${product.brand}" id="brand" placeholder="brand" />
          </li>
          <li>
            <label for="countInStock">Count In Stock</label>
            <input type="text" name="countInStock" value="${product.countInStock}" id="countInStock" placeholder="count In Stock" />
          </li>
          <li>
            <label for="category">Category</label>
            <input type="text" name="category" value="${product.category}" id="category" placeholder="category" />
          </li>
          <li>
            <label for="description">Description</label>
             <input type="text" name="description" value="${product.description}" id="description" placeholder="description" />
          </li>
          <li>
            <button type="submit" class="primary orange-btn">Update</button>
          </li>
        </ul>
      </form>
    </div>
  </div>
    `;
  },
};
export default ProductEditScreen;
