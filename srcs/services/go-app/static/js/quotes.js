const ClippyQuotesManager = {
    // 1. Struttura dati con metadati condizionali: guestOnly o userOnly
    quoteSets: {
        it: {
            index: [
                "Hai provato a spegnere e riaccendere?",
                "No, 123 non va bene come password.",
                "La porta del server è protetta da certificati SSL sicuri!"
            ],
            desktop_empty: [
                "Perché non crei un file facendo click con il tasto destro?",
                "Ci sono 10 tipi di persone al mondo: chi capisce il binario e chi no.",
                "Nessun programmatore è stato maltrattato per la scrittura di questo codice.",
                "Sei felice?",
                "Per anni ho coltivato patate, solo ora comprendo che in realtà sono state loro a coltivare me.",
                "Questo sfondo l'ho scelto personalmente per te.",
                "Trascina un file .txt o .md dal tuo computer per caricarlo al volo!"
            ],
            desktop_empty_mobile: [
                "Tieni premuto a lungo (long press) sullo sfondo per aprire il menu e creare un file!",
                "Puoi interagire con le icone tenendo premuto a lungo sullo schermo.",
                { text: "Se effettui l'accesso, potrai salvare i tuoi documenti sul database Postgres remoto.", guestOnly: true }
            ],
            terminal: [
                "Ah, vedo che sei un tipo da riga di comando! Prova a digitare 'neofetch'.",
                "Attenzione con quei comandi, non vorrai mica mandare in crash la mia CPU?",
                "Con il comando 'clear' puoi ripulire la cronologia sullo schermo.",
                "Scrivere 'cat <file>' ti mostrerà il contenuto del file all'istante!"
            ],
            metric: [
                "Interessante... Un'impronta browser unica!",
                "Guarda quante metriche del tuo dispositivo sono riuscito ad estrarre!",
                "Sto incrociando i dati da vari endpoint..."
            ],
            editor: [
                { text: "Stai scrivendo qualcosa di importante? Ricordati di salvare le modifiche!", userOnly: true },
                "Prendere appunti o programmare... l'importante è farlo con cura.",
                { text: "Ricorda che l'editor è in sola lettura se sei entrato come Guest.", guestOnly: true }
            ],
            viewer: [
                "RTFM!",
                "Ecco la struttura formattata del file .md.",
                "Leggere documentazione... è un'ottima abitudine!"
            ]
        },
        hr: {
            index: [
                "Jeste li pokušali isključiti i ponovo uključiti?",
                "Ne, 123 nije dobra lozinka.",
                "Port poslužitelja zaštićen je sigurnim SSL certifikatima!"
            ],
            desktop_empty: [
                "Zašto ne stvoriš datoteku desnim klikom?",
                "Postoji 10 vrsta ljudi na svijetu: oni koji razumiju binarni sustav i oni koji ne.",
                "Nijedan programer nije ozlijeđen tijekom pisanja ovog koda.",
                "Jesi li sretan/sretna?",
                "Godinama sam uzgajao krumpir, tek sada shvaćam da su zapravo oni uzgajali mene.",
                "Ovu pozadinu sam osobno odabrao za tebe.",
                "Povuci .txt ili .md datoteku sa svog računala da je odmah učitaš!"
            ],
            desktop_empty_mobile: [
                "Dugo pritisni pozadinu da otvoriš izbornik i stvoriš datoteku!",
                "Možeš komunicirati s ikonama dugim pritiskom na zaslon.",
                { text: "Ako se prijaviš, moći ćeš spremiti dokumente u udaljenu Postgres bazu podataka.", guestOnly: true }
            ],
            terminal: [
                "Ah, vidim da voliš naredbeni redak! Pokušaj upisati 'neofetch'.",
                "Oprezno s tim naredbama, ne želiš valjda srušiti moj procesor?",
                "Naredbom 'clear' možeš očistiti povijest na zaslonu.",
                "Upisivanje 'cat <datoteka>' odmah će prikazati sadržaj datoteke!"
            ],
            metric: [
                "Zanimljivo... Jedinstveni otisak preglednika!",
                "Pogledaj koliko sam metričkih podataka tvog uređaja uspio izvući!",
                "Uspoređujem podatke s različitih krajnjih točaka..."
            ],
            editor: [
                { text: "Pišeš li nešto važno? Ne zaboravi spremiti promjene!", userOnly: true },
                "Pisanje bilješki ili programiranje... važno je to raditi pažljivo.",
                { text: "Zapamti da je uređivač samo za čitanje ako si ušao kao Gost.", guestOnly: true }
            ],
            viewer: [
                "Pročitaj priručnik (RTFM)!",
                "Evo oblikovane strukture .md datoteke.",
                "Čitanje dokumentacije... to je izvrsna navika!"
            ]
        },
        fr: {
            index: [
                "Avez-vous essayé de l'éteindre et de le rallumer ?",
                "Non, 123 n'est pas un bon mot de passe.",
                "Le port du serveur est sécurisé par des certificats SSL !"
            ],
            desktop_empty: [
                "Pourquoi ne pas créer un fichier avec un clic droit ?",
                "Il y a 10 types de personnes dans le monde : celles qui comprennent le binaire, et les autres.",
                "Aucun développeur n'a été maltraité pour écrire ce code.",
                "Es-tu heureux ?",
                "Pendant des années, j'ai cultivé des pommes de terre, et maintenant je réalise que c'étaient elles qui me cultivaient.",
                "J'ai personnellement choisi ce fond d'écran pour toi.",
                "Glissez-déposez un fichier .txt ou .md pour le charger instantanément !"
            ],
            desktop_empty_mobile: [
                "Faites un appui long sur l'arrière-plan pour ouvrir le menu !",
                "Vous pouvez interagir avec les icônes par un appui long sur l'écran.",
                { text: "Si tu te connectes, tu pourras sauvegarder tes fichiers dans la base Postgres.", guestOnly: true }
            ],
            terminal: [
                "Ah, un adepte de la ligne de commande ! Essaie de taper 'neofetch'.",
                "Attention à ces commandes, tu ne voudrais pas faire planter mon processeur ?",
                "Tu peux effacer l'historique de l'écran avec la commande 'clear'.",
                "Saisir 'cat <fichier>' affichera le contenu instantanément !"
            ],
            metric: [
                "Intéressant... Une empreinte de navigateur unique !",
                "Regarde toutes les mesures de ton appareil que j'ai pu extraire !",
                "Je croise les données de différents points d'accès..."
            ],
            editor: [
                { text: "Tu écris quelque chose d'important ? Pense à sauvegarder tes modifications !", userOnly: true },
                "Prendre des notes ou coder... l'important est de le faire avec soin.",
                { text: "Rappelle-toi que l'éditeur est en lecture seule si tu es un Invité.", guestOnly: true }
            ],
            viewer: [
                "RTFM !",
                "Voici la structure formatée du fichier .md.",
                "Lire la documentation... c'est une excellente habitude !"
            ]
        },
        es: {
            index: [
                "¿Has intentado apagarlo y encenderlo de nuevo?",
                "No, 123 no es una buena contraseña.",
                "¡El puerto del servidor está protegido con certificados SSL seguros!"
            ],
            desktop_empty: [
                "¿Por qué no creas un archivo haciendo clic derecho?",
                "Hay 10 tipos de personas en el mundo: los que entienden binario y los que no.",
                "Ningún programador fue maltratado al escribir este código.",
                "¿Eres feliz?",
                "Durante años cultivé patatas, solo ahora comprendo que en realidad ellas me cultivaban a mí.",
                "Elegí personalmente este fondo de pantalla para ti.",
                "¡Arrastra un archivo .txt o .md desde tu ordenador para subirlo al instante!"
            ],
            desktop_empty_mobile: [
                "¡Mantén presionado el fondo para abrir el menú y crear un archivo!",
                "Puedes interactuar con los iconos manteniendo presionado en la pantalla.",
                { text: "Si inicias sesión, podrás guardar tus documentos en la base de datos remota Postgres.", guestOnly: true }
            ],
            terminal: [
                "¡Ah, veo que eres un usuario de la línea de comandos! Intenta escribir 'neofetch'.",
                "Cuidado con esos comandos, no querrás colapsar mi CPU, ¿verdad?",
                "Puedes limpiar el historial de la pantalla con el comando 'clear'.",
                "¡Escribir 'cat <archivo>' mostrará su contenido al instante!"
            ],
            metric: [
                "Interesante... ¡Una huella digital de navegador única!",
                "¡Mira cuántas métricas de tu dispositivo he logrado extraer!",
                "Cruzando datos de varios endpoints..."
            ],
            editor: [
                { text: "¿Estás escribiendo algo importante? ¡Recuerda guardar los cambios!", userOnly: true },
                "Tomar notas o programar... lo importante es hacerlo con cuidado.",
                { text: "Recuerda que el editor es de solo lectura si entraste como Invitado.", guestOnly: true }
            ],
            viewer: [
                "¡RTFM!",
                "Aquí está la estructura formateada del archivo .md.",
                "¡Leer la documentación... es un excelente hábito!"
            ]
        },
        de: {
            index: [
                "Hast du versucht, es aus- und wieder einzuschalten?",
                "Nein, 123 ist kein gutes Passwort.",
                "Der Server-Port ist mit sicheren SSL-Zertifikaten geschützt!"
            ],
            desktop_empty: [
                "Warum erstellst du nicht eine Datei mit einem Rechtsklick?",
                "Es gibt 10 Arten von Menschen auf der Welt: diejenigen, die Binärdateien verstehen, und diejenigen, die es nicht tun.",
                "Beim Schreiben dieses Codes wurden keine Programmierer verletzt.",
                "Bist du glücklich?",
                "Jahrelang habe ich Kartoffeln angebaut, erst jetzt verstehe ich, dass eigentlich sie mich angebaut haben.",
                "Diesen Hintergrund habe ich persönlich für dich ausgewählt.",
                "Ziehe eine .txt- oder .md-Datei von deinem Computer hierher, um sie sofort hochzuladen!"
            ],
            desktop_empty_mobile: [
                "Halte den Hintergrund gedrückt, um das Menü zu öffnen und eine Datei zu erstellen!",
                "Du kannst mit Symbolen interagieren, indem du sie auf dem Bildschirm gedrückt hältst.",
                { text: "Wenn du dich anmeldest, kannst du deine Dokumente in der Postgres-Datenbank speichern.", guestOnly: true }
            ],
            terminal: [
                "Ah, ich sehe, du bist ein Befehlszeilen-Fan! Versuche 'neofetch' einzugeben.",
                "Vorsicht mit diesen Befehlen, du willst doch nicht meine CPU abstürzen lassen?",
                "Mit dem Befehl 'clear' kannst du den Bildschirmverlauf löschen.",
                "Die Eingabe von 'cat <datei>' zeigt den Dateiinhalt sofort an!"
            ],
            metric: [
                "Interessant... Ein einzigartiger Browser-Fingerabdruck!",
                "Sieh dir an, wie viele Gerätemetriken ich extrahieren konnte!",
                "Kreuzabgleich von Daten aus verschiedenen Endpunkten..."
            ],
            editor: [
                { text: "Schreibst du etwas Wichtiges? Vergiss nicht, die Änderungen zu speichern!", userOnly: true },
                "Notizen machen oder programmieren... Hauptsache, man macht es sorgfältig.",
                { text: "Denke daran, dass der Editor schreibgeschützt ist, wenn du als Gast beigetreten bist.", guestOnly: true }
            ],
            viewer: [
                "RTFM!",
                "Hier ist die formatierte Struktur der .md-Datei.",
                "Dokumentation lesen... ist eine großartige Angewohnheit!"
            ]
        },
        en: {
            index: [
                "Have you tried turning it off and on again?",
                "No, 123 is not a good password.",
                "The server port is secured with SSL certificates!"
            ],
            desktop_empty: [
                "Why don't you create a file by right-clicking?",
                "There are 10 types of people in the world: those who understand binary, and those who don't.",
                "No programmers were harmed in the writing of this code.",
                "Are you happy?",
                "For years I grew potatoes, only now do I realize that they were actually growing me.",
                "I personally chose this wallpaper for you.",
                "Drag and drop a .txt or .md file from your computer to upload it instantly!"
            ],
            desktop_empty_mobile: [
                "Long press on the background to open the menu and create a file!",
                "You can interact with icons by performing a long press on the screen.",
                { text: "If you log in, you can save your documents to the remote Postgres database.", guestOnly: true }
            ],
            terminal: [
                "Ah, I see you are a command line user! Try typing 'neofetch'.",
                "Careful with those commands, you don't want to crash my CPU, do you?",
                "You can clear the screen history with the 'clear' command.",
                "Typing 'cat <file>' will display the file content instantly!"
            ],
            metric: [
                "Interesting... A unique browser fingerprint!",
                "Look at how many device metrics I managed to extract!",
                "Cross-referencing data from various endpoints..."
            ],
            editor: [
                { text: "Are you writing something important? Remember to save your changes!", userOnly: true },
                "Taking notes or coding... the important thing is to do it with care.",
                { text: "Remember that the editor is read-only if you joined as Guest.", guestOnly: true }
            ],
            viewer: [
                "RTFM!",
                "Here is the formatted structure of the .md file.",
                "Reading documentation... is a great habit!"
            ]
        },
        cn: [
            // Cinese, mantenuto come blocco integro standardizzato
        ],
        jp: [
            // Giapponese, mantenuto come blocco integro standardizzato
        ]
    },

    // 2. Registro memoria basato sulle stringhe effettive per evitare collisioni indici
    usedQuotes: {
        index: [],
        desktop_empty: [],
        desktop_empty_mobile: [],
        terminal: [],
        metric: [],
        editor: [],
        viewer: []
    },

    init() {
        // Ripristino delle traduzioni di riempimento per Cinese e Giapponese simmetriche
        this.quoteSets.cn = {
            index: [
                "你试过关机再开机吗？",
                "不，123 绝对不是一个安全的密码。",
                "服务器端口已受到安全 SSL 证书的保护！"
            ],
            desktop_empty: [
                "为什么不通过右键单击来创建文件呢？",
                "世界上有 10 种人：懂二进制的和不懂的。",
                "在编写此代码的过程中，没有程序员受到伤害。",
                "你开心吗？",
                "多年来我一直在种土豆，直到现在我才明白，实际上是它们在培养我。",
                "这是我亲自为你选择的壁纸。",
                "从电脑中拖放 .txt 或 .md 文件即可立即上传！"
            ],
            desktop_empty_mobile: [
                "长按背景以打开菜单并创建文件！",
                "你可以通过长按屏幕上的图标来进行交互。",
                { text: "如果您登录，则可以将文档保存到远程 Postgres 数据库中。", guestOnly: true }
            ],
            terminal: [
                "啊，我看得出你是命令行用户！试着输入 'neofetch' 吧。",
                "小心这些命令，你不想让我的 CPU 崩溃吧？",
                "你可以使用 'clear' 命令清空屏幕历史记录。",
                "输入 'cat <文件>' 将立即显示文件内容！"
            ],
            metric: [
                "有趣... 独特的浏览器指纹！",
                "看看我成功提取了多少设备指标！",
                "正在交叉比对来自不同终端的数据..."
            ],
            editor: [
                { text: "你正在写重要的东西吗？记得保存更改！", userOnly: true },
                "记笔记或编写代码... 重要的是要用心去做。",
                { text: "请记住，如果您是以访客身份加入的，则编辑器是只读的。", guestOnly: true }
            ],
            viewer: [
                "去读读手册吧 (RTFM)！",
                "这是 .md 文件的格式化结构。",
                "阅读文档... 是一个极好的习惯！"
            ]
        };

        this.quoteSets.jp = {
            index: [
                "再起動は試しましたか？",
                "いいえ、123は良いパスワードではありません。",
                "サーバーのポートは安全なSSL証明書で保護されています！"
            ],
            desktop_empty: [
                "右クリックしてファイルを作成してみませんか？",
                "世界には10種類の人間がいます。バイナリを理解する人と理解しない人です。",
                "このコード of 開発中に、プログラマーは一人も傷ついていません。",
                "幸せですか？",
                "何年もジャガイモを育ててきましたが、今になって、実は彼らが私を育てていたのだと気づきました。",
                "この壁紙は私があなたのために個人的に選びました。",
                "コンピューターから.txtまたは.mdファイルをドラッグ＆ドロップして、すぐにアップロードできます！"
            ],
            desktop_empty_mobile: [
                "背景を長押ししてメニューを開き、ファイルを作成しましょう！",
                "画面上のアイコンを長押しすることで操作できます。",
                { text: "ログインすると、リモートのPostgresデータベースにドキュメントを保存できます。", guestOnly: true }
            ],
            terminal: [
                "おや、コマンドライン使いですね！「neofetch」と入力してみてください。",
                "コマンドには気をつけてください。私のCPUをクラッシュさせたくはないでしょう？",
                "「clear」コマンドで画面の履歴をクリアできます。",
                "「cat <ファイル>」と入力すると、すぐにファイル内容が表示されます！"
            ],
            metric: [
                "興味深いですね... ユニークなブラウザ指紋です！",
                "あなたのデバイスからこれほど多くのメトリックを抽出できました！",
                "複数のエンドポイントからのデータを相互参照しています..."
            ],
            editor: [
                { text: "何か重要なことを書いていますか？変更を保存するのを忘れないでください！", userOnly: true },
                "メモを取るのもコードを書くのも、丁寧にやることが大切です。",
                { text: "ゲストとして参加している場合、エディターは読み取り専用です。", guestOnly: true }
            ],
            viewer: [
                "説明書を読んでください (RTFM)！",
                "これが.mdファイルの整形された構造です。",
                "ドキュメントを読むこと... それは素晴らしい習慣です！"
            ]
        };

        const target = document.getElementById('clippy-hitbox') || document.getElementById('clippy-container');
        if (!target) return;

        target.addEventListener('click', () => {
            this.speakRandomQuote();
        });
    },

    getActiveLang() {
        try {
            const desktopEl = document.querySelector('.desktop-workspace');
            const landingEl = document.querySelector('.landing-panel');
            if (desktopEl && window.Alpine) {
                const data = Alpine.$data(desktopEl);
                if (data && data.activeLang) return data.activeLang;
            } else if (landingEl && window.Alpine) {
                const data = Alpine.$data(landingEl);
                if (data && data.activeLang) return data.activeLang;
            }
            const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
            if (match && match[1]) return match[1];
        } catch (e) {
            console.warn("[ClippyQuotes] Errore rilevamento lingua:", e);
        }
        return 'it';
    },

    getContext() {
        const desktopEl = document.querySelector('.desktop-workspace');
        if (!desktopEl) {
            return 'index';
        }

        try {
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

                    const isAnyWindowOpen = 
                        (desktopData.creator && desktopData.creator.show) ||
                        (desktopData.inspector && desktopData.inspector.show);

                    if (!isAnyWindowOpen) {
                        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 480;
                        if (isMobile) {
                            return 'desktop_empty_mobile';
                        }
                        return 'desktop_empty';
                    }
                }
            }
        } catch (e) {}

        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 480;
        return isMobile ? 'desktop_empty_mobile' : 'desktop_empty';
    },

    speakRandomQuote() {
        const context = this.getContext();
        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 480;

        if (context === 'index' && isMobile) {
            return;
        }

        const contextMenuEl = document.querySelector('.context-menu');
        if (contextMenuEl && contextMenuEl.style.display !== 'none') {
            return;
        }

        const desktopEl = document.querySelector('.desktop-workspace');
        let isGuest = false;

        if (desktopEl && window.Alpine) {
            try {
                const desktopData = Alpine.$data(desktopEl);
                if (desktopData) {
                    if (desktopData.contextMenu && desktopData.contextMenu.show) {
                        return;
                    }
                    isGuest = desktopData.isGuest === true;
                }
            } catch (e) {}
        }

        const lang = this.getActiveLang();
        // Fallback progressivo da 'en' (ex 'uk') a 'it'
        let langSet = this.quoteSets[lang] || this.quoteSets['en'] || this.quoteSets['it'];
        const currentSet = langSet[context] || langSet['desktop_empty'];

        // Filtro delle frasi in tempo reale basato sullo stato di login (isGuest)
        const filteredSet = currentSet.filter(item => {
            if (typeof item === 'object' && item !== null) {
                if (item.guestOnly && !isGuest) return false;
                if (item.userOnly && isGuest) return false;
                return true;
            }
            return true;
        });

        if (filteredSet.length === 0) return;

        if (!this.usedQuotes[context]) {
            this.usedQuotes[context] = [];
        }

        // Filtra gli elementi non ancora riprodotti in questo ciclo
        const availableItems = filteredSet.filter(item => {
            const txt = typeof item === 'object' ? item.text : item;
            return !this.usedQuotes[context].includes(txt);
        });

        let chosenItem;
        if (availableItems.length === 0) {
            // Reset del ciclo di esclusione per questo contesto
            this.usedQuotes[context] = [];
            chosenItem = filteredSet[Math.floor(Math.random() * filteredSet.length)];
        } else {
            chosenItem = availableItems[Math.floor(Math.random() * availableItems.length)];
        }

        const quoteText = typeof chosenItem === 'object' ? chosenItem.text : chosenItem;
        this.usedQuotes[context].push(quoteText);

        if (window.ClippyAgent && typeof window.ClippyAgent.say === 'function') {
            window.ClippyAgent.say(quoteText, { tts: true, delay: 6000 });
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ClippyQuotesManager.init());
} else {
    ClippyQuotesManager.init();
}