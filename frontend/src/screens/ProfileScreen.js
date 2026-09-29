import { update, getMyOrders } from '../api';
import { getUserInfo, setUserInfo, clearUser } from '../localStorage';
import { showLoading, hideLoading, showMessage } from '../utils';

const ProfileScreen = {
  after_render: () => {
    document.getElementById('signout-button').addEventListener('click', () => {
      clearUser();
      document.location.hash = '/';
    });
    document
      .getElementById('profile-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const data = await update({
          name: document.getElementById('name').value,
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        });
        hideLoading();
        if (data.error) {
          showMessage(data.error);
        } else {
          setUserInfo(data);
          document.location.hash = '/';
        }
      });
  },
  render: async () => {
    const { name, email } = getUserInfo();
    if (!name) {
      document.location.hash = '/';
    }
    const orders = await getMyOrders();
    return `
    <div class="profile-wrapper">
    <div class="profile-box">
      <form id="profile-form" class="profile-form">
        <h1>My Profile</h1>
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" value="${name}" />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" value="${email}" />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" />
        </div>
        <button type="submit" class="button update-btn">Update</button>
        <button type="button" id="signout-button" class="button signout-btn">Sign Out</button>
      </form>
    </div>

    <div class="profile-orders-list">
      <h2>Your Orders</h2>
      <div class="order-cards-grid">
        ${orders
          .map(
            (order) => `
              <div class="order-card-profile">
                <p><strong>ID:</strong> ${order._id}</p>
                <p><strong>Date:</strong> ${order.createdAt}</p>
                <p><strong>Total:</strong> $${order.totalPrice}</p>
                <p><strong>Paid:</strong> ${order.paidAt || 'No'}</p>
                <p><strong>Delivered:</strong> ${order.deliveredAt || 'No'}</p>
                <div class="order-actions">
                  <a href="/#/order/${order._id}" class="order-btn">Details</a>
                </div>
              </div>
            `
          )
          .join('')}
      </div>
    </div>
  </div>


    
    `;
  },
};
export default ProfileScreen;
