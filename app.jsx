import { Fragment, useState } from 'react';
import { createRoot } from 'react-dom/client';

const fields = [
  ['name', 'YOUR NAME', 'input', { autoComplete: 'name', required: true, minLength: 2, maxLength: 80, placeholder: 'What should I call you?' }],
  ['email', 'EMAIL ADDRESS', 'input', { type: 'email', autoComplete: 'email', required: true, maxLength: 254, placeholder: 'you@example.com' }],
  ['subject', 'WHAT’S THIS ABOUT?', 'input', { maxLength: 120, placeholder: 'A project, a question, a hello...' }],
  ['message', 'A LITTLE MORE', 'textarea', { required: true, minLength: 10, maxLength: 3000, rows: 4, placeholder: 'Give me the interesting details...' }],
];

function ContactForm() {
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setSending(true);
    setStatus('Sending your note…');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Your note could not be sent. Please try again.');
      setStatus(result.message);
      form.reset();
    } catch (error) {
      const subject = encodeURIComponent(values.subject || `Portfolio enquiry from ${values.name}`);
      const body = encodeURIComponent(`${values.message}\n\nFrom: ${values.name}\nEmail: ${values.email}`);
      setStatus('Opening your email app to send this note.');
      window.location.href = `mailto:hello@mayachen.design?subject=${subject}&body=${body}`;
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" id="contact-form" onSubmit={submit}>
      {fields.map(([id, label, tag, props]) => (
        <Fragment key={id}>
          <label htmlFor={id}>{label}{id === 'subject' && <span>OPTIONAL</span>}</label>
          {tag === 'textarea'
            ? <textarea id={id} name={id} {...props} />
            : <input id={id} name={id} {...props} />}
        </Fragment>
      ))}
      <div className="form-submit">
        <p id="form-status" role="status" aria-live="polite">{status}</p>
        <button className="button button-light" type="submit" disabled={sending} aria-busy={sending}>
          {sending ? 'Sending…' : 'Send your note'} <span aria-hidden="true">↗</span>
        </button>
      </div>
    </form>
  );
}

const root = document.querySelector('#contact-form-root');
if (root) createRoot(root).render(<ContactForm />);
const year = document.querySelector('#copyright-year');
if (year) year.textContent = new Date().getFullYear();
