const Footer = {
  render: () => {
    return `
      <footer class="new-footer">
        <div class="footer-wrapper">

          <!-- Brand -->
          <div class="footer-section brand">
            <h2 class="footer-logo">LOGO</h2>
            <p>Building trust with quality products and smooth delivery.</p>
          </div>

          <!-- Quick Links -->
          <div class="footer-section links">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/#/aboutus">About Us</a></li>
              <li><a href="#">Delivery Info</a></li>
              <li><a href="/#/faq">FAQ</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="footer-section contact">
            <h4>Contact</h4>
            <p>Bolaq Eldakror, 6th October, Ahmed Ibrahim St.</p>
            <p>01116397484 / 01146902397</p>
            <p>Mon - Sat: 10 AM - 6 PM</p>
          </div>

          <!-- Install App -->
          <div class="footer-section install">
            <h4>Get Our App</h4>
            <p>From App Store or Google Play</p>
            <div class="row-install">
              <img src="images/appStore.png" alt="App Store">
              <img src="images/googlePlay.png" alt="Google Play">
            </div>
            <p>Secured Payment Gateways</p>
            <img class="payment-photo" src="images/paypal_footer.png" alt="Payments">
          </div>
        </div>

        <!-- Bottom -->
        <div class="footer-bottom">
          <p>© 2025 All Rights Reserved | Made with ❤ by <span>Ahmed</span></p>
          <div class="footer-socials">
            <a href="#"><i class="fab fa-facebook-f"></i></a>
            <a href="#"><i class="fab fa-twitter"></i></a>
            <a href="#"><i class="fab fa-instagram"></i></a>
            <a href="#"><i class="fab fa-github"></i></a>
          </div>
        </div>
      </footer>
    `;
  },
};

export default Footer;
