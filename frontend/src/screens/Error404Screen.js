const Error404Screen = {
  render: () => {
    return `
      <div class="error-container">
        <h1>404</h1>
        <p>Oops! The page you are looking for does not exist.</p>
        <a href="/#/" class="home-btn">Go Back Home</a>
      </div>
    `;
  },
};

export default Error404Screen;
