# Projekt X — Projekthanteringsverktyg

Modern projektplaneringsapplikation med Gantt, beroenden, resurser och managementvy.

## Starta applikationen

### Krav
- Docker Desktop installerat och igång

### Start

```bash
# 1. Kopiera miljövariabler
cp .env.example .env

# 2. Starta alla tjänster
docker compose up --build

# 3. Ladda in exempeldata (kör en gång)
docker compose exec backend npm run seed
```

Applikationen är tillgänglig på:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000/api
- **Swagger-dokumentation:** http://localhost:4000/api/docs

---

## Demo-flöde

1. **Portfölj** → Se exempelprojekten "Kundportal v2" och "Datamigrering ERP"
2. **Öppna projekt** → Klicka på "Kundportal v2"
3. **Plan/Gantt** → Byt zoom (1/3/6/12 mån), se aktiviteter och milstolpar
4. **Beroenden** → Scrolla ned på Plan-sidan för att se beroendetabell
5. **Resurser** → Se resurshierarki Domain → Tribe → Team → Person
6. **Management** → Se dashboard med risker, milstolpar och issues
7. **Presentation** → Klicka "Presentation" för helskärmsläge
8. **PDF-export** → Klicka "PDF" inne i presentationsläget
9. **Extern delning** → Klicka "Dela" för en read-only share-länk
10. **Kalender** → Klicka "ICS" för att ladda ner milstolpar

---

## Kända begränsningar

- Ingen drag-and-drop i Gantt (kräver datuminmatning i formulär)
- Ingen autentisering/inloggning (demo-läge)
- Ingen full Jira-integration (ej implementerat)
- PDF-export baseras på skärmbild av presentationsläget
- Inga notifieringar eller e-post

---

## Projektstruktur

```
├── frontend/          # React + TypeScript + Vite + Tailwind
├── backend/           # Node.js + Express + TypeScript + Prisma
│   └── prisma/        # Databasschema + seed-data
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## API-dokumentation

Fullständig Swagger-dokumentation finns på: `http://localhost:4000/api/docs`

### Viktiga endpoints

| Metod | Endpoint | Beskrivning |
|---|---|---|
| GET | /api/projects | Lista alla projekt |
| POST | /api/projects | Skapa nytt projekt |
| GET | /api/projects/:id | Hämta projekt med detaljer |
| PUT | /api/projects/:id | Uppdatera projekt |
| DELETE | /api/projects/:id | Ta bort projekt |
| GET | /api/activities/:projectId | Lista aktiviteter |
| POST | /api/activities | Skapa aktivitet |
| POST | /api/activities/:id/dependencies | Lägg till beroende |
| GET | /api/resources/hierarchy | Resurshierarki |
| GET | /api/resources/team-summary | Resursbehov per team |
| GET | /api/raid/:projectId/risks | Lista risker |
| POST | /api/raid/:projectId/risks | Skapa risk |
| GET | /api/raid/:projectId/issues | Lista issues |
| GET | /api/raid/:projectId/decisions | Beslutslogg |
| POST | /api/projects/:id/share | Generera share-token |
| GET | /api/share/:token | Hämta delat projekt (read-only) |
| GET | /api/projects/:id/export/ics | Exportera milstolpar som .ics |
