import { forgotPassword } from '../api';
import { showLoading, hideLoading, showMessage } from '../utils';

const ForgetPasswordScreen = {
  after_render: () => {
    document
      .getElementById('forget-password-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();
        const email = document.getElementById('email').value;
        const data = await forgotPassword(email);
        hideLoading();
        if (data.error) {
          showMessage(data.error);
        } else {
          showMessage('Reset link has been sent to your email.');
        }
      });
  },
  render: () => {
    return `
    <div class="small-body-form">
      <div class="wrapper-forget">
        <div class="form-header">
          <div class="titles">
            <div class="title-login">Forgot</div>
          </div>
        </div>

        <form id="forget-password-form" class="login-form" autocomplete="off">
          <!-- Email input -->
          <div class="input-box">
            <input type="email" class="input-field" id="email" required>
            <label for="email" class="label">Email Address</label>
            <i class='bx bx-envelope icon'></i>
          </div>

          <!-- Submit button -->
          <div class="input-box">
            <button type="submit" class="btn-submit">Send Reset Link <i class='bx bx-mail-send'></i></button>
          </div>

          <!-- Back to login -->
          <div class="switch-form">
            <span>Remembered your password? <a href="/#/signin">Login</a></span>
          </div>
        </form>
      </div>
    </div>
    `;
  },
};

export default ForgetPasswordScreen;
