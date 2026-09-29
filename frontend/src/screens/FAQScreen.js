const FAQScreen = {
  render: async () => {
    return `
      <section class="faq-container">
        <h1 class="faq-title">Frequently Asked Questions</h1>
        <div class="faq">
          <div class="faq-item">
            <button class="faq-question">What is this website about?</button>
            <div class="faq-answer">
              <p>This website is an e-commerce platform where you can browse and purchase products easily.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">How can I track my order?</button>
            <div class="faq-answer">
              <p>You can track your order by visiting the "My Orders" section in your profile after logging in.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">What payment methods are supported?</button>
            <div class="faq-answer">
              <p>We support PayPal, Paddle, and Cash on Delivery depending on your location.</p>
            </div>
          </div>
          <div class="faq-item">
            <button class="faq-question">How do I contact customer support?</button>
            <div class="faq-answer">
              <p>You can contact us through the "Contact Us" page or by emailing support@example.com.</p>
            </div>
          </div>
        </div>
      </section>
    `;
  },
  after_render: () => {
    const questions = document.querySelectorAll(".faq-question");
    questions.forEach((btn) => {
      btn.addEventListener("click", () => {
        const answer = btn.nextElementSibling;
        btn.classList.toggle("active");
        if (btn.classList.contains("active")) {
          answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
          answer.style.maxHeight = null;
        }
      });
    });
  },
};

export default FAQScreen;
