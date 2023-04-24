
const API_URL = 'http://localhost:5004/api';
if (window.innerWidth < 768) {
	[].slice.call(document.querySelectorAll('[data-bss-disabled-mobile]')).forEach(function (elem) {
		elem.classList.remove('animated');
		elem.removeAttribute('data-bss-hover-animate');
		elem.removeAttribute('data-aos');
		elem.removeAttribute('data-bss-parallax-bg');
		elem.removeAttribute('data-bss-scroll-zoom');
	});
}

document.addEventListener('DOMContentLoaded', function() {
	if ('AOS' in window) {
		AOS.init();
	}

	var hoverAnimationTriggerList = [].slice.call(document.querySelectorAll('[data-bss-hover-animate]'));
	var hoverAnimationList = hoverAnimationTriggerList.forEach(function (hoverAnimationEl) {
		hoverAnimationEl.addEventListener('mouseenter', function(e){ e.target.classList.add('animated', e.target.dataset.bssHoverAnimate) });
		hoverAnimationEl.addEventListener('mouseleave', function(e){ e.target.classList.remove('animated', e.target.dataset.bssHoverAnimate) });
	});
}, false);

// select the form element
const registerForm = document.querySelector('form');

// add an event listener for the form submission
registerForm.addEventListener('submit', (event) => {
  event.preventDefault(); // prevent the form from submitting

  // get the form data
  const name = document.querySelector('#name-2').value;
  const email = document.querySelector('#email-2').value;
  const password = document.querySelector('#password').value;

  // create a new user object
  const user = {
    name: name,
    email: email,
    password: password
  };

  // make a POST request to the server to add the user
  fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify (user)
  })
  .then(response => response.json())
  .then(data => {
    // handle the response from the server
    console.log(data);
  })
  .catch(error => {
    // handle errors
    console.error(error);
  });
});
