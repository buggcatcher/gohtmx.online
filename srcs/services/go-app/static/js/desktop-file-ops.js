/**
 * Desktop File Operations
 * Gestisce: creazione, salvataggio, eliminazione e upload di file
 */

const DesktopFileOps = {
    /**
     * Crea un nuovo file (locale se guest, remoto nel DB se autenticato)
     */
    createFile(desktop) {
        if (!desktop.creator.name) {
            desktop.isProcessing = false;
            return;
        }
        const name = desktop.creator.name.trim();

        // Validazione estensione
        if (!name.endsWith('.txt') && !name.endsWith('.md')) {
            window.ClippyAgent.say(
                desktop.t('err_file_ext'),
                { tts: true, delay: 6000 }
            );
            desktop.isProcessing = false;
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
            desktop.isProcessing = false;
            window.ClippyAgent.say(
                desktop.t('guest_read_only_file'),
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
            .then(res => {
                if (!res.ok) throw new Error("Status " + res.status);
                return res.json();
            })
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
                    desktop.t('file_created_db'),
                    { tts: true, delay: 4000 }
                );
            })
            .catch(err => {
                window.ClippyAgent.say(desktop.t('err_create_prefix') + err.message, { tts: true, delay: 6000 });
            })
            .finally(() => {
                desktop.isProcessing = false;
            });
    },

    /**
     * Salva le modifiche di un file nel DB
     */
    saveFile(desktop) {
        if (desktop.isGuest || !desktop.editor.targetFile) {
            desktop.isProcessing = false;
            return;
        }
        
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
                        desktop.t('file_saved_db'),
                        { tts: true, delay: 4000 }
                    );
                } else {
                    window.ClippyAgent.say(
                        desktop.t('err_save_db'),
                        { tts: true, delay: 6000 }
                    );
                }
            })
            .catch(() => {
                window.ClippyAgent.say(
                    desktop.t('err_save_db'),
                    { tts: true, delay: 6000 }
                );
            })
            .finally(() => {
                desktop.isProcessing = false;
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
                desktop.t('file_removed_local'),
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
                            desktop.t('file_removed_db'),
                            { tts: true, delay: 4000 }
                        );
                    } else {
                        window.ClippyAgent.say(
                            desktop.t('err_remove_db'),
                            { tts: true, delay: 6000 }
                        );
                    }
                })
                .catch(() => {
                    window.ClippyAgent.say(
                        desktop.t('err_remove_db'),
                        { tts: true, delay: 6000 }
                    );
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
                desktop.t('err_drag_guest'),
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
                desktop.t('err_file_too_large'),
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
                        desktop.t('file_uploaded_success').replace('{name}', file.name),
                        { tts: true, delay: 5000 }
                    );
                })
                .catch(err => {
                    window.ClippyAgent.say(
                        desktop.t('err_upload_prefix') + err.message,
                        { tts: true, delay: 6000 }
                    );
                });
        };

        reader.readAsText(file);
    }
};