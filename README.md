# 🫧 FizzQuiz

A full-stack, web-based **multiplayer trivia game** — a faithful clone of the Steam
game *FizzQuiz* by Moon, tuned for a Malayalam-speaking NRI audience with a blend of
🌍 **Global** and 🇮🇳 **Cultural** questions.

Built with React + Vite + TailwindCSS on the front end, Node + Express + Socket.IO on
the back end, and SQLite (via `better-sqlite3`) for a **1,050-question** offline bank.

---

## ✨ Features

- **Real-time multiplayer** (up to 10 players) over Socket.IO, plus a fully client-side **Solo / Challenge mode**.
- **All 7 round types**, each with distinct mechanics and styling:
  1. **Classic** — 4-option MCQ, speed bonus.
  2. **Image** — emoji pictogram that de-blurs over 3s.
  3. **Cropped Image** — heavily zoomed pictogram that zooms out over time.
  4. **Audio** — a melody synthesized in-browser (Web Audio) that you identify.
  5. **Speed** — 8s timer, double points, 3× combo at a 5-streak.
  6. **True or False** — big TRUE/FALSE buttons.
  7. **Final Countdown** — boss round, 5s, optional sudden death, shared 500-pt bonus.
- **Server-authoritative** timers and scoring — clients never see the answer until reveal, and never compute their own score.
- **1,050 hand-written questions** across 15 topics, each blending **Set A (Global)** and **Set B (Indian / Malayali / NRI cultural)** questions, tagged `classic` / `cultural`.
- **Scoring**: base + linear speed bonus + streak bonuses (3/5/10) + speed combo multiplier.
- **Polish**: animated bubble/gradient background, 3D "pop" buttons, confetti on correct, red-shake on wrong, floating `+points`, SVG countdown ring, animated scoreboard rank changes, podium.
- **Lobby**: 6-char room code, QR join code, invite link, player list, lobby chat, host controls, reconnect support.
- **Settings**: display name, avatar (color + emoji), volume, mute, **colorblind mode**, **high-contrast mode**, and the **Question Mix filter** (All / 🌍 Global / 🇮🇳 Cultural).
- **Accessibility**: A/B/C/D (and T/F) keyboard hotkeys, ARIA labels on timer/score, visible focus rings.
- **Personal Best** tracking per topic via `localStorage` (Solo mode).

---

## 🧱 Project structure

```
/client          → React + Vite front end
/server          → Node + Express + Socket.IO back end
/server/db       → SQLite DB, schema, question bank (15 topic files) + seed script
/server/sockets  → Socket.IO room registry + game engine
/shared          → Constants + scoring logic shared by client and server
```

---

## 🚀 Getting started

### Prerequisites
- Node.js 18+ (developed on Node 22)

### 1. Install everything
```bash
npm install        # installs root + server + client (via postinstall)
# or explicitly:
npm run install:all
```

### 2. Seed the database (1,050+ questions)
```bash
npm run seed
```
You should see a summary ending with `✅ 1050 questions seeded (target 1000+ met).`

### 3. Run the app (server + client together)
```bash
npm run dev
```
- Client: http://localhost:5173
- Server/API: http://localhost:3001

Open the client, set a nickname, and pick **Create Lobby**, **Join Game**, or **Solo Play**.
To play multiplayer locally, open a second browser tab/window (or scan the lobby QR code
on your phone if on the same network) and join with the room code.

---

## 🔧 Environment variables

Copy `.env.example` to `.env` (a copy also lives in `/server` for the server process):

```
PORT=3001
CLIENT_URL=http://localhost:5173
# No API keys required — all questions are pre-seeded in the database.
```

---

## 📦 NPM scripts (root)

| Script                | What it does                                   |
|-----------------------|------------------------------------------------|
| `npm run dev`         | Runs server + client concurrently              |
| `npm run dev:server`  | Server only (`node --watch`)                   |
| `npm run dev:client`  | Client only (Vite)                             |
| `npm run seed`        | (Re)seeds the SQLite database                  |
| `npm run build`       | Production build of the client                 |
| `npm run start`       | Starts the server in production mode           |
| `npm run install:all` | Installs root, server and client dependencies  |

---

## 🧠 The question bank

- 15 topics × ~70 questions = **1,050 questions**, all written out in full in
  `/server/db/questions/*.js` — no placeholders, no procedural generation.
- Each topic merges **Set A (Global / Classic)** and **Set B (Indian / Malayali / NRI Cultural)**.
  Topics that are inherently global (History, Science, Geography, Mathematics, Art, Nature,
  Mythology Set A) run two "waves" of classic questions; cultural-heavy topics lean into
  Mollywood, Bollywood, Indian music/sports/food, OTT, memes and Malayalam language.
- Every question is `{ topic, difficulty, source, question, options[4], correct, explanation }`.
- The **🌍 Global / 🇮🇳 Cultural** flag tag is shown on every question card (cosmetic only).
- The seed script validates every row (4 options, valid correct index, valid difficulty/source).

### Image / Cropped / Audio rounds (fully offline)
Since the brief forbids external question APIs and API keys, the visual/audio rounds are
self-contained:
- **Image & Cropped** rounds use large **emoji pictograms** (`/server/db/specialQuestions.js`)
  with blur-reveal and zoom-out effects.
- **Audio** round plays short, well-known **public-domain melodies** synthesized with the
  Web Audio API (no audio files needed).

---

## 🕹️ How scoring works

- **Base points** vary by round (Classic 100, Speed 200, Cropped up to 300, Final 200, …).
- **Speed bonus** scales linearly: full bonus at 0s elapsed → 0 at the time limit.
- **Streak bonus** per correct answer: 3-streak → +50, 5-streak → +100, 10-streak → +200.
- **Speed combo**: 3× multiplier once you hit a 5-in-a-row during the Speed round.
- **Final round**: optional **sudden death** (wrong = eliminated); if all remaining players
  answer a question correctly, they split a **500-point** bonus equally.
- Streak resets on a wrong answer. Wrong answers score 0 (no penalty, except sudden death).

Scoring lives in `/shared/scoring.js` so the server (multiplayer) and client (solo) agree.

---

## 🔌 Socket.IO events

Client → server: `create_room`, `join_room`, `update_config`, `player_ready`,
`start_game`, `submit_answer`, `chat_message`, `play_again`, `leave_room`.

Server → client: `room_update`, `player_joined`, `round_intro`, `question`,
`player_answered`, `reveal`, `scoreboard`, `game_end`, `chat_message`, `returned_to_lobby`.

All game state lives on the server; clients are thin and display state / send inputs.
Disconnected players are kept in the game and can rejoin with the same name; empty rooms
are cleaned up after 60 seconds.

---

## 🛠️ Tech stack

**Frontend:** React, Vite, TailwindCSS, Framer Motion, canvas-confetti, qrcode.react,
Web Audio API (with Howler available), Socket.IO client.

**Backend:** Node.js, Express, Socket.IO, better-sqlite3.

**Shared:** Plain ESM constants + scoring imported by both sides.

---

Made with 🫧 — *Global 🌍 + Malayali 🇮🇳 trivia. Grab your crew. Fizz it out.*
