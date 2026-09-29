import { getUserInfo, setPayment } from '../localStorage';
import CheckoutSteps from '../components/CheckoutSteps';

const PaymentScreen = {
  after_render: () => {
    document
      .getElementById('payment-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        const paymentMethod = document.querySelector(
          'input[name="payment-method"]:checked'
        ).value;
        setPayment({ paymentMethod });
        document.location.hash = '/placeorder';
      });
  },
  render: () => {
    const { name } = getUserInfo();
    if (!name) {
      document.location.hash = '/';
    }
    return `
    ${CheckoutSteps.render({ step1: true, step2: true, step3: true })}

    <div class="small-body-form">
    <div class="wrapper-payment">
      <div class="form-header">
        <div class="titles">
          <div class="title-login">Payment</div>
        </div>
      </div>

      <form id="payment-form" class="login-form">
        <div class="category-payement">

       

          <input type="radio" name="payment-method" value="paypal" id="paypal">
          <label for="paypal" class="PaypalMethod input-box-payment">
            <div class="imgName">
              <div class="imgContainers">
                <img src="images/paypal.png" alt="">
              </div>
              <span class="name-pay">PAYPAL</span>
            </div>
          </label>


        <div class="input-box">
          <button type="submit" class="btn-submit">Continue <i class='bx bx-credit-card'></i></button>
        </div>
      </form>
    </div>
  </div>
    `;
  },
};
export default PaymentScreen;
