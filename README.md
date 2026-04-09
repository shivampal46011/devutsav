# 🙏 DevUtsav

Sacred spiritual tools, Kundali Dosha analysis, daily horoscope, Nandi Whisper, and divine marketplace for pujas and chadhawas.

## Project Structure

```
devutsav/
├── backend/          # Express + MongoDB + AWS Bedrock API
├── sattva-qwik/      # Qwik City frontend (SSR, primary)
├── sattva/           # React + Vite frontend (SPA, legacy)
└── package.json      # Root scripts for unified dev workflow
```

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Bun** (for backend dev server)
- **MongoDB** connection (Atlas or local)
- **AWS credentials** (for Bedrock AI models)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/shivampal46011/devutsav.git
cd devutsav

# 2. Install all dependencies
npm run install:all

# 3. Configure environment variables
cp backend/.env.example backend/.env
cp sattva-qwik/.env.example sattva-qwik/.env
# Edit the .env files with your actual keys

# 4. Start both backend + frontend with ONE command
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run backend + Qwik frontend together |
| `npm run dev:react` | Run backend + React SPA frontend together |
| `npm run backend` | Run only the backend |
| `npm run frontend` | Run only the Qwik frontend |
| `npm run install:all` | Install deps for all subprojects |

### Ports

- **Backend API**: `http://localhost:5001`
- **Qwik Frontend**: `http://localhost:5173`
- **React Frontend**: `http://localhost:5173` (when using `dev:react`)

## Tech Stack

- **Backend**: Express, MongoDB/Mongoose, AWS Bedrock (Claude), LangChain
- **Frontend (Primary)**: Qwik City, Tailwind CSS, SSR
- **Frontend (Legacy)**: React 19, Vite, Tailwind CSS
- **Analytics**: PostHog
