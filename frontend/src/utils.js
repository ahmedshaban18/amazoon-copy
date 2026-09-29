import { getCartItems } from './localStorage';

export const parseRequestUrl = () => {
  const address = document.location.hash.slice(1).split('?')[0];
  const queryString = document.location.hash.slice(1).split('?')[1] || '';

  const url = address.toLowerCase() || '/';
  const r = url.split('/');

 
  const query = {};
  queryString.split('&').forEach((pair) => {
    const [key, value] = pair.split('=');
    if (key) query[key] = value;
  });

 
  if (r[1] === 'reset-password') {
    return {
      resource: r[1],     
      id: r[2],            
      token: r[3],        
      verb: '',            
      ...query,            
    };
  }


  return {
    resource: r[1],
    id: r[2],
    verb: r[3],
    token: r[4],
    ...query,
  };
};

export const rerender = async (component) => {
  document.getElementById('main-container').innerHTML =
    await component.render();
  await component.after_render();
};

export const showLoading = () => {
  document.getElementById('loading-overlay').classList.add('active');
};

export const hideLoading = () => {
  document.getElementById('loading-overlay').classList.remove('active');
};

export const showMessage = (message, callback) => {
  document.getElementById('message-overlay').innerHTML = `
    <div>
      <div id="message-overlay-content">${message}</div>
      <button id="message-overlay-close-button">OK</button>
    </div>
  `;
  document.getElementById('message-overlay').classList.add('active');
  document
    .getElementById('message-overlay-close-button')
    .addEventListener('click', () => {
      document.getElementById('message-overlay').classList.remove('active');
      if (callback) {
        callback();
      }
    });
};

export const escapeHTML = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const redirectUser = () => {
  console.log(getCartItems().length);
  if (getCartItems().length !== 0) {
    document.location.hash = '/shipping';
  } else {
    document.location.hash = '/';
  }
};