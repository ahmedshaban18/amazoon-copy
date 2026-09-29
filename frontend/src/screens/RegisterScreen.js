import { register } from '../api';
import { getUserInfo } from '../localStorage';
import { showLoading, hideLoading, showMessage, redirectUser } from '../utils';

const RegisterScreen = {
  after_render: () => {
    document.getElementById('register-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      showLoading();
      const data = await register({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      });
      hideLoading();
      if (data.error) {
        showMessage(data.error);
      } else {
        document.location.hash = `/verify/${data._id}`; 
        showMessage("Verification code has been sent to your email.");
      }
    });
  },
  render: () => {
    if (getUserInfo().name) {
      redirectUser();
    }
    return `
    <div class="small-body-form">
    <div class="wrapper">
  <div class="form-header">
    <div class="titles">
      <div class="title-register">Register</div>
      </div>
    </div>
    <form action="#" class="register-form" id="register-form" autocomplete="off">

    <!--name input-->
    <div class="input-box">
        <input type="text" class="input-field" id="name" required id="reg-name">
        <label for="reg-name" class="label">Username</label>
        <i class='bx bx-user icon'></i>
      </div>



      <!--email input-->
      <div class="input-box">
        <input type="text" class="input-field" id="email" required id="reg-email">
        <label for="reg-email" class="label">Email</label>
        <i class='bx bx-envelope icon'></i>
      </div>

      <!--password input-->
      <div class="input-box">
        <input type="password" class="input-field" id="password" required id="reg-pass">
        <label for="reg-pass" class="label">Password</label>
        <i class='bx bx-lock-alt icon'></i>
      </div>

      <!--colums and Forget password-->
      <!---<div class="form-cols">
        <div class="col-1">
        <input type="checkbox" id="agree">
        <label for="agree">I agree to terms and condition
        </div>
        <div class="col-2"></div>
      </div>-->

      <!--btn submit-->
      <div class="input-box">
        <button type="submit" class="btn-submit" id="SignUpBtn">Sign up  <i class='bx bx-log-out'></i></button>
      </div>

      <div class="switch-form">
        <span>Already have an account? <a href="/#/signin">Login</a></span>
      </div>
    </form>
  </div>
</div>

    `;
  },
};
export default RegisterScreen;
