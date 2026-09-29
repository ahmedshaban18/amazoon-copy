export const getCartItems = () => {
  try {
    const cartItems = localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [];

    // تصفية العناصر التالفة
    return cartItems.filter(item => 
      item && 
      item.product && 
      typeof item.price === 'number' && 
      !isNaN(item.price) &&
      item.name &&
      item.image
    );
  } catch (error) {
    console.error('Error reading cart items:', error);
    return [];
  }
};

export const setCartItems = (cartItems) => {
  // تصفية العناصر قبل الحفظ
  const validItems = cartItems.filter(item => 
    item && 
    item.product && 
    typeof item.price === 'number' && 
    !isNaN(item.price)
  );
  localStorage.setItem('cartItems', JSON.stringify(validItems));
};
export const setUserInfo = ({
  _id = '',
  name = '',
  email = '',
  password = '',
  token = '',
  refreshToken = '',
  isAdmin = false,
}) => {
  localStorage.setItem(
    'userInfo',
    JSON.stringify({
      _id,
      name,
      email,
      password,
      token,
      refreshToken,
      isAdmin,
    })
  );
};

export const getUserInfo = () => {
  return localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : { name: '', email: '', password: '', token: '', refreshToken: '' };
};

export const clearUser = () => {
  localStorage.removeItem('userInfo');
};
export const getShipping = () => {
  const shipping = localStorage.getItem('shipping')
    ? JSON.parse(localStorage.getItem('shipping'))
    : {
        address: '',
        city: '',
        postalCode: '',
        country: '',
        phone: '',
      };
  return shipping;
};
export const setShipping = ({
  address = '',
  city = '',
  postalCode = '',
  country = '',
  phone = '',
}) => {
  localStorage.setItem(
    'shipping',
    JSON.stringify({ address, city, postalCode, country , phone })
  );
};

export const getPayment = () => {
  const payment = localStorage.getItem('payment')
    ? JSON.parse(localStorage.getItem('payment'))
    : {
        paymentMethod: 'paypal',
      };
  return payment;
};
export const setPayment = ({ paymentMethod = 'paypal' }) => {
  localStorage.setItem('payment', JSON.stringify({ paymentMethod }));
};
export const cleanCart = () => {
  localStorage.removeItem('cartItems');
};
