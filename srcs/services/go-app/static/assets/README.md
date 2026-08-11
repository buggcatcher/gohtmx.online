# Solar City: uno spazio di collaborazione digitale

Benvenuto in **Solar City**, un ambiente desktop virtuale e interattivo progettato come spazio digitale volto alla collaborazione, alla condivisione di risorse e alla diagnostica di rete in tempo reale. 

![Solar City Workspace](https://i.giphy.com/3o7abFpd91G18NYtpe.webp)

Questo file serve per mostrare le caratteristiche sintattiche del parser markdown che viene usato per i file `*.md`.

---

## 👥 Regolamento e Modalità d'Uso

### 1. Limiti della Modalità Guest (Sola Lettura)
> [!IMPORTANT]
> Se hai effettuato l'accesso come **Guest**, hai i permessi di sola lettura. Puoi esplorare il desktop, visualizzare i documenti e utilizzare il terminale, ma non puoi creare, modificare o eliminare file sul database persistente.

*   **Sblocco Scrittura**: Registrati con una mail valida e clicca sul link di conferma per attivare il tuo account e sbloccare le piene funzionalità di scrittura collegate a PostgreSQL.

### 2. Trascinamento Documenti (Drag & Drop)
*   Puoi trascinare file `.txt` o `.md` dal tuo sistema operativo reale direttamente sullo sfondo del desktop per caricarli istantaneamente.
*   **Limite di Sicurezza**: La dimensione massima consentita per singolo caricamento è di **42 KB** [^1].

---

## 📟 Showcase delle Funzionalità del Parser Markdown

Il nostro motore di rendering supporta lo standard GFM (GitHub Flavored Markdown) insieme ad estensioni matematiche, note a piè di pagina e blocchi speciali di avviso.

### Il Syntax Highlight per i blocchi di codice E ancora da fare

```javascript
// Esempio di inizializzazione della telemetria in Solar City
const clientMetrics = {
    canvasHash: metricCollector.getCanvasHash(),
    cores: navigator.hardwareConcurrency,
    isOnline: navigator.onLine
};
console.log("Telemetry initialized:", clientMetrics);
```

### Formattazione del Testo e Scorciatoie Emoji

Puoi combinare diversi stili per enfatizzare i concetti:
*   Testo in **grassetto** (`**grassetto**`) e in *corsivo* (`*corsivo*`).
*   Testo ***grassetto e corsivo*** per un'enfasi maggiore.
*   Testo ~~barrato~~ per indicare modifiche o eliminazioni.
*   Codice inline: `const api = "/api/files";` per evidenziare variabili o funzioni.
*   Scorciatoie Emoji integrate: :rocket: (avvio immediato), :warning: (avvisi importanti), :bulb: (suggerimenti), :lock: (sicurezza delle sessioni), :robot: (agente Clippy).

---

### Blocchi di Avviso (GitHub Alerts)

Sfrutta i blocchi di citazione speciali per richiamare l'attenzione del lettore su punti chiave:

> [!NOTE]
> Questo è un avviso informativo standard, ideale per annotazioni generali o note di configurazione del server.

> [!TIP]
> Ecco un suggerimento utile: usa il tasto destro sullo sfondo del desktop per aprire il Terminale emulato e digita `neofetch`.

> [!WARNING]
> Attenzione: la sessione utente scade automaticamente dopo 7 giorni di inattività.

---

### Tabelle GFM con Allineamento

| Funzionalità | Stato Sviluppo | Priorità | Allineamento |
| :--- | :---: | ---: | :--- |
| File System Remoto | Completato | Alta | Sinistra |
| Crittografia Sessioni | Attivo | Critica | Centro |
| Sintesi Vocale TTS | Attivo | Media | Destra |

---

### Liste Annidate e Elenchi di Attività

1.  **Infrastruttura Principale**
    *   [x] Configurazione PostgreSQL 15
    *   [x] Certificati SSL su porta 443
    *   [ ] Integrazione di un mailer server di backup
2.  **Interfaccia Utente (UI)**
    *   [x] Rendering dell'agente 3D Clippy tramite Three.js
    *   [x] Supporto Drag & Drop dei file `.md`

---

### Riferimenti e Collegamenti

*   **Link Diretto**: [Sito Ufficiale Go](https://golang.org)
*   **Link in stile Riferimento**: Visita la documentazione di [Echo][echo-framework] o consulta la repo di [HTMX][htmx-lib].

[echo-framework]: https://echo.labstack.com "Framework Web per Go"
[htmx-lib]: https://htmx.org "Libreria HTMX"

[^1]: Questo limite è calcolato per prevenire l'esaurimento della memoria allocata ai buffer del server Go (`http.MaxBytesReader`).