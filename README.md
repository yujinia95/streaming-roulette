# Streaming Roulette

A spinning wheel web app for deciding what to watch. Pick a streaming provider, country, content type, and genre, and the wheel picks from a small batch of real matching titles, pulled from [TMDB](https://www.themoviedb.org/).

**Live**: https://streaming-roulette.netlify.app

## Stack

- **Backend**: Flask (Python), proxies calls to the TMDB API
- **Frontend**: vanilla HTML/CSS/JS (ES modules, no build step)
- **Free services used**: [TMDB API](https://www.themoviedb.org/settings/api) (title data), [Formspree](https://formspree.io) (feedback form), [Google reCAPTCHA](https://www.google.com/recaptcha/admin) (spam protection on feedback), [Abacus](https://abacus.jasoncameron.dev) (spin counter)

## Local setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in real values, see below
python run.py
```

Runs at `http://127.0.0.1:5000`.

### Frontend

Must be served over `http://`, not opened directly as a file (the JS uses ES modules, which browsers block on `file://`). Any static server works, e.g. VS Code's Live Server extension, or:

```bash
cd frontend
python -m http.server 5500
```

Then open `http://127.0.0.1:5500` (or `http://localhost:5500`; pick one and be consistent, since browsers treat them as different origins for CORS).

## Environment variables (`backend/.env`)

| Variable | What it's for |
|---|---|
| `TMDB_API_KEY` | Free key from [TMDB's API settings](https://www.themoviedb.org/settings/api) |
| `FRONTEND_ORIGIN_LOCAL` | The exact origin the frontend is served from locally (e.g. `http://127.0.0.1:5500`), used for CORS |
| `COUNTER_NAMESPACE` / `COUNTER_KEY` | Namespace/key for the free Abacus hit counter API; any unique strings, made up by you, not issued by anyone |

## Deployment

- **Backend → Render**
- **Frontend → Netlify**

Render's free tier sleeps after 15 minutes of inactivity, so the first request after idle takes 30 to 50 seconds to wake up.
