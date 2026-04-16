# PierreMusic – Creator Platform

Een platform waarmee YouTubers (creators) geld kunnen verdienen door YouTube Shorts te maken met specifieke nummers uit campagnes. Admins keuren shorts goed, houden statistieken bij en beheren uitbetalingen.

---

## Wat doet de applicatie?

1. **Creator registreert zich** en koppelt zijn YouTube-kanaal.
2. **Dagelijkse scraper** haalt automatisch alle shorts op van de afgelopen 5 dagen van elk gekoppeld kanaal (elke nacht om 01:00 UTC).
3. **Admin keurt shorts goed of af** via de Review-pagina.
4. **Goedgekeurde shorts** worden bijgehouden: views, likes en reacties worden dagelijks bijgewerkt (02:15 UTC).
5. **Verdiensten** worden berekend op basis van campagne-RPM (betaling per 1000 views) en de gekoppelde campagne.
6. **Uitbetalingen** kunnen worden aangevraagd en worden beheerd door de admin.

---

## Tech stack

| Laag        | Technologie                        |
|-------------|------------------------------------|
| Backend     | Java 21, Spring Boot 3.3.2         |
| Database    | PostgreSQL                         |
| Frontend    | React (Vite), React Router, Recharts |
| Auth        | JWT (RS256)                        |
| E-mail      | Resend API                         |
| Deployment  | Docker / Docker Compose            |

---

## Projectstructuur

```
youtubeAPI/
├── src/                          # Java Spring Boot backend
│   └── main/java/com/example/soundtracker/
│       ├── api/                  # REST controllers
│       ├── auth/                 # JWT & security configuratie
│       ├── domain/               # JPA entities (ShortVideo, YoutubeChannel, ...)
│       ├── repo/                 # Spring Data repositories
│       ├── scheduler/            # Geplande taken (scraper & stats refresh)
│       ├── service/              # Business logica
│       └── youtube/              # YouTube API & Innertube integratie
├── frontend/                     # React frontend
│   └── src/
│       ├── components/           # Layout, ProtectedRoute
│       └── pages/
│           ├── creator/          # Creator-pagina's (stats, kanalen, shorts, ...)
│           └── admin/            # Admin-pagina's (review, campagnes, users, ...)
├── docker-compose.yml
├── Dockerfile
└── pom.xml
```

---

## Rollen

| Rol     | Toegang                                                                 |
|---------|-------------------------------------------------------------------------|
| `USER`  | Eigen kanalen beheren, shorts inzien, verdiensten bekijken, uitbetaling aanvragen |
| `ADMIN` | Alles van USER + shorts goedkeuren/afkeuren, campagnes beheren, gebruikers en uitbetalingen beheren |

---

## Dagelijkse automatische taken

| Tijd (UTC) | Taak                                                                 |
|------------|----------------------------------------------------------------------|
| 01:00      | Scrape alle gekoppelde YouTube-kanalen op nieuwe shorts (laatste 5 dagen) |
| 02:15      | Ververs statistieken (views/likes/reacties) van alle goedgekeurde shorts |

---

## Lokaal draaien

### Vereisten
- Docker & Docker Compose
- Java 21 (voor lokale backend development)
- Node.js 18+ (voor lokale frontend development)

### Met Docker

```bash
docker-compose up --build
```

De applicatie is beschikbaar op `http://localhost:8080`.

### Omgevingsvariabelen

Maak een `.env` bestand of stel deze variabelen in:

```env
YOUTUBE_API_KEY=jouw_youtube_api_key
JWT_SECRET=minimaal_32_tekens_lang_secret
PGHOST=localhost
PGPORT=5432
PGDATABASE=soundtracker
PGUSER=soundtracker
PGPASSWORD=soundtracker
RESEND_API_KEY=jouw_resend_api_key
MAIL_FROM=noreply@jouwdomein.nl
APP_BASE_URL=http://localhost:8080
ENCRYPTION_KEY=jouw_encryptie_sleutel
```

---

## API (kort overzicht)

| Endpoint                              | Methode | Beschrijving                        |
|---------------------------------------|---------|-------------------------------------|
| `/api/auth/register`                  | POST    | Registreren                         |
| `/api/auth/login`                     | POST    | Inloggen (geeft JWT terug)          |
| `/api/me/channels`                    | GET     | Eigen kanalen ophalen               |
| `/api/me/channels`                    | POST    | Kanaal koppelen                     |
| `/api/me/channels/{id}/scrape`        | POST    | Handmatig kanaal scrapen            |
| `/api/shorts/pending`                 | GET     | Shorts die wachten op goedkeuring   |
| `/api/shorts/{id}/sound-used`         | PATCH   | Short goedkeuren of afkeuren        |
| `/api/campaigns`                      | GET     | Actieve campagnes bekijken          |
| `/api/me/earnings`                    | GET     | Verdiensten inzien                  |
