/**
 * Desktop File Operations
 * Gestisce: creazione, salvataggio, eliminazione e upload di file
 */

const DesktopFileOps = {
    /**
     * Crea un nuovo file (locale se guest, remoto nel DB se autenticato)
     */
    createFile(desktop) {
        if (!desktop.creator.name) return;
        const name = desktop.creator.name.trim();

        // Validazione estensione
        if (!name.endsWith('.txt') && !name.endsWith('.md')) {
            window.ClippyAgent.say(
                'Attenzione! Il nome del file deve terminare obbligatoriamente con l\'estensione .txt oppure .md.',
                { tts: true, delay: 6000 }
            );
            return;
        }

        const targetIcon = name.toLowerCase().endsWith('.md') 
            ? '/static/assets/readme.webp' 
            : '📄';

        // Se guest: salva localmente
        if (desktop.isGuest) {
            const tempId = 'file-' + Date.now();
            desktop.files.push({
                id: tempId,
                name: name,
                icon: targetIcon,
                size: '0 Bytes',
                lastModified: new Date().toLocaleString('it-IT'),
                type: name.endsWith('.md') ? 'text/markdown' : 'text/plain',
                content: '',
                creator: 'Guest',
                lastEditedBy: null,
                category: 'document'
            });
            desktop.creator.show = false;
            desktop.creator.name = '';
            window.ClippyAgent.say(
                'Nuovo file locale creato in sola lettura. Accedi per salvare sul database persistente!',
                { tts: true, delay: 6000 }
            );
            return;
        }

        // Se autenticato: salva nel DB
        fetch('/api/files', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: name, content: '' })
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                desktop.files.push({
                    id: 'file-' + data.id,
                    name: name,
                    icon: targetIcon,
                    size: '0 Bytes',
                    lastModified: new Date().toLocaleString('it-IT'),
                    type: name.endsWith('.md') ? 'text/markdown' : 'text/plain',
                    content: '',
                    creator: desktop.currentUser,
                    lastEditedBy: null,
                    category: 'document',
                    dbId: data.id
                });
                desktop.creator.show = false;
                desktop.creator.name = '';
                window.ClippyAgent.say(
                    'Ottimo! Il tuo nuovo file è stato registrato nel database Postgres.',
                    { tts: true, delay: 4000 }
                );
            })
            .catch(err => {
                window.ClippyAgent.say('Errore di creazione: ' + err.message, { tts: true, delay: 6000 });
            });
    },

    /**
     * Salva le modifiche di un file nel DB
     */
    saveFile(desktop) {
        if (desktop.isGuest || !desktop.editor.targetFile) return;
        
        fetch(`/api/files/${desktop.editor.targetFile.dbId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: desktop.editor.tempContent })
        })
            .then(res => {
                if (res.ok) {
                    desktop.editor.targetFile.content = desktop.editor.tempContent;
                    desktop.editor.targetFile.lastModified = new Date().toLocaleString('it-IT');
                    desktop.editor.targetFile.lastEditedBy = desktop.currentUser;
                    desktop.editor.show = false;
                    window.ClippyAgent.say(
                        'File salvato con successo sul database remoto.',
                        { tts: true, delay: 4000 }
                    );
                } else {
                    window.ClippyAgent.say(
                        'Ops! Si è verificato un errore durante la scrittura del file in Postgres.',
                        { tts: true, delay: 6000 }
                    );
                }
            });
    },

    /**
     * Elimina un file (locale se guest, remoto dal DB se autenticato)
     */
    deleteFile(desktop, file) {
        if (desktop.isGuest) {
            desktop.files = desktop.files.filter(f => f.id !== file.id);
            desktop.contextMenu.show = false;
            window.ClippyAgent.say(
                'File temporaneo rimosso dal workspace locale.',
                { tts: true, delay: 4000 }
            );
            return;
        }

        desktop.contextMenu.show = false;
        if (!file) return;

        if (file.dbId) {
            fetch(`/api/files/${file.dbId}`, { method: 'DELETE' })
                .then(res => {
                    if (res.ok) {
                        desktop.files = desktop.files.filter(f => f.id !== file.id);
                        window.ClippyAgent.say(
                            'Non c\'è ne paradiso ne inferno per i file rimossi.',
                            { tts: true, delay: 4000 }
                        );
                    } else {
                        window.ClippyAgent.say(
                            'Impossibile completare la rimozione del file.',
                            { tts: true, delay: 6000 }
                        );
                    }
                });
        } else {
            desktop.files = desktop.files.filter(f => f.id !== file.id);
        }
    },

    /**
     * Gestisce il caricamento via drag & drop
     */
    handleDrop(desktop, event) {
        if (desktop.isGuest) {
            window.ClippyAgent.say(
                'Attenzione: devi prima effettuare l\'accesso per poter caricare file sul cloud via drag and drop.',
                { tts: true, delay: 6000 }
            );
            return;
        }

        desktop.dragOver = false;
        const files = event.dataTransfer.files;
        if (files.length === 0) return;

        const file = files[0];
        const limitSize = 42 * 1024;

        if (file.size > limitSize) {
            window.ClippyAgent.say(
                'File troppo grande! La dimensione massima consentita per caricamento è 42 KB.',
                { tts: true, delay: 6000 }
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: file.name, content: content })
            })
                .then(res => {
                    if (!res.ok) {
                        return res.json().then(err => { throw new Error(err.error); });
                    }
                    return res.json();
                })
                .then(data => {
                    const targetIcon = file.name.toLowerCase().endsWith('.md')
                        ? '/static/assets/readme.webp'
                        : '📄';
                    const newFile = {
                        id: 'file-' + data.id,
                        name: file.name,
                        icon: targetIcon,
                        size: desktop.formatBytes(file.size),
                        lastModified: new Date().toLocaleString('it-IT'),
                        type: file.type || 'text/plain',
                        content: content,
                        creator: desktop.currentUser,
                        lastEditedBy: null,
                        category: 'document',
                        dbId: data.id
                    };
                    desktop.files.push(newFile);
                    window.ClippyAgent.say(
                        `File "${file.name}" caricato con successo.`,
                        { tts: true, delay: 5000 }
                    );
                })
                .catch(err => {
                    window.ClippyAgent.say(
                        'Errore di upload: ' + err.message,
                        { tts: true, delay: 6000 }
                    );
                });
        };

        reader.readAsText(file);
    }
};
