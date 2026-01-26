export function initForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (form) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const honeypot = document.querySelector('.honeypot');

        function validateField(field) {
            const errorSpan = field.parentElement.querySelector('.form-error');
            const fieldId = field.id;
            const errorId = `${fieldId}-error`;
            
            // Ensure error span has ID for ARIA
            if (errorSpan && !errorSpan.id) {
                errorSpan.id = errorId;
            }

            // Required Check
            if (field.hasAttribute('required') && !field.value.trim()) {
                field.classList.add('error');
                field.classList.remove('success');
                field.setAttribute('aria-invalid', 'true');
                if (errorSpan) {
                    errorSpan.textContent = 'Este campo es requerido';
                    field.setAttribute('aria-describedby', errorId);
                }
                return false;
            }

            // Email Check
            if (field.type === 'email' && field.value.trim()) {
                // RFC 5322 Official Standard Regex (Simplified but robust)
                const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
                
                if (!emailRegex.test(field.value)) {
                    field.classList.add('error');
                    field.classList.remove('success');
                    field.setAttribute('aria-invalid', 'true');
                    if (errorSpan) {
                        errorSpan.textContent = 'Por favor, ingresa un email válido';
                        field.setAttribute('aria-describedby', errorId);
                    }
                    return false;
                }
            }

            // Success State
            field.classList.remove('error');
            field.classList.add('success');
            field.removeAttribute('aria-invalid');
            if (errorSpan) {
                errorSpan.textContent = '';
                field.removeAttribute('aria-describedby');
            }
            return true;
        }

        [nameInput, emailInput, messageInput].forEach(field => {
            if (field) {
                field.addEventListener('blur', () => validateField(field));
                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        validateField(field);
                    }
                });
            }
        });

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (honeypot && honeypot.value) {
                console.log('Spam detected');
                return;
            }

            const isNameValid = validateField(nameInput);
            const isEmailValid = validateField(emailInput);
            const isMessageValid = validateField(messageInput);

            if (!isNameValid || !isEmailValid || !isMessageValid) {
                formStatus.textContent = 'Por favor, corrige los errores';
                formStatus.className = 'form-status status-error';
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            formStatus.textContent = 'Enviando...';
            formStatus.className = 'form-status status-loading';

            // Formspree integration (FREE - 50 submissions/month)
            // To activate: Replace YOUR_FORM_ID with your Formspree form ID
            // Get yours at: https://formspree.io/
            const formData = new FormData(form);
            const formspreeEndpoint = 'https://formspree.io/f/YOUR_FORM_ID';

            fetch(formspreeEndpoint, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
                .then(response => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                    if (btnText) btnText.style.display = 'inline-block';
                    if (btnLoader) btnLoader.style.display = 'none';

                    if (response.ok) {
                        formStatus.textContent = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
                        formStatus.className = 'form-status status-success';
                        form.reset();

                        [nameInput, emailInput, messageInput].forEach(field => {
                            if (field) {
                                field.classList.remove('error', 'success');
                                const errorSpan = field.parentElement.querySelector('.form-error');
                                if (errorSpan) errorSpan.textContent = '';
                            }
                        });

                        setTimeout(() => {
                            formStatus.className = 'form-status'; // Hide by removing status class
                        }, 5000);
                    } else {
                        response.json().then(data => {
                            formStatus.textContent = data.error || 'Hubo un error al enviar el mensaje. Intenta nuevamente.';
                            formStatus.className = 'form-status status-error';
                        });
                    }
                })
                .catch(error => {
                    submitBtn.classList.remove('loading');
                    formStatus.textContent = 'Error de conexión. Por favor, verifica tu internet e intenta nuevamente.';
                    formStatus.className = 'form-status status-error';
                    console.error('Form submission error:', error);
                });
        });
    }
}
