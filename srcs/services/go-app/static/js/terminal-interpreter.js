/**
 * Terminal Interpreter Utility
 * Esegue comandi terminale emulati nel contesto del desktop virtuale con localizzazione nativa
 */

const TerminalInterpreter = {
    i18n: {
        it: {
            help_notice: "Digita 'help <comando>' per visualizzare la descrizione del comando.",
            available_cmds: "Comandi disponibili:",
            cmd_not_found: "comando non riconosciuto: '{cmd}'. Digita 'help' per vedere i comandi.",
            err_cat_syntax: "Sintassi errata. Uso: cat <nome_file>",
            err_info_syntax: "Sintassi errata. Uso: info <nome_file>",
            file_not_found: "File non trovato",
            empty_file: "[File vuoto]",
            info_header: "Proprietà File:",
            info_name: "Nome",
            info_size: "Dimensione",
            info_creator: "Autore",
            info_editor: "Ultima Modifica",
            info_date: "Data Ultima Modifica",
            info_type: "Tipo",
            help_desc: {
                ls: "ls - Elenca le risorse e i file presenti sul desktop.",
                cat: "cat <file> - Stampa a schermo il contenuto testuale di un file.",
                info: "info <file> - Mostra i metadati dettagliati del file (dimensione, autore, data).",
                whoami: "whoami - Mostra l'identità o l'indirizzo email dell'utente corrente.",
                neofetch: "neofetch - Visualizza informazioni di sistema e telemetria attiva.",
                clear: "clear - Svuota completamente la cronologia visibile della console.",
                help: "help [comando] - Elenca i comandi o ne descrive uno specifico."
            }
        },
        hr: {
            help_notice: "Upišite 'help <naredba>' za prikaz opisa naredbe.",
            available_cmds: "Dostupne naredbe:",
            cmd_not_found: "nepoznata naredba: '{cmd}'. Upišite 'help' za popis naredbi.",
            err_cat_syntax: "Pogrešna sintaksa. Upotreba: cat <naziv_datoteke>",
            err_info_syntax: "Pogrešna sintaksa. Upotreba: info <naziv_datoteke>",
            file_not_found: "Datoteka nije pronađena",
            empty_file: "[Prazna datoteka]",
            info_header: "Svojstva datoteke:",
            info_name: "Naziv",
            info_size: "Veličina",
            info_creator: "Autor",
            info_editor: "Zadnji uredio",
            info_date: "Datum zadnje izmjene",
            info_type: "Vrsta",
            help_desc: {
                ls: "ls - Popisuje resurse i datoteke na radnoj površini.",
                cat: "cat <datoteka> - Ispisuje tekstualni sadržaj datoteke na zaslon.",
                info: "info <datoteka> - Prikazuje detaljne metapodatke datoteke (veličina, autor, datum).",
                whoami: "whoami - Prikazuje identitet ili e-adresu trenutnog korisnika.",
                neofetch: "neofetch - Prikazuje informacije o sustavu i aktivnu telemetriju.",
                clear: "clear - Potpuno briše vidljivu povijest konzole.",
                help: "help [naredba] - Popisuje naredbe ili detaljno opisuje određenu."
            }
        },
        fr: {
            help_notice: "Tapez 'help <commande>' pour afficher la description de la commande.",
            available_cmds: "Commandes disponibles :",
            cmd_not_found: "commande non reconnue : '{cmd}'. Tapez 'help' pour voir les commandes.",
            err_cat_syntax: "Syntaxe incorrecte. Utilisation : cat <nom_fichier>",
            err_info_syntax: "Syntaxe incorrecte. Utilisation : info <nom_fichier>",
            file_not_found: "Fichier non trouvé",
            empty_file: "[Fichier vide]",
            info_header: "Propriétés du fichier :",
            info_name: "Nom",
            info_size: "Taille",
            info_creator: "Auteur",
            info_editor: "Dernière modification par",
            info_date: "Date de dernière modification",
            info_type: "Type",
            help_desc: {
                ls: "ls - Liste les ressources et fichiers présents sur le bureau.",
                cat: "cat <fichier> - Affiche le contenu textuel d'un fichier à l'écran.",
                info: "info <fichier> - Affiche les métadonnées détaillées du fichier (taille, auteur, date).",
                whoami: "whoami - Affiche l'identité ou l'adresse e-mail de l'utilisateur actuel.",
                neofetch: "neofetch - Affiche les informations système et la télémétrie active.",
                clear: "clear - Efface complètement l'historique visible de la console.",
                help: "help [commande] - Liste les commandes ou en décrit une spécifique."
            }
        },
        es: {
            help_notice: "Escribe 'help <comando>' para mostrar la descripción del comando.",
            available_cmds: "Comandos disponibles:",
            cmd_not_found: "comando no reconocido: '{cmd}'. Escribe 'help' para ver los comandos.",
            err_cat_syntax: "Sintaxis incorrecta. Uso: cat <nombre_archivo>",
            err_info_syntax: "Sintaxis incorrecta. Uso: info <nombre_archivo>",
            file_not_found: "Archivo no encontrado",
            empty_file: "[Archivo vacío]",
            info_header: "Propiedades del archivo:",
            info_name: "Nombre",
            info_size: "Tamaño",
            info_creator: "Autor",
            info_editor: "Última edición por",
            info_date: "Fecha última modificación",
            info_type: "Tipo",
            help_desc: {
                ls: "ls - Enumera los recursos y archivos en el escritorio.",
                cat: "cat <archivo> - Muestra el contenido de texto de un archivo en la pantalla.",
                info: "info <archivo> - Muestra los metadatos detallados del archivo (tamaño, autor, fecha).",
                whoami: "whoami - Muestra la identidad o correo electrónico del usuario actual.",
                neofetch: "neofetch - Muestra la información del sistema y la telemetría activa.",
                clear: "clear - Limpia completamente el historial visible de la consola.",
                help: "help [comando] - Enumera los comandos o describe uno específico."
            }
        },
        de: {
            help_notice: "Geben Sie 'help <befehl>' ein, um die Befehlsbeschreibung anzuzeigen.",
            available_cmds: "Verfügbare Befehle:",
            cmd_not_found: "unbekannter Befehl: '{cmd}'. Geben Sie 'help' ein, um die Befehle anzuzeigen.",
            err_cat_syntax: "Falsche Syntax. Verwendung: cat <dateiname>",
            err_info_syntax: "Falsche Syntax. Verwendung: info <dateiname>",
            file_not_found: "Datei nicht gefunden",
            empty_file: "[Leere Datei]",
            info_header: "Dateieigenschaften:",
            info_name: "Name",
            info_size: "Größe",
            info_creator: "Autor",
            info_editor: "Zuletzt bearbeitet von",
            info_date: "Datum der letzten Änderung",
            info_type: "Typ",
            help_desc: {
                ls: "ls - Listet die Ressourcen und Dateien auf dem Desktop auf.",
                cat: "cat <datei> - Gibt den Textinhalt einer Datei auf dem Bildschirm aus.",
                info: "info <datei> - Zeigt detaillierte Dateimetadaten an (Größe, Autor, Datum).",
                whoami: "whoami - Zeigt die Identität oder E-Mail-Adresse des aktuellen Benutzers an.",
                neofetch: "neofetch - Zeigt Systeminformationen und aktive Telemetriedaten an.",
                clear: "clear - Löscht den sichtbaren Verlauf der Konsole vollständig.",
                help: "help [befehl] - Listet Befehle auf oder beschreibt einen bestimmten."
            }
        },
        en: {
            help_notice: "Type 'help <command>' to display command description.",
            available_cmds: "Available commands:",
            cmd_not_found: "command not recognized: '{cmd}'. Type 'help' to see commands.",
            err_cat_syntax: "Incorrect syntax. Usage: cat <filename>",
            err_info_syntax: "Incorrect syntax. Usage: info <filename>",
            file_not_found: "File not found",
            empty_file: "[Empty file]",
            info_header: "File Properties:",
            info_name: "Name",
            info_size: "Size",
            info_creator: "Creator",
            info_editor: "Last Edited By",
            info_date: "Last Modified Date",
            info_type: "Type",
            help_desc: {
                ls: "ls - Lists the resources and files on the desktop.",
                cat: "cat <file> - Prints the text content of a file on the screen.",
                info: "info <file> - Displays detailed file metadata (size, author, date).",
                whoami: "whoami - Displays the identity or email of the current user.",
                neofetch: "neofetch - Displays system information and active telemetry.",
                clear: "clear - Completely clears the visible console history.",
                help: "help [command] - Lists commands or describes a specific one."
            }
        },
        cn: {
            help_notice: "输入 'help <命令>' 以显示命令描述。",
            available_cmds: "可用命令：",
            cmd_not_found: "未识别的命令：'{cmd}'。输入 'help' 获取命令列表。",
            err_cat_syntax: "语法错误。用法：cat <文件名>",
            err_info_syntax: "语法错误。用法：info <文件名>",
            file_not_found: "未找到文件",
            empty_file: "[空文件]",
            info_header: "文件属性：",
            info_name: "名称",
            info_size: "大小",
            info_creator: "作者",
            info_editor: "最后修改者",
            info_date: "最后修改时间",
            info_type: "类型",
            help_desc: {
                ls: "ls - 列出桌面上的资源和文件。",
                cat: "cat <文件> - 在屏幕上打印文件的文本内容。",
                info: "info <文件> - 显示文件的详细元数据（大小、作者、修改日期）。",
                whoami: "whoami - 显示当前用户的身份或电子邮件。",
                neofetch: "neofetch - 显示系统信息和活动遥测数据。",
                clear: "clear - 清空控制台的所有历史记录。",
                help: "help [命令] - 列出命令或详细描述特定命令。"
            }
        },
        jp: {
            help_notice: "「help <コマンド>」と入力すると、コマンドの説明が表示されます。",
            available_cmds: "利用可能なコマンド：",
            cmd_not_found: "認識できないコマンドです: '{cmd}'。「help」と入力してコマンド一覧を確認してください。",
            err_cat_syntax: "構文エラー。使用法：cat <ファイル名>",
            err_info_syntax: "構文エラー。使用法：info <ファイル名>",
            file_not_found: "ファイルが見つかりません",
            empty_file: "[空のファイル]",
            info_header: "ファイルのプロパティ：",
            info_name: "名前",
            info_size: "サイズ",
            info_creator: "作成者",
            info_editor: "最終編集者",
            info_date: "最終更新日時",
            info_type: "タイプ",
            help_desc: {
                ls: "ls - デスクトップ上のリソースとファイルの一覧を表示します。",
                cat: "cat <ファイル> - ファイルのテキスト内容を画面に表示します。",
                info: "info <ファイル> - ファイルの詳細なメタデータ（サイズ、作成者、更新日時）を表示します。",
                whoami: "whoami - 現在のユーザーの識別情報またはメールアドレスを表示します。",
                neofetch: "neofetch - システム情報とアクティブなテレメトリを表示します。",
                clear: "clear - コンソールの表示履歴を完全にクリアします。",
                help: "help [コマンド] - コマンドの一覧を表示するか、特定のコマンドを解説します。"
            }
        }
    },

    execute(rawInput, files, userIP, currentUser, lang) {
        const parts = rawInput.trim().split(' ');
        const cmd = parts[0].toLowerCase();
        const arg = parts.slice(1).join(' ').trim();

        const activeLang = this.i18n[lang] ? lang : 'it';
        const dict = this.i18n[activeLang];

        switch (cmd) {
            case 'help':
                if (arg) {
                    const targetCmd = arg.toLowerCase();
                    if (dict.help_desc[targetCmd]) {
                        return dict.help_desc[targetCmd];
                    } else {
                        return dict.cmd_not_found.replace('{cmd}', targetCmd);
                    }
                } else {
                    const commandList = Object.keys(dict.help_desc).join(', ');
                    return `${dict.help_notice}\n\n${dict.available_cmds}\n  ${commandList}`;
                }

            case 'ls':
                return files.map(f => {
                    const icon = f.category === 'system' ? '📟' : '📄';
                    return `${icon} ${f.name}`;
                }).join('\n');

            case 'cat':
                if (!arg) return dict.err_cat_syntax;
                const catTarget = files.find(f => f.name.toLowerCase() === arg.toLowerCase());
                if (!catTarget) return `cat: ${arg}: ${dict.file_not_found}`;
                return catTarget.content || dict.empty_file;

            case 'info':
                if (!arg) return dict.err_info_syntax;
                const infoTarget = files.find(f => f.name.toLowerCase() === arg.toLowerCase());
                if (!infoTarget) return `info: ${arg}: ${dict.file_not_found}`;

                let infoOut = `${dict.info_header}\n` +
                              `  ${dict.info_name}:          ${infoTarget.name}\n` +
                              `  ${dict.info_size}:    ${infoTarget.size || '0 Bytes'}\n` +
                              `  ${dict.info_creator}:       ${infoTarget.creator || 'n/a'}`;

                if (infoTarget.lastEditedBy) {
                    infoOut += `\n  ${dict.info_editor}: ${infoTarget.lastEditedBy}`;
                }

                infoOut += `\n  ${dict.info_date}: ${infoTarget.lastModified || 'n/a'}\n` +
                           `  ${dict.info_type}:          ${infoTarget.type || 'n/a'}`;

                return infoOut;

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
                return dict.cmd_not_found.replace('{cmd}', cmd);
        }
    }
};