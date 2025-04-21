// JavaScript for Smooth Scrolling on the web page 
//Particularly useful when trying to move around multiple hyperlinks within the web page 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth"
      });
    });
  });
  