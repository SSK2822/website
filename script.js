document.addEventListener('DOMContentLoaded', function () {
    // Smooth Scrolling
    const menuItems = document.querySelectorAll('header nav a');
    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            const section = document.querySelector(e.target.getAttribute('href'));
            section.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Form Validation
    const contactForm = document.querySelector('#contact form');
    contactForm.addEventListener('submit', function (e) {
        const name = document.querySelector('#name').value;
        const email = document.querySelector('#email').value;
        const message = document.querySelector('#message').value;

        if (!name || !email || !message) {
            e.preventDefault();
            alert('Please fill out all fields.');
        }
    });

    // Dynamic Year in Footer
    const yearSpan = document.querySelector('footer p');
    yearSpan.textContent = `© ${new Date().getFullYear()} Shreyash Kawle`;

    // Create the Dark and Light Mode Toggle Button
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Dark/Light Mode';
    toggleButton.classList.add('toggle-mode');
    document.body.appendChild(toggleButton);

    // Function to toggle dark mode
    function toggleDarkMode() {
        document.body.classList.toggle('dark-mode');
        // Update the button text based on the current mode
        if(document.body.classList.contains('dark-mode')) {
            toggleButton.textContent = 'Switch to Light Mode';
        } else {
            toggleButton.textContent = 'Switch to Dark Mode';
        }
    }

    // Event Listener for the Toggle Button
    toggleButton.addEventListener('click', toggleDarkMode);

    // Initial Mode Setup
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If the user has set a browser or OS preference for dark mode
        toggleDarkMode(); // Start with dark mode on
    }

    // Listen for changes in color scheme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if(e.matches) {
            // Switch to dark mode if preference changes
            if(!document.body.classList.contains('dark-mode')) {
                toggleDarkMode();
            }
        } else {
            // Switch to light mode if preference changes
            if(document.body.classList.contains('dark-mode')) {
                toggleDarkMode();
            }
        }
    });
});
