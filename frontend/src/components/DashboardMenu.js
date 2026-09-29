const DashboardMenu = {
  render: (props) => {
    return `
      <!-- القائمة الجانبية للـ Desktop -->
      <div class="dashboard-menu">
        <ul>
          <li class="${props.selected === 'dashboard' ? 'selected' : ''}">
            <a href="/#/dashboard"><i class="fa-solid fa-house"></i> Dashboard</a>
          </li>
          <li class="${props.selected === 'orders' ? 'selected' : ''}">
            <a href="/#/orderlist"><i class="fa-solid fa-box"></i> Orders</a>
          </li>
          <li class="${props.selected === 'products' ? 'selected' : ''}">
            <a href="/#/productlist"><i class="fa-solid fa-cart-shopping"></i> Products</a>
          </li>
        </ul>
      </div>

      <!-- القائمة السفلية للـ Mobile -->
      <div class="bottom-nav">
        <a href="/#/dashboard" class="${props.selected === 'dashboard' ? 'active' : ''}">
          <i class="fa-solid fa-house"></i>
        </a>
        <a href="/#/orderlist" class="${props.selected === 'orders' ? 'active' : ''}">
          <i class="fa-solid fa-box"></i>
        </a>
        <a href="/#/productlist" class="${props.selected === 'products' ? 'active' : ''}">
          <i class="fa-solid fa-cart-shopping"></i>
        </a>
      </div>
    `;
  },
};
export default DashboardMenu;
