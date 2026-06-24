# Lathund — Projekt X

## Teknikstack

| Del | Teknologi |
|---|---|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Databas | Supabase (PostgreSQL i molnet) |
| ORM | Prisma |
| API-docs | Swagger (`/api/docs`) |

---

## Kom igång (ny i teamet)

### 1. Installera Node.js
Ladda ner och installera från https://nodejs.org (välj LTS-versionen)

### 2. Klona repot
```bash
git clone https://github.com/Jaymzpham/projektX.git
cd projektX
```

### 3. Skapa din .env-fil
```bash
cd backend
copy .env.example .env
```
Öppna `backend/.env` och ersätt `[YOUR-PASSWORD]` med lösenordet du fått av James.

### 4. Installera paket och starta

**Terminal 1 — Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 5. Öppna appen
| | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:4000/api |
| API-docs | http://localhost:4000/api/docs |

---

## Paket som installeras automatiskt via npm install

### Backend (`backend/package.json`)
| Paket | Syfte |
|---|---|
| express | Webbserver |
| dotenv | Läser .env-filen |
| prisma / @prisma/client | Databashantering |
| jsonwebtoken | Auth-tokens |
| cors | Tillåter anrop från frontend |
| swagger-jsdoc + swagger-ui-express | API-dokumentation |
| typescript + ts-node-dev | TypeScript-stöd |
| uuid, zod, ical-generator | Hjälpbibliotek |

### Frontend (`frontend/package.json`)
| Paket | Syfte |
|---|---|
| react + react-dom | UI-ramverk |
| react-router-dom | Routing mellan sidor |
| @tanstack/react-query | Datahämtning från API |
| axios | HTTP-anrop |
| tailwindcss | CSS-styling |
| lucide-react | Ikoner |
| date-fns | Datumformatering |
| jspdf + html2canvas | PDF-export |
| vite | Dev-server och byggverktyg |

---

## Projektstruktur

```
projektX/
├── backend/
│   ├── src/
│   │   ├── index.ts            ← Servern startar här
│   │   ├── lib/prisma.ts       ← Databaskoppling
│   │   └── routes/
│   │       ├── projects.ts     ← Projekt-API
│   │       ├── activities.ts   ← Aktiviteter-API
│   │       ├── resources.ts    ← Resurser-API
│   │       ├── raid.ts         ← Risker, issues, beslut
│   │       └── share.ts        ← Extern delning
│   ├── prisma/
│   │   ├── schema.prisma       ← Databasmodeller
│   │   └── seed.ts             ← Exempeldata
│   ├── .env.example            ← Mall (fyll i lösenord)
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.tsx             ← Routing
    │   ├── components/         ← Layout, StatusBadge
    │   ├── pages/              ← Portfolio, Plan, Management m.fl.
    │   └── lib/
    │       ├── api.ts          ← Alla API-anrop
    │       └── utils.ts        ← Hjälpfunktioner
    └── package.json
```

---

## Vanliga kommandon

```bash
# Starta backend
cd backend && npm run dev

# Starta frontend
cd frontend && npm run dev

# Ladda in exempeldata (kör en gång)
cd backend && npm run seed

# Uppdatera databasen efter schema-ändringar
cd backend && npx prisma db push
```

---

## GitHub-workflow

```bash
# Hämta senaste koden
git pull

# Spara dina ändringar
git add .
git commit -m "Beskriv vad du gjort"
git push
```

---

## Viktigt

- `.env` pushas **aldrig** till GitHub — den innehåller lösenordet
- Alla i teamet delar **samma Supabase-databas**
- Seed-datan behöver bara köras **en gång** (annars dubbleras datan)
- Kontakta James för Supabase-lösenordet
