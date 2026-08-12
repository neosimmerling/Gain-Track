# GainTrack

Selbst gehostete Fitness-Tracking-App. Erfasse Trainings, sieh Trends, teile
mit Freunden nur generische Erfolge ("3x diese Woche im Gym") – nie deine
echten Trainingsdaten.

## Architektur

- **backend/** – FastAPI + SQLite, JWT-Auth
- **frontend/** – React (Vite) PWA, installierbar auf dem iPhone-Homescreen
- **docker-compose.yml** – startet beides zusammen, Daten landen in einem
  Docker-Volume auf deinem Raspberry Pi

Jeder Nutzer sieht ausschließlich seine eigenen Workouts/Sätze. Freunde
bekommen nur Zugriff auf eine separate `milestones`-Tabelle mit
vorformulierten, nicht-sensiblen Meldungen (Wochenzähler, neue PRs) – die
eigentlichen Gewichte/Wiederholungen werden dafür nie ausgelesen.

## Lokal entwickeln

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev
```

Frontend läuft dann auf `http://localhost:5173`, Backend auf
`http://localhost:8000`. Setze in `frontend/.env.local`:
```
VITE_API_URL=http://localhost:8000
```

## Deployment auf dem Raspberry Pi

Auf dem Pi muss Docker + Docker Compose installiert sein (`curl -fsSL
https://get.docker.com | sh`).

```bash
git clone <dein-repo-url> gaintrack
cd gaintrack
cp .env.example .env
nano .env   # SECRET_KEY setzen! z.B. mit: openssl rand -hex 32
docker compose up -d --build
```

Die App ist danach unter `http://<pi-ip>:8080` erreichbar.

### Von unterwegs / vom iPhone zugreifen

Empfehlung: **Tailscale** auf dem Pi installieren
(`curl -fsSL https://tailscale.com/install.sh | sh`) und auf dem iPhone die
Tailscale-App installieren. Dann ist der Pi unter seiner Tailscale-IP/-Domain
erreichbar, ganz ohne offene Ports im Router.

### App auf dem iPhone installieren (PWA)

1. Im Safari die GainTrack-URL öffnen
2. Teilen-Button → "Zum Home-Bildschirm"

Die App verhält sich danach wie eine native App (eigenes Icon, kein
Browser-UI).

## Updates einspielen

```bash
cd gaintrack
git pull
docker compose up -d --build
```

## Backups

Die SQLite-Datenbank liegt im Docker-Volume `gaintrack-data`. Sichern z.B. mit:

```bash
docker run --rm -v gaintrack_gaintrack-data:/data -v $(pwd):/backup \
  alpine cp /data/gaintrack.db /backup/gaintrack-backup-$(date +%F).db
```

## Nächste Ausbaustufen

- Körpergewicht/Maße tracken
- Trainingspläne & Vorlagen
- CSV-Export / Apple-Health-Import
- Push-Benachrichtigungen bei neuen Freundes-Meilensteinen
- Umstieg auf Postgres, falls SQLite mal eng wird
