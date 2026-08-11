/**
 * Markdown Parser Utility 
 * Supporta: heading h1-h6, hr, code fence, blockquote, liste (annidate,
 * puntate/numerate, miste), tabelle GFM con allineamento, link/immagini
 * dirette E link-reference style [testo][ref] / ![alt][ref].
 * Sicurezza: escaping HTML integrale + whitelist di schemi URL, nessun
 * pass-through di HTML grezzo dal sorgente markdown.
 * Supporta anche: footnote [^1] con definizione [^1]: testo, emoji shortcode
 * :smile: (sottoinsieme comune), math inline $...$ e block $$...$$.
 */

const MarkdownParser = (() => {

    // ---------- stato per-parse (reset a ogni chiamata) ----------
    let currentRefs = {};
    let footnoteDefs = {};
    let footnoteOrder = [];
    let usedSlugs;

    // ---------- utility ----------

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function sanitizeUrl(url) {
        const t = (url || '').trim();
        if (/^(https?:|mailto:)/i.test(t)) return t;
        if (/^[/#.]/.test(t)) return t;
        if (!/^[a-z][a-z0-9+.-]*:/i.test(t)) return t;
        return '#';
    }

    function slugify(text) {
        const base = text.toLowerCase()
            .replace(/[*_~`]/g, '')
            .replace(/[^\w\s\u00C0-\u017F-]/g, '')
            .trim().replace(/\s+/g, '-') || 'section';
        let slug = base, n = 1;
        while (usedSlugs.has(slug)) { slug = `${base}-${n}`; n++; }
        usedSlugs.add(slug);
        return slug;
    }

    // ---------- sanitizer HTML grezzo (whitelist tag + attributi) ----------

    const HTML_BLOCK_TAGS = ['div','span','p','h1','h2','h3','h4','h5','h6','table','thead','tbody',
        'tfoot','tr','td','th','details','summary','kbd','ins','del','sub','sup','mark','abbr',
        'dl','dt','dd','ul','ol','li','br','hr','a','img','blockquote','pre','code','small',
        'strong','em','b','i'];

    const ATTR_WHITELIST = {
        a: ['href', 'title'], img: ['src', 'alt', 'title', 'width', 'height'],
        div: ['align'], table: ['align'], td: ['align', 'colspan', 'rowspan'],
        th: ['align', 'colspan', 'rowspan'], details: ['open'], abbr: ['title'],
    };

    function sanitizeAttrs(tag, attrString) {
        const allowed = ATTR_WHITELIST[tag] || [];
        if (!attrString) return '';
        const re = /([a-zA-Z-]+)\s*=\s*"([^"]*)"|([a-zA-Z-]+)\s*=\s*'([^']*)'/g;
        let out = '', m;
        while ((m = re.exec(attrString))) {
            const name = (m[1] || m[3]).toLowerCase();
            let val = m[2] !== undefined ? m[2] : m[4];
            if (!allowed.includes(name) || /^on/i.test(name)) continue;
            if (name === 'href' || name === 'src') val = sanitizeUrl(val);
            out += ` ${name}="${escapeHtml(val)}"`;
        }
        return out;
    }

    function sanitizeHtmlFragment(str) {
        return str.replace(
            /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g,
            (whole, closing, tag, attrs, selfClose, text) => {
                if (text !== undefined) return escapeHtml(text);
                const t = tag.toLowerCase();
                if (!HTML_BLOCK_TAGS.includes(t)) return '';
                if (closing) return `</${t}>`;
                return `<${t}${sanitizeAttrs(t, attrs)}${selfClose ? ' /' : ''}>`;
            }
        );
    }

    function isHtmlBlockLine(line) {
        const m = line.trim().match(/^<\/?([a-zA-Z][a-zA-Z0-9]*)/);
        return !!(m && HTML_BLOCK_TAGS.includes(m[1].toLowerCase()));
    }

    // ---------- emoji shortcode (sottoinsieme comune) ----------

    const EMOJI_MAP = {
        smile:'😄', joy:'😂', wink:'😉', thinking:'🤔', heart:'❤️', star:'⭐', fire:'🔥',
        rocket:'🚀', tada:'🎉', sparkles:'✨', warning:'⚠️', white_check_mark:'✅', x:'❌',
        heavy_check_mark:'✔️', bulb:'💡', lock:'🔒', key:'🔑', mag:'🔍', zap:'⚡',
        package:'📦', book:'📘', computer:'💻', bug:'🐛', gear:'⚙️', memo:'📝',
        construction:'🚧', eyes:'👀', thumbsup:'👍', thumbsdown:'👎', clap:'👏',
        checkered_flag:'🏁', hourglass:'⏳', calendar:'📅', email:'📧', globe_with_meridians:'🌐',
        coffee:'☕', gift:'🎁', trophy:'🏆', robot:'🤖',
    };

    // ---------- inline ----------

    function parseInline(raw) {
        const store = [];
        const stash = (html) => { store.push(html); return `\u0000${store.length - 1}\u0000`; };

        let out = raw;

        // 0. escape esplicito \X
        out = out.replace(/\\([\\`*_{}[\]()#+\-.!~>])/g, (_, ch) => `\u0001${ch.charCodeAt(0)}\u0001`);

        // 1. code span
        out = out.replace(/`([^`]+?)`/g, (_, c) => stash(`<code>${escapeHtml(c)}</code>`));

        // 2. math inline $...$
        out = out.replace(/\$([^$\n]+?)\$/g, (_, m) => stash(`<code class="md-math-inline">${escapeHtml(m)}</code>`));

        // 3. footnote ref [^1]
        out = out.replace(/\[\^([^\]]+)\]/g, (_, label) => {
            const key = label.trim().toLowerCase();
            if (!(key in footnoteDefs)) return `[^${label}]`;
            if (!footnoteOrder.includes(key)) footnoteOrder.push(key);
            const n = footnoteOrder.indexOf(key) + 1;
            return stash(`<sup id="fnref-${n}"><a href="#fn-${n}">${n}</a></sup>`);
        });

        // 4. immagini reference / dirette
        out = out.replace(/!\[([^\]]*)\]\[([^\]]*)\]/g, (_, alt, ref) => {
            const d = currentRefs[(ref || alt).trim().toLowerCase()];
            return d ? stash(img(alt, d.url, d.title)) : `![${alt}][${ref}]`;
        });
        out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
            (_, alt, url, title) => stash(img(alt, url, title)));

        // 5. autolink <url> / <email>
        out = out.replace(/<((?:https?:\/\/|mailto:)[^\s<>]+)>/g,
            (_, u) => stash(link(u.replace(/^mailto:/, ''), u)));
        out = out.replace(/<([^\s<>@]+@[^\s<>]+\.[^\s<>]+)>/g,
            (_, e) => stash(link(e, `mailto:${e}`)));

        // 6. link reference / diretti
        out = out.replace(/\[([^\]]+)\]\[([^\]]*)\]/g, (_, label, ref) => {
            const d = currentRefs[(ref || label).trim().toLowerCase()];
            return d ? stash(link(label, d.url, d.title)) : `[${label}][${ref}]`;
        });
        out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)/g,
            (_, label, url, title) => stash(link(label, url, title)));

        // 7. bare URL (linkify)
        out = out.replace(/(^|[\s(])(https?:\/\/[^\s<>()]+)/g, (_, pre, u) => pre + stash(link(u, u)));

        // 8. emoji shortcode (sicuro pre-escape: sono unicode puro)
        out = out.replace(/:([a-z0-9_+\-]+):/g, (whole, name) => EMOJI_MAP[name] || whole);

        // 9. escape del testo semplice rimasto
        out = escapeHtml(out);

        // 10. enfasi (ordine: tripla -> doppia -> singola -> barrato)
        out = out.replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        out = out.replace(/\*\*([^*]+?)\*\*|__([^_]+?)__/g, (_, a, b) => `<strong>${a || b}</strong>`);
        out = out.replace(/\*([^*]+?)\*|_([^_]+?)_/g, (_, a, b) => `<em>${a || b}</em>`);
        out = out.replace(/~~([^~]+?)~~/g, (_, s) => `<del>${s}</del>`);

        // 11. ripristino escape espliciti e placeholder
        out = out.replace(/\u0001(\d+)\u0001/g, (_, c) => escapeHtml(String.fromCharCode(Number(c))));
        out = out.replace(/\u0000(\d+)\u0000/g, (_, idx) => store[Number(idx)]);

        return out;
    }

    function img(alt, url, title) {
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${escapeHtml(sanitizeUrl(url))}" alt="${escapeHtml(alt)}"${t} loading="lazy" style="max-width:100%;border-radius:4px;">`;
    }
    function link(label, url, title) {
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<a href="${escapeHtml(sanitizeUrl(url))}"${t} target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    }

    // ---------- riferimenti / footnote (estrazione globale) ----------

    function extractReferences(lines) {
        const RE = /^ {0,3}\[([^\]]+)\]:\s*(\S+)(?:\s+"([^"]*)"|\s+'([^']*)')?\s*$/;
        const refs = {}, kept = [];
        for (const l of lines) {
            const m = l.match(RE);
            if (m && !m[1].startsWith('^')) refs[m[1].trim().toLowerCase()] = { url: m[2], title: m[3] || m[4] || '' };
            else kept.push(l);
        }
        return { refs, kept };
    }
    function extractFootnoteDefs(lines) {
        const RE = /^ {0,3}\[\^([^\]]+)\]:\s*(.*)$/;
        const defs = {}, kept = [];
        for (const l of lines) {
            const m = l.match(RE);
            if (m) defs[m[1].trim().toLowerCase()] = m[2];
            else kept.push(l);
        }
        return { defs, kept };
    }

    // ---------- liste annidate + task list ----------

    const RE_LIST_ITEM = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

    function parseListBlock(lines) {
        let i = 0;
        function parseLevel(indent) {
            const items = [];
            let ordered = null;
            while (i < lines.length) {
                const line = lines[i];
                if (line.trim() === '') { i++; continue; }
                const m = line.match(RE_LIST_ITEM);
                if (!m || m[1].length !== indent) break;
                if (ordered === null) ordered = /\d+\./.test(m[2]);
                i++;
                const task = m[3].match(/^\[([ xX])\]\s+(.*)$/);
                let cls = '', body;
                if (task) {
                    cls = ' class="task-list-item"';
                    body = `<input type="checkbox" disabled${/x/i.test(task[1]) ? ' checked' : ''}> ${parseInline(task[2])}`;
                } else {
                    body = parseInline(m[3]);
                }
                let j = i;
                while (j < lines.length && lines[j].trim() === '') j++;
                const nm = j < lines.length ? lines[j].match(RE_LIST_ITEM) : null;
                if (nm && nm[1].length > indent) { i = j; body += parseLevel(nm[1].length); }
                items.push(`<li${cls}>${body}</li>`);
            }
            const tag = ordered ? 'ol' : 'ul';
            return `<${tag}>${items.join('')}</${tag}>`;
        }
        return parseLevel(0);
    }

    // ---------- tabelle GFM ----------

    const RE_TABLE_DELIM = /^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$/;

    function splitRow(line) {
        let t = line.trim();
        if (t.startsWith('|')) t = t.slice(1);
        if (t.endsWith('|')) t = t.slice(0, -1);
        const cells = []; let cur = '';
        for (let k = 0; k < t.length; k++) {
            if (t[k] === '\\' && t[k + 1] === '|') { cur += '|'; k++; continue; }
            if (t[k] === '|') { cells.push(cur.trim()); cur = ''; continue; }
            cur += t[k];
        }
        cells.push(cur.trim());
        return cells;
    }
    function parseAlign(line) {
        return splitRow(line).map(c => {
            const l = c.startsWith(':'), r = c.endsWith(':');
            return l && r ? 'center' : r ? 'right' : l ? 'left' : '';
        });
    }

    // ---------- alert GitHub ----------

    const ALERT_ICON = { NOTE: 'ℹ️', TIP: '💡', IMPORTANT: '❗', WARNING: '⚠️', CAUTION: '🚫' };

    // ---------- blocchi ----------

    const RE_HEADING = /^ {0,3}(#{1,6}) +(.*?) *#*$/;
    const RE_FENCE   = /^ {0,3}```(\w*)\s*$/;
    const RE_QUOTE   = /^ {0,3}> ?/;
    const RE_HR      = /^ {0,3}([-*_])(?: *\1){2,} *$/;

    function isBlockStart(line) {
        return line.trim() === '' || line.trim() === '$$' || RE_HEADING.test(line) || RE_FENCE.test(line) ||
               RE_QUOTE.test(line) || RE_LIST_ITEM.test(line) || RE_HR.test(line) ||
               isHtmlBlockLine(line) || line.includes('|');
    }

    function parseBlocks(text) {
        const lines = text.split('\n');
        const out = [];
        let i = 0;

        while (i < lines.length) {
            const line = lines[i];

            if (line.trim() === '') { i++; continue; }
            if (RE_HR.test(line)) { out.push('<hr>'); i++; continue; }

            const h = line.match(RE_HEADING);
            if (h) {
                const level = h[1].length;
                const slug = slugify(h[2]);
                out.push(`<h${level} id="${slug}">${parseInline(h[2])}</h${level}>`);
                i++; continue;
            }

            if (line.trim() === '$$') {
                const buf = []; i++;
                while (i < lines.length && lines[i].trim() !== '$$') { buf.push(lines[i]); i++; }
                i++;
                out.push(`<pre class="md-math-block"><code>${escapeHtml(buf.join('\n'))}</code></pre>`);
                continue;
            }

            if (RE_FENCE.test(line)) {
                const lang = line.match(RE_FENCE)[1];
                const buf = []; i++;
                while (i < lines.length && !RE_FENCE.test(lines[i])) { buf.push(lines[i]); i++; }
                i++;
                const code = `<pre data-lang="${escapeHtml(lang)}"><code>${escapeHtml(buf.join('\n'))}</code></pre>`;
                if (lang === 'mermaid') {
                    out.push(`<div class="md-mermaid-fallback"><p class="md-mermaid-label">📊 Diagramma Mermaid (sorgente, non renderizzato graficamente)</p>${code}</div>`);
                } else {
                    out.push(code);
                }
                continue;
            }

            if (RE_QUOTE.test(line)) {
                const buf = [];
                while (i < lines.length && RE_QUOTE.test(lines[i])) { buf.push(lines[i].replace(RE_QUOTE, '')); i++; }
                const alert = buf[0] && buf[0].match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*$/i);
                if (alert) {
                    const type = alert[1].toUpperCase();
                    out.push(`<div class="md-alert md-alert-${type.toLowerCase()}"><p class="md-alert-title">${ALERT_ICON[type]} ${type}</p>${parseBlocks(buf.slice(1).join('\n'))}</div>`);
                } else {
                    out.push(`<blockquote>${parseBlocks(buf.join('\n'))}</blockquote>`);
                }
                continue;
            }

            if (isHtmlBlockLine(line)) { out.push(sanitizeHtmlFragment(line)); i++; continue; }

            if (line.includes('|') && i + 1 < lines.length && RE_TABLE_DELIM.test(lines[i + 1])) {
                const header = splitRow(line);
                const aligns = parseAlign(lines[i + 1]);
                i += 2;
                const rows = [];
                while (i < lines.length && lines[i].trim() !== '' && lines[i].includes('|')) { rows.push(splitRow(lines[i])); i++; }
                const a = x => x ? ` style="text-align:${x}"` : '';
                let html = '<table><thead><tr>';
                header.forEach((c, idx) => html += `<th${a(aligns[idx])}>${parseInline(c)}</th>`);
                html += '</tr></thead><tbody>';
                rows.forEach(r => {
                    html += '<tr>';
                    header.forEach((_, idx) => html += `<td${a(aligns[idx])}>${parseInline(r[idx] || '')}</td>`);
                    html += '</tr>';
                });
                out.push(html + '</tbody></table>');
                continue;
            }

            if (RE_LIST_ITEM.test(line)) {
                const buf = [];
                while (i < lines.length) {
                    const cur = lines[i];
                    if (cur.trim() === '') {
                        let j = i + 1;
                        while (j < lines.length && lines[j].trim() === '') j++;
                        if (j < lines.length && RE_LIST_ITEM.test(lines[j])) { buf.push(cur); i++; continue; }
                        break;
                    }
                    if (RE_LIST_ITEM.test(cur)) { buf.push(cur); i++; continue; }
                    break;
                }
                out.push(parseListBlock(buf));
                continue;
            }

            const buf = [];
            while (i < lines.length && !isBlockStart(lines[i])) { buf.push(lines[i]); i++; }
            out.push(`<p>${parseInline(buf.join(' '))}</p>`);
        }
        return out.join('\n');
    }

    return {
        parse(text) {
            if (!text) return '<p style="color:#888;">Nessun contenuto da visualizzare.</p>';
            usedSlugs = new Set();
            footnoteOrder = [];
            const lines = text.replace(/\r\n?/g, '\n').split('\n');
            const { refs, kept: afterRefs } = extractReferences(lines);
            const { defs, kept } = extractFootnoteDefs(afterRefs);
            currentRefs = refs; footnoteDefs = defs;

            let html = parseBlocks(kept.join('\n'));

            if (footnoteOrder.length) {
                html += '<hr><section class="footnotes"><ol>';
                footnoteOrder.forEach((key, idx) => {
                    const n = idx + 1;
                    html += `<li id="fn-${n}">${parseInline(footnoteDefs[key] || '')} <a href="#fnref-${n}" class="footnote-back">↩</a></li>`;
                });
                html += '</ol></section>';
            }
            currentRefs = {}; footnoteDefs = {};
            return html;
        }
    };
})();