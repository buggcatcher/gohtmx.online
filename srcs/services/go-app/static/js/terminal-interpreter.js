/**
 * Terminal Interpreter Utility
 * Esegue comandi terminale emulati nel contesto del desktop virtuale
 */

const TerminalInterpreter = {
    execute(rawInput, files, userIP, currentUser) {
        const parts = rawInput.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ');

        switch (cmd) {
            case 'help':
                return `Comandi disponibili:\n` +
                       `  ls              Elenca le risorse sul desktop\n` +
                       `  cat <file>      Stampa a schermo il contenuto di un file\n` +
                       `  whoami          Mostra l'identità dell'utente corrente\n` +
                       `  neofetch        Visualizza le telemetrie di sistema\n` +
                       `  clear           Svuota lo schermo`;

            case 'ls':
                return files.map(f => {
                    const icon = f.category === 'system' ? '📟' : '📄';
                    return `${icon} ${f.name}`;
                }).join('\n');

            case 'cat':
                if (!arg) return `Sintassi errata. Uso: cat <nome_file>`;
                const target = files.find(f => f.name.toLowerCase() === arg.toLowerCase());
                return target ? (target.content || `[File vuoto]`) : `cat: ${arg}: File non trovato`;

            case 'whoami':
                return currentUser;

            case 'neofetch':
                return `<span style="color: #00ffcc;"> Solar OS v2.1-Intel</span>\n` +
                       `---------------------\n` +
                       `Kernel: Go 1.25.0 / Alpine 3.20\n` +
                       `Shell: Alpine sh / HTMX reactive\n` +
                       `Database: PostgreSQL 15 (Active)\n` +
                       `Session IP: ${userIP}`;

            case 'clear':
                return '__CLEAR_SIGNAL__';

            default:
                return `comando non riconosciuto: '${cmd}'. Digita 'help' per vedere i comandi.`;
        }
    }
};