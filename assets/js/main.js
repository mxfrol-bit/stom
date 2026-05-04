// Reveal on scroll
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Soft phone format
document.querySelectorAll('input[type="tel"]').forEach(input => {
  input.addEventListener('focus', () => {
    if (!input.value) input.value = '+7 ';
  });
});


// Premium subtle parallax
window.addEventListener('scroll', () => {
  const y = window.scrollY || 0;
  document.querySelectorAll('.premium-main-photo').forEach((el, i) => {
    el.style.transform = `translateY(${Math.max(-6, Math.min(6, y * 0.01))}px)`;
  });
});
