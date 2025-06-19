  


  window.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll('.carousel-item');
    const dots = document.querySelectorAll('.dot');
    let index = 0;

    function showSlide(i) {
      items.forEach(item => item.classList.remove('active'));
      dots.forEach(dot => dot.classList.remove('active'));
      items[i].classList.add('active');
      dots[i].classList.add('active');
    }

    function nextSlide() {
      index = (index + 1) % items.length;
      showSlide(index);
    }

    setInterval(nextSlide, 3000);

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        index = i;
        showSlide(index);
      });
    });
  });