/* eslint-disable no-new */
import Chartist from 'chartist';
import DashboardMenu from '../components/DashboardMenu';
import { getSummary } from '../api';

let summary = {};
const DashboardScreen = {
  after_render: () => {},
  render: async () => {
    summary = await getSummary();
    return `
      <div class="dashboard">
        ${DashboardMenu.render({ selected: 'dashboard' })}
        <div class="dashboard-content">
          <h1>Dashboard</h1>
          <ul class="summary-items">
            <li>
              <div class="summary-title color1">
                <span><i class="fa fa-users"></i> Users</span>
              </div>
              <div class="summary-body">${summary.users[0].numUsers}</div>
            </li>
            <li>
              <div class="summary-title color2">
                <span><i class="fa fa-shopping-cart"></i> Orders</span>
              </div>
              <div class="summary-body">${summary.orders[0].numOrders}</div>
            </li>
            <li>
              <div class="summary-title color3">
                <span><i class="fa fa-money"></i> Sales</span>
              </div>
              <div class="summary-body">$${summary.ordersPaid[0].totalSales.toFixed(2)}</div>
            </li>
            <li>
              <div class="summary-title color4">
                <span><i class="fa fa-calendar"></i> Orders Today</span>
              </div>
             <div class="summary-body">${summary.todayOrders[0].numOrders}</div>
            </li>
            <li>
              <div class="summary-title color5">
                <span><i class="fa fa-calendar-check-o"></i> Sales Today</span>
              </div>
              <div class="summary-body">$${summary.todaySalesPaid[0].totalPrice.toFixed(2)}</div>
            </li>
          </ul>
        </div>
      </div>
    `;
  },
};
export default DashboardScreen;
