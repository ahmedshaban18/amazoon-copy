import axios from "axios";
import { apiUrl } from "./config";
import { getUserInfo, setUserInfo, clearUser } from './localStorage';


axios.defaults.withCredentials = true;


axios.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const userInfo = getUserInfo();
      if (userInfo && userInfo.refreshToken) {
        try {
          const { data } = await axios.post(`${apiUrl}/api/users/refresh-token`, {
            refreshToken: userInfo.refreshToken
          });

       

setUserInfo({
  ...userInfo,
  token: data.token,
  refreshToken: data.refreshToken, // مهم جدًا
});


          axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

          return axios(originalRequest);
        } catch (refreshError) {
         console.error(
  'Refresh token failed:',
  (refreshError.response && refreshError.response.data) ? refreshError.response.data : refreshError.message
);

          clearUser();
          window.location.hash = '/signin';
        }
      } else {
        clearUser();
        window.location.hash = '/signin';
      }
    }
    return Promise.reject(error);
  }
);




export const getProducts = async ({ searchKeyword = "", sort = "newest", category = "" }) => {  
  try {  
    let queryString = "?";  
    if (searchKeyword) queryString += `searchKeyword=${searchKeyword}&`;  
    if (sort) queryString += `sort=${sort}&`;  
    if (category) queryString += `category=${category}&`;  

    const response = await axios({  
      url: `${apiUrl}/api/products${queryString}`,  
      method: "GET",  
      headers: {  
        "Content-Type": "application/json",  
      },  
    });  
    return response.data;  
  } catch (err) {  
    console.log(err);  
    return { error: err.response.data.message || err.message };  
  }  
};

export const getProduct = async (id) => {
  try {
    const response = await axios({
      url: `${apiUrl}/api/products/${id}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    console.log(err);
    return { error: err.response.data.message || err.message };
  }
};
export const createProduct = async () => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/products`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // if (response.statusText !== "Created") {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};

export const createReview = async (productId, review) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/products/${productId}/reviews`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: review,
    });
    // if (response.statusText !== "Created") {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};

export const deleteProduct = async (productId) => {

  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/products/${productId}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,

      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};

export const updateProduct = async (product) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/products/${product._id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: product,
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};
export const uploadProductImage = async (formData) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/images`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });

    if (response.status !== 201) {
      throw new Error(response.data.message);
    }

    // السيرفر بيرجع: { image: "/api/images/<id>" }
    return response.data;
  } catch (err) {
    console.log('Upload API error:', err);
    return {
      error:
        (err && err.response && err.response.data && err.response.data.message) ||
        err.message,
    };
  }
};

//
//
//
//
//
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${apiUrl}/api/users/forgot-password`, { email });
    return response.data;
  } catch (err) {
    console.log(err);
    return { error: err.response.data.message || err.message };
  }
};



export const resetPassword = async (userId, token, password) => {
  try {
    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, {
      withCredentials: true,
    });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");

    const response = await axios({
      url: `${apiUrl}/api/users/reset-password/${userId}/${token}`,
      method: "POST",
      headers: {
        "x-csrf-token": csrfToken,
      },
      withCredentials: true,
      data: { password },
    });

    return response.data;
  } catch (err) {
    console.log(err);
    return {
      error: (err.response && err.response.data && err.response.data.message) || err.message || 'Unknown error',
    };
  }
};

export const signin = async ({ email, password }) => {
  try {
    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");

    const response = await axios({
      url: `${apiUrl}/api/users/signin`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      withCredentials: true,
      data: {
        email,
        password,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      error: (err.response && err.response.data && err.response.data.message) || err.message || 'Unknown error',
    };
  }
};

export const register = async ({ name, email, password }) => {
  try {
    const response = await axios({
      url: `${apiUrl}/api/users/register`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        name,
        email,
        password,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      error: (err.response && err.response.data && err.response.data.message) || err.message || 'Unknown error',
    };
  }
};

export const update = async ({ name, email, password }) => {
  try {
    const { _id, token } = getUserInfo();

    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");

    const response = await axios({
      url: `${apiUrl}/api/users/${_id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-csrf-token": csrfToken,
      },
      withCredentials: true,
      data: {
        name,
        email,
        password,
      },
    });
    return response.data;
  } catch (err) {
    console.log(err);
    return {
      error: (err.response && err.response.data && err.response.data.message) || err.message || 'Unknown error',
    };
  }
};


