# 🖥️ GoHtmx

![Go](https://img.shields.io/badge/Go-1.25-00ADD8?style=flat&logo=go&logoColor=white)
![HTMX](https://img.shields.io/badge/HTMX-1.9.10-3D72D7?style=flat&logo=htmx&logoColor=white)
![Alpine.js](https://img.shields.io/badge/Alpine.js-3.13.5-8BC0D0?style=flat&logo=alpinedotjs&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-r128-000000?style=flat&logo=threedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat&logo=postgresql&logoColor=white)
![NGINX](https://img.shields.io/badge/NGINX-1.27-009639?style=flat&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker_Compose-2496ED?style=flat&logo=docker&logoColor=white)

Micro-stack Go + HTMX + Alpine.js + Trhree.js: un'esperienza desktop-like servita direttamente da template HTML lato server, con autenticazione via email e sessioni, il tutto containerizzato dietro NGINX.

## ✨ Features

- 🔐 **Autenticazione basata Email** - Registrazione e login con verifica email tramite SMTP
- 📧 **Token di verifica scadenti** - Link di conferma che scadono dopo 24 ore
- 🎨 **Desktop-like UI** - Interfaccia desktop virtuale con Alpine.js e Three.js
- 📁 **File Manager** - Gestione file persistenti con upload/download via API REST
- 💬 **Clippy AI Agent** - Assistente virtuale con TTS (Text-to-Speech) integrato
- 📊 **Metric & Telemetry** - Raccolta dati canvas fingerprint e network info (IP geolocation)
- 🌍 **Network Detection** - Rilevamento IP pubblico, timezone, ASN, VPN/Proxy detection
- 🖥️ **Multi-app Desktop Environment** - Terminal emulato, Editor, Viewer GLTF, Inspector, Creator
- 🔄 **Live Session Management** - Sessioni persistenti basate su HMAC-SHA256 con cookie httpOnly
- 🌐 **API RESTful** - Endpoint per file management, network info, desktop apps
- 📱 **Responsive Frontend** - Compatibile con desktop e mobile (Alpine.js + HTMX over-the-wire)
- 🐳 **Containerizzato** - Setup Docker Compose con PostgreSQL, Go app, NGINX reverse proxy
- 🔒 **HTTPS con TLS** - Certificati auto-generati durante il build


## Comandi

```bash
sudo systemctl start docker
sudo make all
docker compose -f srcs/docker-compose.yml -p gohtmx logs go-app
docker compose -f srcs/docker-compose.yml exec nginx \
  openssl x509 -in /etc/nginx/ssl/gohtmx.crt -text -noout | grep "Subject:"
sudo docker compose -p gohtmx --project-directory srcs -f srcs/docker-compose.yml exec postgres psql -U <POSTGRES_USER> -d <POSTGRES_DB>
    \dt                             -- lista tabelle
    \d nome_tabella                 -- descrizione colonne di una tabella
    SELECT * FROM utenti LIMIT 10;  -- guarda le righe (adatta il nome tabella) 
    SELECT id, ip_address, city, canvas_hash, os, created_at FROM client_telemetry ORDER BY created_at DESC LIMIT 5;
```

## Punteggi

| Modulo (da PDF) | Tipo | Punti | File e Funzioni di Riferimento | Giustificazione Tecnica e Logica di Implementazione |
| :--- | :--- | :--- | :--- | :--- |
| **IV.6 Gaming & UX: Advanced 3D Graphics** | **Major** | **2** | `clippy.js`, ` gtlfloader.js`, `three.js` | Rendering 3D interattivo tramite Three.js con `WebGLRenderer`, camera prospettica, luci ambientali e direzionali. Carica un asset esterno `.glb` (`clippy.glb`), ne calcola il bounding box per scalarlo proporzionalmente e implementa un `AnimationMixer` per riprodurre le animazioni ossee. Include un listener per l'evento `mousemove` che calcola la differenza angolare tra il cursore e il centro del canvas per ruotare dinamicamente il modello 3D, simulando lo sguardo verso l'utente. |
| **IV.3 User Management: User activity analytics and insights** | **Minor** | **1** | `handlers/007.go`, `metric.js`, `db.go` | Raccolta e storicizzazione persistente dei metadati dei dispositivi degli utenti nel database PostgreSQL (tabella `client_telemetry`). L'applicazione raccoglie lato client l'hash del canvas, le informazioni WebGL (vendor/renderer), la risoluzione dello schermo, i core CPU e la memoria, inviandoli all'endpoint `/api/telemetry` tramite `SaveTelemetryHandler` che li associa all'indirizzo email dell'utente registrato, incrociandoli con l'IP reale e i dati di geolocalizzazione geografica. Ciò crea uno storico strutturato ideale per l'analisi statistica dei client connessi. |
| **IV.1 Web: File upload and management system** | **Minor** | **1** | `handlers/files.go`, `desktop-file-ops.js` | Implementazione completa delle operazioni CRUD per i file nel database. Il backend Go impone limiti di dimensione stringenti (massimo 42KB per file tramite `http.MaxBytesReader`) e restrizioni sulle estensioni autorizzate (`.txt`, `.md`). Il frontend in Alpine.js gestisce il drag and drop nativo dall'OS dell'utente leggendo il contenuto tramite `FileReader` e inviando i dati in formato JSON strutturato alle API protette dal middleware di autenticazione. |
| **IV.4 AI: Voice/speech integration** | **Minor** | **1** | `clippy.js` | Sfrutta l'API nativa del browser `speechSynthesis` e la classe `SpeechSynthesisUtterance` per riprodurre vocalmente i messaggi generati dall'agente virtuale Clippy, impostando i parametri regionali su `it-IT` per una pronuncia corretta delle stringhe dinamiche. |
| **IV.1 Web: Server-Side Rendering (SSR)** | **Minor** | **1** | `main.go`, `handlers/handlers.go` | Gestione del rendering dinamico delle viste sul server tramite il pacchetto nativo `html/template` di Go. All'avvio dell'applicazione, tutti i file della directory `templates` vengono compilati ricorsivamente e mappati all'interno della struttura dell'engine Echo (`e.Renderer`), riducendo la necessità di logica di rendering pesante lato client per la costruzione del desktop virtuale. |
| **IV.1 Web: Custom-made design system with reusable components** | **Minor** | **1** | `styles.css`, `templates/apps/` | Sviluppo di un'interfaccia utente interamente personalizzata che emula un ambiente desktop a finestre sovrapposte. Utilizza componenti riutilizzabili e parametrizzati tramite lo stato reattivo di Alpine.js (es. `editor.html`, `viewer.html`, `creator.html`, `terminal.html`, `inspector.html`, `metric.html` che condividono classi strutturali, sistemi di trascinamento coordinati via `@mousedown` e controlli di chiusura). |
| **IV.10 Modules of Choice: Emulated UNIX Shell with OUI Database Lookup** | **Minor** | **1** | `oui.go`, `terminal-interpreter.js`, `mac-fab.txt` | Sviluppo di un emulatore di terminale interattivo nel browser che interpreta comandi comuni (`ls`, `cat`, `whoami`, `neofetch`, `clear`) agendo sullo stato reattivo dell'applicazione. Integra un'applicazione di diagnostica di rete in grado di effettuare il lookup asincrono di indirizzi MAC caricando un file di registro OUI reale (`mac-fab.txt`) in memoria RAM all'avvio del modulo, risolvendo i prefissi dei produttori hardware tramite endpoint dedicato `/api/oui`. |
| **IV.1 Web: Backend Framework** | **Minor** | **1** | `main.go`, `go.mod` | Utilizzo del framework di sviluppo backend strutturato `Echo` per la gestione standardizzata delle rotte, dei gruppi di API, dei middleware di controllo e della gestione centralizzata degli errori HTTP. |

### **Totale Punteggio Attuale Rilevato: 10 / 14 Punti**

---

### Requisiti Obbligatori (Senza Punteggio)
Questi elementi, sebbene complessi, sono requisiti obbligatori richiesti dal Capitolo III e quindi non vengono conteggiati nel punteggio dei moduli opzionali:
* **Autenticazione via Email & Token TTL (Capitolo III.3)**: Implementata in `auth.go`, `tokens.go` e `verify.go` (registrazione, login, hashing con bcrypt e link di attivazione email valido per 24 ore tramite SMTP).
* **Gestione Sessione Sicura (Capitolo III.3)**: Implementata in `session.go` (cookie `httpOnly`, firmato con algoritmo HMAC-SHA256, con parametri di sicurezza `SameSiteLax` e `Secure` attivi).
* **Containerizzazione (Capitolo III.2)**: Configurazione multi-container funzionante in Docker Compose con PostgreSQL 15, Go-app in Alpine 3.20 e NGINX come reverse proxy.

## 🚀 Quick Start su Nuova Macchina

**Per esportare il progetto su un'altra macchina senza bug di portabilità**, vedi [SETUP.md](SETUP.md).
