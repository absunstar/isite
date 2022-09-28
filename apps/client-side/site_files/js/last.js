if (window.module) {
  module = window.module;
}
site.onLoad(() => {
  document.querySelectorAll('.loaded').forEach((el) => {
    el.classList.remove('loaded');
  });
});
