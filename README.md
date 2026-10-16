# Hemanth 69013 — Personal Portfolio

A responsive portfolio built with semantic HTML, CSS, browser JavaScript, Node.js, Express, and MongoDB. The contact form saves messages to MongoDB.

## Run in VS Code

1. Install Node.js 20.19 or later. Start a local MongoDB server or configure MongoDB Atlas if you want contact messages saved; the portfolio page can still run while MongoDB is unavailable.
2. Open this `portfolio` folder in VS Code.
3. Install dependencies once in the integrated terminal:

   ```powershell
   npm install
   ```

4. Run `npm.cmd run dev` in the integrated terminal. When the server is ready, the site opens in Chrome automatically at [http://localhost:3000](http://localhost:3000).

If you use MongoDB Atlas, copy `.env.example` to `.env` and replace `MONGODB_URI` with your connection string. Keep `.env` private. When MongoDB is disconnected, the page still loads and the contact form reports that saving is unavailable.

The React contact form is written in `app.jsx` and bundled to `public/app.js` during `npm run dev`, `npm start`, or `npm run build`.

## Make it yours

Edit `public/index.html` to update the name, bio, skills, project details, social links, and contact email. The three sample projects are concept examples. Replace them with your own work and links. Adjust the visual style in `public/styles.css`.

The Express server serves the page and accepts `POST /api/contact`. Valid contact messages are stored in the `contactmessages` collection in the database named by `MONGODB_URI`. `GET /api/health` reports whether the database connection is ready.
