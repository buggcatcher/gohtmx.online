# Solar City: uno spazio di collaborazione digitale

Benvenuto in **Solar City**, qua si possono condividere file di testo.
Quali? Solamente `*.md` e `*.txt` per ora. Se vi facessi caricare `*.pdf` mi buchereste in 0,2 secondi.

Questo file serve solo per mostrare le caratteristiche sintattiche markdown che si possono utilizzare qui.

Puoi aggiungere immagini e gif con la sintassi `![testo](link)`
![Solar City Workspace](https://i.giphy.com/3o7abFpd91G18NYtpe.webp)

---

## Modalità d'Uso

### 1. Limiti della Modalità Guest
> [!IMPORTANT]
> Se hai effettuato l'accesso come **Guest**, hai i permessi di sola lettura. Puoi esplorare il desktop, visualizzare i documenti e utilizzare il terminale, ma non puoi creare, modificare o eliminare file sul database persistente.

*   **Sblocco Scrittura**: Registrati con una mail valida e clicca sul link di conferma per attivare il tuo account e sbloccare le piene funzionalità di scrittura collegate a PostgreSQL.

### 2. Drag & Drop
*   Puoi trascinare file `.txt` o `.md` dal tuo sistema operativo reale direttamente sullo sfondo del desktop per caricarli istantaneamente.
*   **Limite di Sicurezza**: La dimensione massima consentita per singolo caricamento è di **42 KB** [^1].

---

## 📟 Funzionalità del Parser Markdown

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
*   Testo ***grassetto e corsivo*** con un (`***TRIPLO PUNTATORE***`) per un'enfasi maggiore.
*   Testo ~~barrato~~ (`~~così~~`)per indicare modifiche o eliminazioni.
*   Codice inline: `const api = "/api/files";` per evidenziare variabili o funzioni.
*   Scorciatoie Emoji integrate: :rocket: (avvio immediato), :warning: (avvisi importanti), :bulb: (suggerimenti), :lock: (sicurezza delle sessioni), :robot: (agente Clippy).

---

### Blocchi di Avviso

Sfrutta i blocchi di citazione speciali per richiamare l'attenzione del lettore su punti chiave:

> [!TIP]
> Ecco un suggerimento utile: usa il tasto destro sullo sfondo del desktop per aprire il Terminale emulato e digita `neofetch`.

> [!WARNING]
> Attenzione: la sessione utente scade automaticamente dopo 7 giorni di inattività.

---

### Tabelle GFM con Allineamento

| Funzionalità | Stato Sviluppo | Allineamento |
| :--- | :---: | ---: | :--- |
| File System Remoto | Completato | Sinistra |
| Crittografia Sessioni | Attivo | Centro |
| Sintesi Vocale TTS | Attivo | Destra |

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
[autore]: https://github.com/buggcatcher "Github dell'autore"

[^1]: Questo limite è calcolato per prevenire l'esaurimento della memoria allocata ai buffer del server.