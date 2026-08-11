const metricCollector = {
    getCanvasHash() {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 200;
            canvas.height = 40;
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.fillText("Clippy PoC 1.0", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Clippy PoC 1.0", 4, 17);
            const data = canvas.toDataURL();
            let hash = 0;
            for (let i = 0; i < data.length; i++) {
                hash = ((hash << 5) - hash) + data.charCodeAt(i);
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16).toUpperCase();
        } catch (e) {
            return "n/a";
        }
    },

    getWebGLInfo() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (!gl) return { vendor: 'n/a', renderer: 'n/a', exts: 0 };
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            const extensions = gl.getSupportedExtensions() ? gl.getSupportedExtensions().length : 0;
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'n/a',
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'n/a',
                    exts: extensions
                };
            }
            return { vendor: gl.getParameter(gl.VENDOR) || 'n/a', renderer: gl.getParameter(gl.RENDERER) || 'n/a', exts: extensions };
        } catch (e) {
            return { vendor: 'n/a', renderer: 'n/a', exts: 0 };
        }
    },

    collect() {
        const webgl = this.getWebGLInfo();
        const ua = navigator.userAgent || 'n/a';
        
        let os = "n/a";
        if (ua.indexOf("Win") !== -1) os = "Windows";
        else if (ua.indexOf("Mac") !== -1) os = "macOS";
        else if (ua.indexOf("Linux") !== -1) os = "Linux";
        else if (ua.indexOf("Android") !== -1) os = "Android";
        else if (ua.indexOf("like Mac") !== -1) os = "iOS";

        return {
            canvasHash: this.getCanvasHash(),
            os: os,
            userAgent: ua,
            platform: navigator.platform || 'n/a',
            language: navigator.language || 'n/a',
            languages: navigator.languages ? navigator.languages.join(', ') : 'n/a',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'n/a',
            tzOffset: (new Date().getTimezoneOffset() || 0) + " min",
            localTime: new Date().toLocaleTimeString('it-IT') || 'n/a',
            cores: parseInt(navigator.hardwareConcurrency) || 4,
            memory: navigator.deviceMemory ? navigator.deviceMemory + " GB" : 'n/a',
            touchPoints: navigator.maxTouchPoints || 0,
            touchSupport: ('ontouchstart' in window) ? 'Sì' : 'No',
            gpuVendor: webgl.vendor || 'n/a',
            gpuRenderer: webgl.renderer || 'n/a',
            gpuExts: webgl.exts || 0,
            screenRes: `${window.screen.width || 0}x${window.screen.height || 0}`,
            availableRes: `${window.screen.availWidth || 0}x${window.screen.availHeight || 0}`,
            viewportRes: `${window.innerWidth || 0}x${window.innerHeight || 0}`,
            pixelRatio: window.devicePixelRatio || 1,
            colorDepth: (window.screen.colorDepth || 0) + " bit",
            cookiesEnabled: navigator.cookieEnabled ? 'Sì' : 'No',
            localStorage: ('localStorage' in window) ? 'Disponibile' : 'Non disp.',
            sessionStorage: ('sessionStorage' in window) ? 'Disponibile' : 'Non disp.',
            indexedDB: ('indexedDB' in window) ? 'Disponibile' : 'Non disp.',
            isOnline: navigator.onLine ? 'Connesso' : 'Disconnesso',
            pdfViewer: navigator.pdfViewerEnabled ? 'Sì' : 'No',
            prefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Sì' : 'No',
            prefersContrast: window.matchMedia('(prefers-contrast: more)').matches ? 'Alto contrasto' : 'Standard',
            webAssembly: (typeof WebAssembly === 'object') ? 'Supportato' : 'No',
            webRTC: (typeof RTCPeerConnection === 'function') ? 'Disponibile' : 'No'
        };
    },

    syncWithDatabase(data) {
        return fetch('/api/telemetry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .catch(err => console.error("Database sync failed:", err));
    }
};
