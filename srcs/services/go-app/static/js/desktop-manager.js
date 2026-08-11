/**
 * Desktop Manager - Component Alpine Principale
 * Gestisce lo stato del desktop virtuale, sincronizzazione DB,
 * finestre UI, context menu, e drag & drop
 */

const initDesktop = () => {
    Alpine.data('desktopManager', (currentUser, isGuest) => ({
        currentUser: currentUser,
        isGuest: isGuest === true || isGuest === 'true' || isGuest === 1 || isGuest === '1',
        userIP: 'Recupero in corso...',
        sessionSeconds: 0,
        dragOver: false,
        
        // File di default (readme asincrono e metric app)
        files: [
            { 
                id: 'readme', 
                name: 'README.md', 
                icon: '/static/assets/readme.webp',
                size: 'Calcolo...', 
                lastModified: '15/07/2026, 22:30:12', 
                type: 'text/markdown', 
                content: 'Caricamento della documentazione di sistema in corso...', 
                creator: 'System', 
                lastEditedBy: null,
                category: 'document'
            },
            { 
                id: 'metric', 
                name: 'fingerprint', 
                icon: '📟', 
                size: '8.4 KB', 
                lastModified: '15/07/2026, 22:30:12', 
                type: 'application/x-executable', 
                content: '', 
                creator: 'System', 
                lastEditedBy: null,
                category: 'system'
            }
        ],
        
        // Stato delle finestre
        contextMenu: { show: false, x: 0, y: 0, targetFile: null },
        editor: { show: false, targetFile: null, tempContent: '', px: 150, py: 120 },
        inspector: { show: false, targetFile: null, px: 200, py: 180 },
        metric: { show: false, px: 80, py: 60, data: {}, network: {}, db_sync_status: 'In attesa...' },
        creator: { show: false, name: '', px: 180, py: 150 },
        viewer: { show: false, targetFile: null, px: 220, py: 100 },
        terminal: { show: false, input: '', history: [], px: 100, py: 80 },

        /**
         * Estrae l'username da un email o identity
         */
        getUsername(identity) {
            if (!identity) return 'Guest';
            return identity.includes('@') ? identity.split('@')[0] : identity;
        },

        /**
         * Inizializzazione: sincronizza file dal DB, carica IP, avvia session timer
         */
        init() {
            // Sincronizza i file persistenti dal database
            fetch('/api/files')
                .then(res => res.json())
                .then(data => {
                    const dbFiles = (data || []).map(f => ({
                        id: 'file-' + f.id,
                        name: f.name,
                        icon: f.name.toLowerCase().endsWith('.md') ? '/static/assets/readme.webp' : '📄',
                        size: this.formatBytes(new Blob([f.content]).size),
                        lastModified: new Date(f.updated_at).toLocaleString('it-IT'),
                        type: f.type,
                        content: f.content,
                        creator: this.getUsername(f.creator),
                        lastEditedBy: f.last_edited_by ? this.getUsername(f.last_edited_by) : null,
                        category: 'document',
                        dbId: f.id
                    }));
                    this.files = [...this.files.filter(f => f.category === 'system' || f.id === 'readme'), ...dbFiles];
                })
                .catch(err => console.error("Errore sincronizzazione database:", err));

            // Carica asincronamente il README.md statico dal server
            fetch('/static/assets/README.md')
                .then(res => {
                    if (!res.ok) throw new Error("File README non trovato sul server");
                    return res.text();
                })
                .then(text => {
                    const readmeFile = this.files.find(f => f.id === 'readme');
                    if (readmeFile) {
                        readmeFile.content = text;
                        readmeFile.size = this.formatBytes(new Blob([text]).size);
                    }
                })
                .catch(err => {
                    console.error("Errore nel caricamento del README statico:", err);
                    const readmeFile = this.files.find(f => f.id === 'readme');
                    if (readmeFile) {
                        readmeFile.content = "Impossibile caricare il file README.md di sistema dal server.";
                    }
                });

            // Carica l'IP pubblico
            fetch('/api/my-ip')
                .then(res => res.text())
                .then(ip => { this.userIP = ip; })
                .catch(() => { this.userIP = '127.0.0.1'; });

            // Messaggio di benvenuto da Clippy
            setTimeout(() => {
                if (this.isGuest) {
                    window.ClippyAgent.say(
                        "Benvenuto nel sistema come Guest. Registrati se desideri sbloccare la persistenza e creare nuovi file!",
                        { tts: true, delay: 5000 }
                    );
                } else {
                    window.ClippyAgent.say(
                        `Bentornato nel sistema, ${this.getUsername(this.currentUser)}!`,
                        { tts: true, delay: 5000 }
                    );
                }
            }, 1000);

            // Sincronizzazione telemetria
            if (!this.isGuest) {
                setTimeout(() => {
                    if (typeof metricCollector !== 'undefined') {
                        const clientData = metricCollector.collect();
                        this.metric.data = clientData;
                        
                        metricCollector.syncWithDatabase(clientData)
                            .then(response => {
                                const isSync = response && response.status === "synchronized";
                                this.metric.db_sync_status = isSync ? "Sincronizzato" : "Fallito";
                                console.log("[Auto-Telemetry] Sincronizzazione automatica eseguita:", this.metric.db_sync_status);
                            })
                            .catch(err => {
                                console.error("[Auto-Telemetry] Errore sinc:", err);
                                this.metric.db_sync_status = "Fallito";
                            });
                    }
                }, 3000);
            }

            setInterval(() => {
                this.sessionSeconds++;
            }, 1000);
        },
        
        /**
         * Formatta il tempo di sessione (h:m:s)
         */
        formatSessionTime() {
            const h = Math.floor(this.sessionSeconds / 3600);
            const m = Math.floor((this.sessionSeconds % 3600) / 60);
            const s = this.sessionSeconds % 60;
            return `${h}h ${m}m ${s}s`;
        },

        /**
         * Formatta bytes in KB, MB, ecc.
         */
        formatBytes(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * Mostra il context menu al click destro
         */
        showContextMenu(event, file) {
            this.contextMenu.show = true;
            this.contextMenu.x = event.clientX;
            this.contextMenu.y = event.clientY;
            this.contextMenu.targetFile = file;
        },

        /**
         * Drag window: permette di trascinare le finestre
         */
        dragWindow(event, windowObj) {
            let startX = event.clientX - windowObj.px;
            let startY = event.clientY - windowObj.py;
            
            const move = (e) => {
                windowObj.px = e.clientX - startX;
                windowObj.py = e.clientY - startY;
            };

            document.addEventListener('mousemove', move);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', move);
            }, { once: true });
        },

        /**
         * Parse markdown usando MarkdownParser
         */
        parseMarkdown(text) {
            return MarkdownParser.parse(text);
        },

        // File operations
        createFile() {
            DesktopFileOps.createFile(this);
        },
        saveFile() {
            DesktopFileOps.saveFile(this);
        },
        deleteFile(file) {
            DesktopFileOps.deleteFile(this, file);
        },
        handleDrop(event) {
            DesktopFileOps.handleDrop(this, event);
        },

        // App operations
        openFile(file) {
            DesktopApps.openFile(this, file);
        },
        viewFile(file) {
            DesktopApps.viewFile(this, file);
        },
        editFile(file) {
            DesktopApps.editFile(this, file);
        },
        inspectFile(file) {
            DesktopApps.inspectFile(this, file);
        },
        openmetricAnalyzer() {
            DesktopApps.openmetricAnalyzer(this);
        },
        openCreator() {
            this.contextMenu.show = false;
            this.creator.name = '';
            this.creator.show = true;
        },
        openTerminal() {
            DesktopApps.openTerminal(this);
        },
        runTerminalCommand() {
            DesktopApps.runTerminalCommand(this);
        }
    }));
};

// Inizializza il componente Alpine quando pronto
if (window.Alpine) {
    initDesktop();
} else {
    document.addEventListener('alpine:init', initDesktop);
}