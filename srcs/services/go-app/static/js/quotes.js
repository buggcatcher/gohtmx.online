const ClippyQuotesManager = {
    // 1. Definizione dei set di frasi divisi per contesto (flag)
    quoteSets: {
        // Contesto A: Schermata iniziale / form di login-registrazione
        index: [
            "Hai provato a spegnere e riacendere?",
            "No, 123 non va bene come password.",
            "La porta del server è protetta da certificati SSL sicuri!"
        ],

        // Contesto B: Desktop visibile senza finestre o applicazioni aperte
        desktop_empty: [
            "Perché non crei un file facendo click con il tasto destro?",
            "Ci sono 10 tipi di persone al mondo: chi capisce il binario e chi no.",
            "Nessun programmatore è stato maltrattato per la scrittura di questo codice.",
            "Sei felice?",
            "Per anni ho coltivato patate, solo ora comprendo che in realtà sono state loro a coltivare me.",
            "Questo sfondo l'ho scelto personalmente per te.",
            "Trascina un file .txt o .md dal tuo computer per caricarlo al volo!"
        ],

        // Contesto C: Finestra del Terminale di sistema aperta
        terminal: [
            "Ah, vedo che sei un tipo da riga di comando! Prova a digitare 'neofetch'.",
            "Attenzione con quei comandi, non vorrai mica mandare in crash la mia CPU?",
            "Con il comando 'clear' puoi ripulire la cronologia sullo schermo.",
            "Scrivere 'cat <file>' ti mostrerà il contenuto del file all'istante!"
        ],

        // Contesto D: Finestra del Sistema Diagnostico (Metric Auditor) aperta
        metric: [
            "Interessante... Un'impronta browser unica!",
            "Guarda quante metriche del tuo dispositivo sono riuscito ad estrarre!",
            "Sto incrociando i dati da vari endpoint..."
        ],

        // Contesto E: Finestra Editor di testo aperta
        editor: [
            "Stai scrivendo qualcosa di importante? Ricordati di salvare le modifiche!",
            "Prendere appunti o programmare... l'importante è farlo con cura.",
            "Attenzione a non fare typo nel codice!",
            "Ricorda che l'editor è in sola lettura se sei entrato come Guest."
        ],

        // Contesto F: Finestra Visualizzatore Markdown aperta
        viewer: [
            "RTFM!",
            "Ecco la struttura formattata del file .md.",
            "I grassetti e gli elenchi puntati si aggiornano in tempo reale.",
            "Leggere documentazione... è un'ottima abitudine!"
        ]
    },

    // 2. Struttura per tracciare la memoria di esclusione degli indici in base al contesto attivo
    usedIndices: {
        index: [],
        desktop_empty: [],
        terminal: [],
        metric: [],
        editor: [],
        viewer: []
    },

    init() {
        const container = document.getElementById('clippy-container');
        if (!container) return;

        container.addEventListener('click', () => {
            this.speakRandomQuote();
        });
    },

    // 3. Algoritmo di rilevamento dinamico del contesto (flag)
    getContext() {
        const desktopEl = document.querySelector('.desktop-workspace');
        if (!desktopEl) {
            return 'index';
        }

        try {
            // Se siamo nell'area desktop, interroghiamo lo stato reattivo di Alpine
            if (window.Alpine) {
                const desktopData = Alpine.$data(desktopEl);
                if (desktopData) {
                    if (desktopData.terminal && desktopData.terminal.show) {
                        return 'terminal';
                    }
                    if (desktopData.metric && desktopData.metric.show) {
                        return 'metric';
                    }
                    if (desktopData.editor && desktopData.editor.show) {
                        return 'editor';
                    }
                    if (desktopData.viewer && desktopData.viewer.show) {
                        return 'viewer';
                    }

                    // Verifica se ci sono altre finestre o applicazioni secondarie aperte
                    const isAnyWindowOpen = 
                        (desktopData.creator && desktopData.creator.show) ||
                        (desktopData.inspector && desktopData.inspector.show);

                    if (!isAnyWindowOpen) {
                        return 'desktop_empty';
                    }
                }
            }
        } catch (e) {
            console.warn("[ClippyQuotes] Errore durante l'interrogazione dello stato Alpine:", e);
        }

        // Fallback di sicurezza in caso di errore
        return 'desktop_empty';
    },

    // 4. Algoritmo randomico ad esclusione per ogni singolo contesto
    speakRandomQuote() {
        const context = this.getContext();
        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 480;

        // Disattiva il click su Clippy solo se siamo nella schermata iniziale (index) e su un dispositivo mobile
        if (context === 'index' && isMobile) {
            return;
        }

        const currentSet = this.quoteSets[context] || this.quoteSets['desktop_empty'];

        // Inizializza l'array degli indici utilizzati se non è ancora presente
        if (!this.usedIndices[context]) {
            this.usedIndices[context] = [];
        }

        // Quando tutte le frasi del contesto corrente sono state lette, resetta il ciclo di esclusione
        if (this.usedIndices[context].length === currentSet.length) {
            this.usedIndices[context] = [];
            console.log(`[ClippyQuotes]: Ripristinato ciclo casuale per il set "${context}".`);
        }

        // Individua solo gli indici non ancora usati nel ciclo corrente
        const availableIndices = [];
        for (let i = 0; i < currentSet.length; i++) {
            if (!this.usedIndices[context].includes(i)) {
                availableIndices.push(i);
            }
        }

        // Estrae un indice casuale tra quelli ancora disponibili
        const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
        
        // Registra l'indice per non ripeterlo
        this.usedIndices[context].push(randomIndex);

        // Preleva il testo corrispondente e lo fa pronunciare a Clippy
        const quoteText = currentSet[randomIndex];
        if (window.ClippyAgent && typeof window.ClippyAgent.say === 'function') {
            window.ClippyAgent.say(quoteText, { tts: true, delay: 6000 });
        }
    }
};

// Inizializzazione sicura al caricamento del DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClippyQuotesManager.init());
} else {
    ClippyQuotesManager.init();
}