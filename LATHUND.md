# Lathund — Projekt X

## Vad vi byggt

Ett projekthanteringsverktyg (ersätter Excel) med Gantt, beroenden, resurser och managementvy.
Körs lokalt via Docker. Ingen installation behövs utöver Docker Desktop.

---

## Teknikstack

| Del | Teknologi | Varför |
|---|---|---|
| Frontend | React + TypeScript + Vite | Modernt, stort ekosystem, samma språk som backend |
| Styling | Tailwind CSS | Snabbt att bygga clean UI utan att skriva CSS-filer |
| Backend | Node.js + Express + TypeScript | JavaScript hela vägen, enkelt att komma igång |
| Databas | PostgreSQL | Robust relationsdatabas, branschstandard |
| ORM | Prisma | Skriver JavaScript istället för SQL, autocompletion i VS Code |
| API-docs | swagger-ui-express | Genererar dokumentation automatiskt från koden |
| Docker | Docker Compose | Startar frontend + backend + databas med ett kommando |

---

## Projektstruktur

```
Projekt X/
├── docker-compose.yml      ← Startar alla tjänster
├── .env                    ← Lösenord och config (delas INTE på GitHub)
├── .env.example            ← Mall för .env (delas på GitHub)
├── .gitignore              ← Vad som inte pushas till GitHub
├── README.md               ← Startinstruktioner + API-lista
├── LATHUND.md              ← Den här filen
│
├── backend/
│   ├── src/
│   │   ├── index.ts        ← Express-app startar här, Swagger konfigureras
│   │   ├── lib/
│   │   │   └── prisma.ts   ← Databaskoppling (används av alla routes)
│   │   └── routes/
│   │       ├── projects.ts     ← CRUD projekt, share-token, ICS-export
│   │       ├── activities.ts   ← CRUD aktiviteter, beroenden, resurstilldelning
│   │       ├── resources.ts    ← Resurshierarki (Domain→Tribe→Team→Person)
│   │       ├── raid.ts         ← Risker, issues, beslut
│   │       └── share.ts        ← Read-only åtkomst via token
│   ├── prisma/
│   │   ├── schema.prisma   ← Databasmodeller (tabeller definieras här)
│   │   └── seed.ts         ← Exempeldata som laddas in
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
└── frontend/
    ├── src/
    │   ├── main.tsx        ← React startar här
    │   ├── App.tsx         ← Routing (vilken URL → vilken sida)
    │   ├── index.css       ← Tailwind importeras här
    │   ├── lib/
    │   │   ├── api.ts      ← Alla anrop till backend samlade här
    │   │   └── utils.ts    ← Hjälpfunktioner (färger, labels)
    │   ├── components/
    │   │   ├── Layout.tsx      ← Sidlayout med navigation
    │   │   └── StatusBadge.tsx ← Färgad status-tagg (GREEN/YELLOW/RED)
    │   └── pages/
    │       ├── Portfolio.tsx       ← Projektlista med sök och filter
    │       ├── ProjectOverview.tsx ← Översiktskort för ett projekt
    │       ├── Plan.tsx            ← Gantt-vy med zoom och beroenden
    │       ├── Resources.tsx       ← Resurshierarki och teamtabell
    │       ├── Management.tsx      ← Dashboard, PDF-export, presentationsläge
    │       └── ShareView.tsx       ← Read-only vy för extern delning
    ├── package.json
    ├── vite.config.ts      ← Vite-config, proxy till backend
    ├── tailwind.config.js
    ├── nginx.conf          ← Nginx serverar React-appen i Docker
    └── Dockerfile
```

---

## Databasmodeller (Prisma schema)

```
Project         ← Ett projekt (namn, status, budget, fas)
  └── Activity  ← Aktivitet eller milstolpe (start, slut, progress)
        └── Dependency      ← Beroende mellan aktiviteter
        └── ActivityResource ← Koppling aktivitet ↔ resurs

Domain → Tribe → Team → Resource   ← Resurshierarki

Risk            ← Risk kopplad till projekt
Issue           ← Issue kopplad till projekt
Decision        ← Beslut i beslutsloggen
ShareToken      ← Token för extern read-only delning
```

---

## Hur Docker fungerar

```
docker compose up --build
```

Det här kommandot:
1. Bygger frontend-imagen (React → Nginx)
2. Bygger backend-imagen (Express + Prisma)
3. Startar PostgreSQL-databasen
4. Kör `prisma db push` — skapar tabeller automatiskt
5. Startar backend på port 4000
6. Startar frontend på port 3000

| Tjänst | URL |
|---|---|
| App (frontend) | http://localhost:3000 |
| API | http://localhost:4000/api |
| Swagger-docs | http://localhost:4000/api/docs |

---

## Vanliga kommandon

```bash
# Starta appen
docker compose up

# Starta och bygg om (efter kodändringar)
docker compose up --build

# Stoppa appen
docker compose down

# Ladda exempeldata (kör en gång)
docker compose exec backend npm run seed

# Se loggar från backend
docker compose logs backend

# Se loggar i realtid
docker compose logs -f backend
```

---

## GitHub-workflow för gruppen

```bash
# En person — ladda upp projektet (görs en gång)
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/NAMN/REPO.git
git push -u origin main

# Övriga — hämta projektet (görs en gång)
git clone https://github.com/NAMN/REPO.git
cd "Projekt X"
copy .env.example .env          # Windows
# cp .env.example .env          # Mac/Linux
docker compose up --build
docker compose exec backend npm run seed

# Daglig workflow
git pull                        # hämta andras ändringar
# ...koda...
git add .
git commit -m "Vad du gjort"
git push

# När någon pushat ny kod
git pull
docker compose up --build       # bygg om med ny kod
```

---

## Lägga till en ny sida / ny funktion

### Ny backend-route

1. Skapa `backend/src/routes/minroute.ts`
2. Registrera i `backend/src/index.ts`:
   ```ts
   import minRoute from './routes/minroute'
   app.use('/api/minroute', minRoute)
   ```

### Ny frontend-sida

1. Skapa `frontend/src/pages/MinSida.tsx`
2. Lägg till i `frontend/src/App.tsx`:
   ```tsx
   import MinSida from './pages/MinSida'
   <Route path="/min-sida" element={<MinSida />} />
   ```
3. Lägg till länk i `frontend/src/components/Layout.tsx`

### Ny databasmodell

1. Lägg till i `backend/prisma/schema.prisma`
2. Kör:
   ```bash
   docker compose exec backend npx prisma db push
   ```

---

## Viktigt att veta

- `.env` pushas **aldrig** till GitHub — den innehåller lösenord
- Varje person i gruppen har sin **egen databas** lokalt
- `docker compose down -v` raderar databasen permanent (undvik)
- Seed-datan behöver bara köras **en gång** per person
