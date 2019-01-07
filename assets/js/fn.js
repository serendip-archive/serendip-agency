function init() {
  setTimeout(() => {
    AOS.init();

    const navToggleButton = document.getElementById("nav-toggle");
    const nav = document.getElementById("nav");

    document.getElementById("loader").classList.add("fade-out");
    setTimeout(() => {
      document.getElementById("loader").classList.add("hidden");
    }, 500);

    document.body.classList.add("scroll");

    navToggleButton.onclick = () => {
      navToggleButton.classList.toggle("active");
      nav.classList.toggle("active");
      document.body.classList.toggle("nav-active");
      setTimeout(() => {
        nav.classList.toggle("fadeIn");
      }, 10);
    };
  }, 500);
}

window.onload = function() {
  init();
};
