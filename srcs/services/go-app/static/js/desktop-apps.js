/**
 * Desktop Applications
 * Gestisce l'apertura e la logica delle singole app:
 * - Metric Analyzer
 * - File Viewer (markdown)
 * - File Editor (text)
 * - File Inspector (metadata)
 * - Terminal Emulator
 */

const DesktopApps = {
    /**
     * Apre l'app Metric Analyzer con dati canvas fingerprint e network telemetry
     */
    openmetricAnalyzer(desktop) {
        if (typeof metricCollector !== 'undefined') {
            const clientData = metricCollector.collect();
            desktop.metric.data = clientData;
            
            // Sincronizza i dati nel backend PostgreSQL
            metricCollector.syncWithDatabase(clientData)
                .then(response => {
                    desktop.metric.db_sync_status = response && response.status === "synchronized" ? "Sincronizzato" : "Fallito";
                });
        }
        desktop.metric.show = true;

        // Fetch network telemetry
        fetch('/api/007')
            .then(res => res.json())
            .then(data => {
                desktop.metric.network = data;
            })
            .catch(err => console.error("Errore telemetria:", err));
    },

    /**
     * Apre il Viewer per visualizzare file markdown
     */
    viewFile(desktop, file) {
        desktop.contextMenu.show = false;
        if (!file) return;
        desktop.viewer.targetFile = file;
        desktop.viewer.show = true;
    },

    /**
     * Apre l'Editor per modificare file di testo
     */
    editFile(desktop, file) {
        desktop.contextMenu.show = false;
        if (!file) return;
        desktop.editor.targetFile = file;
        desktop.editor.tempContent = file.content;
        desktop.editor.show = true;
    },

    /**
     * Apre l'Inspector per visualizzare metadati del file
     */
    inspectFile(desktop, file) {
        desktop.contextMenu.show = false;
        if (!file) return;
        desktop.inspector.targetFile = file;
        desktop.inspector.show = true;
    },

    /**
     * Apre il Terminal Emulator
     */
    openTerminal(desktop) {
        desktop.contextMenu.show = false;
        desktop.terminal.show = true;
    },

    /**
     * Gestisce il doppio click su un file:
     * - File markdown: apre Viewer
     * - File di testo: apre Editor
     * - App di sistema (metric): apre Metric Analyzer
     */
    openFile(desktop, file) {
        desktop.contextMenu.show = false;
        if (!file) return;

        if (file.category === 'system') {
            this.openmetricAnalyzer(desktop);
        } else if (file.name.toLowerCase().endsWith('.md')) {
            this.viewFile(desktop, file);
        } else {
            this.editFile(desktop, file);
        }
    },

    /**
     * Esegue un comando nel terminale emulato (supporta promesse asincrone)
     */
    runTerminalCommand(desktop) {
        const rawInput = desktop.terminal.input.trim();
        desktop.terminal.input = '';
        if (!rawInput) return;

        const userPrompt = (desktop.isGuest ? 'guest' : desktop.getUsername(desktop.currentUser).toLowerCase()) + '@' + (desktop.metric.data.os ? desktop.metric.data.os.toLowerCase() : 'solar');

        // Stampa il prompt di comando inviato dall'utente con l'identità corretta
        desktop.terminal.history.push(
            `<span style="color: var(--accent-color);">${userPrompt}:~$</span> ${rawInput}`
        );

        // Se l'interprete restituisce una Promise (es. OUI lookup), gestiamo il rendering differito
        const output = TerminalInterpreter.execute(
            rawInput,
            desktop.files,
            desktop.userIP,
            desktop.currentUser
        );

        if (output === '__CLEAR_SIGNAL__') {
            desktop.terminal.history = [];
            return;
        }

        if (output instanceof Promise) {
            // Mostra un cursore di caricamento
            const tempIndex = desktop.terminal.history.push("<i>Interrogazione del database in corso...</i>") - 1;
            output.then(resolvedOutput => {
                desktop.terminal.history[tempIndex] = resolvedOutput.replace(/\n/g, '<br>');
                this.scrollTerminal(desktop);
            });
        } else {
            desktop.terminal.history.push(output.replace(/\n/g, '<br>'));
            this.scrollTerminal(desktop);
        }
    },

    scrollTerminal(desktop) {
        desktop.$nextTick(() => {
            const screen = document.getElementById('terminal-screen');
            if (screen) screen.scrollTop = screen.scrollHeight;
        });
    },
}