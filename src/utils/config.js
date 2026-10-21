// One place for the backend address.
// Netlify/Vercel: set VITE_API_URL = https://YOUR-BACKEND.onrender.com/api  (then redeploy)
// Local dev: falls back to http://localhost:4000/api
const raw =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:4000/api" : "");

if (!raw && !import.meta.env.DEV) {
  console.error("VITE_API_URL is not set. Add it in your hosting dashboard and redeploy.");
}

export const API_URL = raw.replace(/\/+$/, "");
