const contactForm = document.querySelector('#contact-form');
const formStatus = document.querySelector('#form-status');

document.querySelector('#copyright-year').textContent = new Date().getFullYear();

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);
  const payload = Object.fromEntries(formData.entries());

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  formStatus.textContent = 'Sending your note…';

  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Your note could not be sent. Please try again.');

    formStatus.textContent = result.message;
    contactForm.reset();
  } catch (error) {
    formStatus.textContent = error.message || 'Your note could not be sent. Please email me directly.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});
