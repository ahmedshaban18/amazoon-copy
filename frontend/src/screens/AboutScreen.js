// frontend/screens/AboutScreen.js
const AboutScreen = {
  render: async () => {
    return `
      <section class="about-hero">
        <div class="about-hero-text">
          <h1>About Us</h1>
          <p>Learn more about who we are and what we do.</p>
        </div>
      </section>

      <section class="about-content">
        <div class="container">
          <h2>Our Story</h2>
          <p>
            Welcome to our store! We are passionate about bringing you the best products with top quality 
            and affordable prices. Our mission is to make shopping easy, fun, and accessible for everyone.
          </p>
          <p>
            Since our start, we have focused on delivering excellent customer service, fast delivery, and 
            unique collections that you won’t find anywhere else.
          </p>
        </div>
      </section>

      <section class="about-team">
        <div class="container">
          <h2>Our Values</h2>
          <div class="team-grid">
            <div class="team-card">
              <h3>Quality</h3>
              <p>We ensure every product meets high quality standards before it reaches you.</p>
            </div>
            <div class="team-card">
              <h3>Innovation</h3>
              <p>We keep evolving, bringing you the latest trends and ideas in shopping.</p>
            </div>
            <div class="team-card">
              <h3>Support</h3>
              <p>Your satisfaction is our priority. We’re here to help you 24/7.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  },
};

export default AboutScreen;
