if (window.module) {
  module = window.module;
}
site.onLoad(() => {
  setTimeout(() => {
    document.querySelectorAll('.loaded').forEach((el) => {
      el.classList.remove('loaded');
    });
  }, 1000);
});
