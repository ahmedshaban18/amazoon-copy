import { resetPassword } from '../api';
import { showLoading, hideLoading, showMessage } from '../utils';

const ResetPasswordScreen = {
  after_render: () => {
    document
      .getElementById('reset-password-form')
      .addEventListener('submit', async (e) => {
        e.preventDefault();
        showLoading();

        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
          showMessage('Passwords do not match');
          hideLoading();
          return;
        }

        const hashParts = window.location.hash.split('/');
        const userId = hashParts[2];
        const token = hashParts[3];

        const data = await resetPassword(userId, token, newPassword);
        hideLoading();

        if (data.error) {
          showMessage(data.error);
        } else {
          showMessage('Password updated successfully');
          window.location.href = '/#/signin';
        }
      });
  },
  render: () => {
    return `
    <div class="small-body-form">
      <div class="wrapper-reset">
        <div class="form-header">
          <div class="titles">
            <div class="title-login">Reset</div>
          </div>
        </div>
        <form action="#" class="login-form" id="reset-password-form" autocomplete="off">

          <!--new password-->
          <div class="input-box">
            <input type="password" class="input-field" id="new-password" required>
            <label for="new-password" class="label">New Password</label>
            <i class='bx bx-lock-alt icon'></i>
          </div>

          <!--confirm password-->
          <div class="input-box">
            <input type="password" class="input-field" id="confirm-password" required>
            <label for="confirm-password" class="label">Confirm Password</label>
            <i class='bx bx-lock-alt icon'></i>
          </div>

          <!--btn submit-->
          <div class="input-box">
            <button type="submit" class="btn-submit">Update Password <i class='bx bx-check-shield'></i></button>
          </div>

          <div class="switch-form">
            <span>Back to <a href="/#/signin">Login</a></span>
          </div>
        </form>
      </div>
    </div>
    `;
  },
};

export default ResetPasswordScreen;
