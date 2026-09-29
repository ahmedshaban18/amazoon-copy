import HomeScreen from './screens/HomeScreen';
import ShopScreen from './screens/ShopScreen';
import ProductScreen from './screens/ProductScreen';
import { parseRequestUrl, showLoading, hideLoading } from './utils';
import Error404Screen from './screens/Error404Screen';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import Header from './components/Header';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ShippingScreen from './screens/ShippingScreen';
import PaymentScreen from './screens/PaymentScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import DashboardScreen from './screens/DashboardScreen';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import VerifyScreen from './screens/VerifyScreen';
import ForgotPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import AboutScreen from './screens/AboutScreen';
import FAQScreen from './screens/FAQScreen'
import Footer from './components/Footer';
const routes = {
  '/': HomeScreen,
  '/shop': ShopScreen,
  '/product/:id/edit': ProductEditScreen,
  '/product/:id': ProductScreen,
  '/order/:id': OrderScreen,
  '/cart': CartScreen,
  '/verify/:id': VerifyScreen,
  '/signin': SigninScreen,
  '/register': RegisterScreen,
  '/profile': ProfileScreen,
  '/shipping': ShippingScreen,
  '/payment': PaymentScreen,
  '/placeorder': PlaceOrderScreen,
  '/dashboard': DashboardScreen,
  '/productlist': ProductListScreen,
  '/dashboard/products': ProductListScreen,
  '/orderlist': OrderListScreen,
  '/forgot-password': ForgotPasswordScreen,
  '/reset-password/:id/:token': ResetPasswordScreen,
  '/aboutus': AboutScreen,
  '/faq': FAQScreen,
};


const matchRoute = (url) => {
  for (const path in routes) {
    const pathParts = path.split('/');
    const urlParts = url.split('/');

    if (pathParts.length !== urlParts.length) continue;

    const match = pathParts.every(
      (part, i) => part.startsWith(':') || part === urlParts[i]
    );

    if (match) return path;
  }
  return null;
};

const router = async () => {
  showLoading();
  const request = parseRequestUrl();

  const url =
    `/${request.resource || ''}` +
    (request.id ? `/${request.id}` : '') +
    (request.verb ? `/${request.verb}` : '') +
    (request.token ? `/${request.token}` : '');

  const matchedRoute = matchRoute(url);
  const screen = matchedRoute ? routes[matchedRoute] : Error404Screen;

  const header = document.getElementById('header-container');
  header.innerHTML = await Header.render();
  await Header.after_render();

  
  const footer = document.getElementById('footer-container');
  footer.innerHTML = await Footer.render();
  

  const main = document.getElementById('main-container');
  main.innerHTML = await screen.render();
  if (screen.after_render) await screen.after_render();

  hideLoading();
};

window.addEventListener('load', router);
window.addEventListener('hashchange', router);
