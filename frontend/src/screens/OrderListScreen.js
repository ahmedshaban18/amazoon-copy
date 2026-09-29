import DashboardMenu from '../components/DashboardMenu';
import { getOrders , deleteOrder} from '../api';
import {
  showLoading,
  hideLoading,
  rerender,
  showMessage,
  parseRequestUrl,
} from '../utils';

const OrderListScreen = {
  render: async () => {
    const { sort = 'desc', today = 'false', isPaid = 'all', isDelivered = 'all' } = parseRequestUrl();

    showLoading();
    const orders = await getOrders({ sort, today: today === 'true', isPaid, isDelivered });
    hideLoading();

    return `
      <div class="dashboard">
        ${DashboardMenu.render({ selected: 'orders' })}
        <div class="dashboard-content">
          <h1>Orders</h1>

          <div class="filter-container">
            <label for="sort-orders">Sort:</label>
            <select id="sort-orders">
              <option value="desc" ${sort === 'desc' ? 'selected' : ''}>Newest First</option>
              <option value="asc" ${sort === 'asc' ? 'selected' : ''}>Oldest First</option>
            </select>

            <label for="filter-orders">Filter:</label>
            <select id="filter-orders">
              <option value="false" ${today !== 'true' ? 'selected' : ''}>All Orders</option>
              <option value="true" ${today === 'true' ? 'selected' : ''}>Today Only</option>
            </select>

            <label for="status-paid">Paid:</label>
            <select id="status-paid">
              <option value="all" ${isPaid === 'all' ? 'selected' : ''}>All</option>
              <option value="true" ${isPaid === 'true' ? 'selected' : ''}>Yes</option>
              <option value="false" ${isPaid === 'false' ? 'selected' : ''}>No</option>
            </select>

            <label for="status-delivered">Delivered:</label>
            <select id="status-delivered">
              <option value="all" ${isDelivered === 'all' ? 'selected' : ''}>All</option>
              <option value="true" ${isDelivered === 'true' ? 'selected' : ''}>Yes</option>
              <option value="false" ${isDelivered === 'false' ? 'selected' : ''}>No</option>
            </select>
          </div>

          <div class="order-list">
            <div class="orders-cards-container">
              ${
                !Array.isArray(orders) || orders.length === 0
                ? `<div>${orders.error || 'No orders found.'}</div>`
                :  orders.map(
                      (order) => `
                        <div class="order-card">
                          <div><strong>ID:</strong> ${order._id}</div>
                          <div><strong>Date:</strong> ${order.createdAt}</div>
                          <div><strong>Total:</strong> $${order.totalPrice}</div>
                          <div><strong>User:</strong> ${order.user && order.user.name ? order.user.name : 'N/A'}</div>
                          <div><strong>Paid:</strong> ${order.paidAt || 'No'}</div>
                          <div><strong>Delivered:</strong> ${order.deliveredAt || 'No'}</div>
                          <div class="card-actions">
                            <a href="/#/order/${order._id}" class="table-button">Details</a>
                            <button id="${order._id}" class="table-button delete">Delete</button>
                          </div>
                        </div>
                      `
                    ).join('\n')
              }
            </div>
          </div>
        </div>
      </div>
    `;
  },

  after_render: () => {
    const updateURL = () => {
      const sort = document.getElementById('sort-orders').value;
      const filter = document.getElementById('filter-orders').value;
      const isPaid = document.getElementById('status-paid').value;
      const isDelivered = document.getElementById('status-delivered').value;
      document.location.hash = `/orderlist?sort=${sort}&today=${filter}&isPaid=${isPaid}&isDelivered=${isDelivered}`;
    };

    document.getElementById('sort-orders').addEventListener('change', updateURL);
    document.getElementById('filter-orders').addEventListener('change', updateURL);
    document.getElementById('status-paid').addEventListener('change', updateURL);
    document.getElementById('status-delivered').addEventListener('change', updateURL);

    document.querySelectorAll('.delete').forEach((button) => {
      button.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this order?')) {
          showLoading();
          const data = await deleteOrder(button.id);
          hideLoading();
          if (data.error) {
            showMessage(data.error);
          } else {
            rerender(OrderListScreen);
          }
        }
      });
    });
  },
};

export default OrderListScreen;


