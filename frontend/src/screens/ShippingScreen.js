import { getUserInfo, getShipping, setShipping } from '../localStorage';
import CheckoutSteps from '../components/CheckoutSteps';

const ShippingScreen = {
  after_render: () => {
    const waitForIntlTelInput = setInterval(() => {
      if (window.intlTelInput) {
        clearInterval(waitForIntlTelInput);
        const phoneInput = document.querySelector('#phone');
        const iti = window.intlTelInput(phoneInput, {
          initialCountry: 'us', // default to United States 🇺🇸
          separateDialCode: true,
          preferredCountries: ['us', 'eg', 'sa', 'ae'], 
          utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js',
        });

        document
          .getElementById('shipping-form')
          .addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!iti.isValidNumber()) {
              alert('Invalid phone number! Make sure you are entering a correct international number.');
              return;
            }

            setShipping({
              address: document.getElementById('address').value,
              city: document.getElementById('city').value,
              postalCode: document.getElementById('postalCode').value,
              country: document.getElementById('country').value,
              phone: iti.getNumber(), 
            });

            document.location.hash = '/payment';
          });
      }
    }, 100);
  },

  render: () => {
    const { name } = getUserInfo();
    if (!name) {
      document.location.hash = '/';
    }
    const { address, city, postalCode, country } = getShipping();
    return `
      ${CheckoutSteps.render({ step1: true, step2: true })}
      <div class="shipping-box">
        <div class="shipping-title">Shipping</div>
        <form id="shipping-form" autocomplete="off">
          <div class="input-box-shipping">
            <input type="text" id="address" value="${address}" required />
            <label for="address">Address</label>
            <i class='bx bx-home icon'></i>
          </div>

          <div class="input-box-shipping">
            <input type="text" id="city" value="${city}" required />
            <label for="city">City</label>
            <i class='bx bx-buildings icon'></i>
          </div>

          <div class="input-box-shipping">
            <input type="text" id="postalCode" value="${postalCode}" required />
            <label for="postalCode">Postal Code</label>
            <i class='bx bx-map icon'></i>
          </div>

          <div class="input-box-shipping">
            <input type="text" id="country" value="${country}" required />
            <label for="country">Country</label>
            <i class='bx bx-world icon'></i>
          </div>

          <div class="input-box-shipping">
            <input type="tel" id="phone" required />
            <label for="phone">Phone</label>
            
          </div>

          <div class="input-box-shipping">
            <button type="submit" class="btn-submit">
              Continue <i class='bx bx-right-arrow-alt'></i>
            </button>
          </div>
        </form>
      </div>
    `;
  }, 
};

export default ShippingScreen;
