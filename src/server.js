import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ContactMessage from './models/ContactMessage.js';

const app = express();
const port = Number(process.env.PORT) || 3000;
const mongoUri = process.env.MONGODB_URI;
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(currentDirectory, '..', 'public');

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'style-src': ["'self'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
    },
  },
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(publicDirectory));

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.post('/api/contact', async (request, response, next) => {
  const { name, email, subject = '', message } = request.body ?? {};
  const values = {
    name: typeof name === 'string' ? name.trim() : '',
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    subject: typeof subject === 'string' ? subject.trim() : '',
    message: typeof message === 'string' ? message.trim() : '',
  };

  if (values.name.length < 2 || values.name.length > 80) {
    return response.status(400).json({ error: 'Please enter a name between 2 and 80 characters.' });
  }
  if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    return response.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (values.subject.length > 120) {
    return response.status(400).json({ error: 'Please keep the subject under 120 characters.' });
  }
  if (values.message.length < 10 || values.message.length > 3000) {
    return response.status(400).json({ error: 'Please enter a message between 10 and 3,000 characters.' });
  }
  if (mongoose.connection.readyState !== 1) {
    return response.status(503).json({ error: 'The contact form is temporarily unavailable. Please email me instead.' });
  }

  try {
    await ContactMessage.create(values);
    return response.status(201).json({ message: 'Thanks for reaching out. I’ll be in touch soon.' });
  } catch (error) {
    return next(error);
  }
});

app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'That API endpoint was not found.' });
});

app.use((error, _request, response, _next) => {
  console.error('Request failed:', error.message);
  response.status(500).json({ error: 'Something went wrong. Please try again.' });
});

async function startServer() {
  if (mongoUri) {
    mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10_000 })
      .then(() => console.info('Connected to MongoDB'))
      .catch((error) => console.error(`MongoDB unavailable: ${error.message}`));
  } else {
    console.warn('MONGODB_URI is missing. The site will run, but contact messages cannot be saved.');
  }

  app.listen(port, () => {
    console.info(`Portfolio running at http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Could not start the portfolio: ${error.message}`);
  process.exitCode = 1;
});
