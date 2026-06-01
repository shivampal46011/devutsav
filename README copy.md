# 🙏 DevUtsav

Sacred spiritual tools, Kundali Dosha analysis, daily horoscope, Nandi Whisper, and divine marketplace for pujas and chadhawas.

## Project Structure

```
devutsav/
├── backend/      # Express + MongoDB + AWS Bedrock API
├── sattva-qwik/  # Qwik City frontend (SSR)
└── package.json
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Bun** (for backend dev server)
- **MongoDB** (Atlas or local)
- **AWS credentials** (for Bedrock), if you use AI features

### Setup

```bash
git clone https://github.com/shivampal46011/devutsav.git
cd devutsav
npm run install:all

cp backend/.env.example backend/.env
cp sattva-qwik/.env.example sattva-qwik/.env

npm run dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Backend + Qwik (Vite SSR dev server) |
| `npm run backend` | API only |
| `npm run frontend` | Qwik only |
| `npm run install:all` | Install backend + Qwik deps |

### Ports

- **API**: `http://localhost:5001` (or `PORT` in `backend/.env`)
- **Qwik**: URL printed by Vite (often `http://localhost:5173`)

Set **`PUBLIC_API_URL`** in `sattva-qwik/.env` if the API is not on `http://localhost:5001`.

### Production

- **Backend** serves **JSON APIs** and `/public` assets only (no bundled UI).
- Deploy **Qwik** with a **Node/static adapter** (or a host like Vercel/Netlify) and point it at your API via `PUBLIC_API_URL`.

**Admin** (categories, Markdown upload, publish) is at **`/admin`** in the Qwik app.

## Tech Stack

- **Backend**: Express, MongoDB/Mongoose, AWS Bedrock, LangChain
- **Frontend**: Qwik City, Tailwind CSS, SSR
