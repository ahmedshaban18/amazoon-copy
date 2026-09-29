import { signin } from '../api';
import { getUserInfo, setUserInfo } from '../localStorage';
import { showLoading, hideLoading, showMessage, redirectUser } from '../utils';

const SigninScreen = {
  after_render: () => {
    document
      .getElementById('signin-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const data = await signin({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        });
        hideLoading();
        if (data.error) {
          showMessage(data.error);
        } else {
          setUserInfo(data);
          redirectUser();
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
      <div class="title-login">Login</div>
      </div>
    </div>
    <form action="#" class="login-form" id="signin-form" autocomplete="off">

      <!--email input-->
      <div class="input-box">
        <input type="text" class="input-field" id="email" required id="log-email">
        <label for="log-email" class="label">Email</label>
        <i class='bx bx-envelope icon'></i>
      </div>

      <!--password input-->
      <div class="input-box">
        <input type="password" class="input-field" id="password" required id="log-pass">
        <label for="log-pass" class="label">Password</label>
        <i class='bx bx-lock-alt icon'></i>
      </div>

      <!--colums and Forget password-->
      <div class="form-cols">
        <div class="col-1"></div>
        <div class="col-2">
          <a href="/#/forgot-password">Forgot Password</a>
        </div>
      </div>

      <!--btn submit-->
      <div class="input-box">
        <button type="submit" class="btn-submit" id="SignInBtn">Sign in  <i class='bx bx-log-in'></i></button>
      </div>

      <div class="switch-form">
        <span>Don't have an account? <a href="/#/register">Register</a></span>
      </div>
    </form>
  </div>
</div>
    `;
  },
};
export default SigninScreen;
