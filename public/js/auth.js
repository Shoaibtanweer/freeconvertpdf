// File: public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Dark Mode Persistence (copied from main.js for standalone pages) ---
    const htmlElement = document.documentElement;
    const applyAuthPageDarkMode = () => {
        if (localStorage.getItem('darkMode') === 'true' ||
            (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
    };
    applyAuthPageDarkMode(); // Apply on initial load for login/register pages


    // --- Login Form ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            const messageDiv = document.getElementById('login-message'); // For displaying messages

            if (messageDiv) messageDiv.textContent = ''; // Clear previous messages

            console.log('Attempting login with:', { email });

            try {
                const response = await fetch('/api/users/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || `Login failed with status: ${response.status}`);
                }

                console.log('Login successful:', data);
                // Store token (e.g., in localStorage) and redirect
                localStorage.setItem('userInfo', JSON.stringify(data)); // Includes token and user details
                // Potentially store the token separately if that's your preference
                // localStorage.setItem('token', data.token); 
                
                if (messageDiv) {
                    messageDiv.textContent = 'Login successful! Redirecting...';
                    messageDiv.className = 'text-sm text-green-600 dark:text-green-400 mb-4 text-center';
                }
                window.location.href = '/'; // Redirect to homepage or dashboard
            } catch (error) {
                console.error('Login error:', error);
                if (messageDiv) {
                    messageDiv.textContent = `Login failed: ${error.message}`;
                    messageDiv.className = 'text-sm text-red-600 dark:text-red-400 mb-4 text-center';
                } else {
                    alert(`Login failed: ${error.message}`);
                }
            }
        });
    }

    // --- Register Form ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm['confirm-password'].value;
            const messageDiv = document.getElementById('register-message'); // For displaying messages

            if (messageDiv) messageDiv.textContent = ''; // Clear previous messages

            if (password !== confirmPassword) {
                if (messageDiv) {
                    messageDiv.textContent = 'Passwords do not match!';
                    messageDiv.className = 'text-sm text-red-600 dark:text-red-400 mb-4 text-center';
                } else {
                    alert('Passwords do not match!');
                }
                return;
            }

            console.log('Attempting registration with:', { username, email });

            try {
                const response = await fetch('/api/users/register', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password }),
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || `Registration failed with status: ${response.status}`);
                }
                console.log('Registration successful:', data);
                
                if (messageDiv) {
                    messageDiv.textContent = 'Registration successful! Please login.';
                    messageDiv.className = 'text-sm text-green-600 dark:text-green-400 mb-4 text-center';
                } else {
                    alert('Registration successful! Please login.');
                }
                // Redirect to login page after a short delay to allow user to see the message
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } catch (error) {
                console.error('Registration error:', error);
                if (messageDiv) {
                    messageDiv.textContent = `Registration failed: ${error.message}`;
                    messageDiv.className = 'text-sm text-red-600 dark:text-red-400 mb-4 text-center';
                } else {
                    alert(`Registration failed: ${error.message}`);
                }
            }
        });
    }
});