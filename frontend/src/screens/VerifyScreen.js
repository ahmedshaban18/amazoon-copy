
import { verifyOTP, signin , resendVerificationCode } from '../api'; 
import { getUserInfo, setUserInfo } from '../localStorage';
import { parseRequestUrl, redirectUser, showMessage } from '../utils';
const VerifyScreen = {
  render: () => {
    const request = parseRequestUrl();
    const userId = request.id;
    if(getUserInfo().name){
      document.location.hash= '/'
    }
    return `
    <div class="small-body-form">
    <div class="wrapper verify-wrapper">
      <div class="form-header">
        <div class="titles">
          <div class="title-login">Verify</div>
        </div>
      </div>
      <form id="verify-form" class="login-form" autocomplete="off">
        <div class="input-box">
          <input type="text" id="verificationCode" class="input-field" required />
          <label for="verificationCode" class="label">Verification Code</label>
          <i class='bx bx-shield-quarter icon'></i>
        </div>
        <div class="input-box">
          <button type="submit" class="btn-submit">Submit <i class='bx bx-check-shield'></i></button>
        </div>
        
      </form>
    </div>
  </div>
    `;
  },
  after_render: () => {
    const request = parseRequestUrl();
    const userId = request.id; 

    document.getElementById('verify-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const verificationCode = document.getElementById('verificationCode').value;

      
      const result = await verifyOTP({ _id: userId, verificationCode });

      if (result.error) {
        alert(result.error);
      } else {
       
        setUserInfo(result.user); 

        
        redirectUser()
      }
    });

    
  },
};

export default VerifyScreen;