export const createOrder = async (order) => {
  try {
    const { token } = getUserInfo();
    
    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");
    
    const response = await axios({
      url: `${apiUrl}/api/orders`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-csrf-token": csrfToken,
      },
      data: order,
    });
    // if (response.statusText !== "Created") {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response ? err.response.data.message : err.message };
  }
};


export const verifyOTP = async ({ _id, verificationCode }) => {
  try {
    const response = await axios.post(`${apiUrl}/api/users/verify-code`, {
      _id,
      verificationCode,
    });
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};

export const getOrders = async ({ sort = 'desc', today = false, isPaid = 'all', isDelivered = 'all' } = {}) => {
  try {
    const { token } = getUserInfo();

    const queryParams = new URLSearchParams({
      sort,
      today,
    });

    if (isPaid !== 'all') queryParams.append('isPaid', isPaid);
    if (isDelivered !== 'all') queryParams.append('isDelivered', isDelivered);

    const response = await axios({
      url: `${apiUrl}/api/orders?${queryParams.toString()}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (err) {
    console.error('>> getOrders error:', err);
    return {
      error: (err.response && err.response.data && err.response.data.message) || err.message
    };
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const { token } = getUserInfo();
    
    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");
    
    const response = await axios({
      url: `${apiUrl}/api/orders/${orderId}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-csrf-token": csrfToken,
      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response.data.message || err.message };
  }
};
export const getOrder = async (id) => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/orders/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          const retryResponse = await axios({
            url: `${apiUrl}/api/orders/${id}`,
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${newToken}`,
            },
            withCredentials: true
          });
          return retryResponse.data;
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        window.location.hash = '/signin';
        return { error: 'Session expired. Please login again.' };
      }
    }
    return {error: (err.response && err.response.data && err.response.data.message) || err.message};
  }
};



export const getMyOrders = async () => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/orders/mine`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response ? err.response.data.message : err.message };
  }
};
export const getPaypalClientId = async () => {
  const { token } = getUserInfo();

  const response = await axios({
    url: `${apiUrl}/api/paypal/clientId`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data.clientId;
};


export const payOrder = async (orderId, paymentResult) => {
  try {
    const { token } = getUserInfo();
    
    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");
    
    const response = await axios({
      url: `${apiUrl}/api/orders/${orderId}/pay`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
         "x-csrf-token": csrfToken,
      },
      data: paymentResult,
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response ? err.response.data.message : err.message };
  }
};

export const deliverOrder = async (orderId) => {
  try {
    const { token } = getUserInfo();

    const responseToken = await axios.get(`${apiUrl}/api/users/csrf-token`, { withCredentials: true });
    const csrfToken = responseToken.data.csrfToken;

    if (!csrfToken) throw new Error("CSRF Token is missing!");
    
    const response = await axios({
      url: `${apiUrl}/api/orders/${orderId}/deliver`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
         "x-csrf-token": csrfToken,
      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }
    return response.data;
  } catch (err) {
    return { error: err.response ? err.response.data.message : err.message };
  }
};
export const getSummary = async () => {
  try {
    const { token } = getUserInfo();
    const response = await axios({
      url: `${apiUrl}/api/orders/summary`,
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
    });
    // if (response.statusText !== 'OK') {
    //   throw new Error(response.data.message);
    // }

    return response.data;
  } catch (err) {
    return { error: err.response ? err.response.data.message : err.message };
  }
};




