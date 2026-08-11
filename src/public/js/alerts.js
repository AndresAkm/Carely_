document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.toast').forEach(el => {
    new bootstrap.Toast(el, { autohide: true, delay: 4000 }).show();
  });
});
