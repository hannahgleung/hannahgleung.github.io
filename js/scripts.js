console.log("Hello, welcome to my portfolio website")

function menuToggle() {
    var x = document.getElementById('myNavtoggle');
    if (x.className === 'navtoggle' && $(window).width() < 640) {
      x.className += ' responsive';
    } else {
        x.className = 'navtoggle';
    }
}