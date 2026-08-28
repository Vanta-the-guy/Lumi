const GNMATH_API = "https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json";
const GNMATH_COVER = "https://cdn.jsdelivr.net/gh/freebuisness/covers@main";
const GNMATH_HTML = "https://cdn.jsdelivr.net/gh/freebuisness/html@main";
const UGS_API = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-json@main/games.json";
const UGS_HTML_URL1 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-1@main";
const UGS_HTML_URL2 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-2@main";
const UGS_HTML_URL3 = "https://cdn.jsdelivr.net/gh/Sea-Math/ugs-3@main";
const DAKNUX_API_URLS = [
    "https://cdn.jsdelivr.net/gh/daknux/assets@latest/zones.json",
    "https://cdn.jsdelivr.net/gh/daknux/assets@master/zones.json"
];
let DAKNUX_API = DAKNUX_API_URLS[Math.floor(Math.random() * DAKNUX_API_URLS.length)];
const DAKNUX_COVER = "https://cdn.jsdelivr.net/gh/daknux/covers@main";
const DAKNUX_HTML = "https://cdn.jsdelivr.net/gh/daknux/html@main";
const FALLBACK_IMAGE = "https://s3.envato.com/files/fed15e2f-5abf-4758-a1a2-3e3d68013f0d/inline_image_preview.jpg";

class LumiSDK {
    constructor() {
        this.games = [];
        this.filteredGames = [];
        this.currentPage = 1;
        this.currentSearch = "";
        this.currentSource = "All";
        this.currentGameUrl = "";
        this.currentGameHtml = "";
        this.currentGameTitle = "game";

        this.config = {
            container: '#games',
            columns: 8,
            rows: 4,
            gamesPerPage: 32,
            fontFamily: "'Inter', 'Poppins', 'Segoe UI', sans-serif"
        };

        this.colors = {
            menuBackground: "transparent", gameBackground: "red", text: "#ffffff",
            searchBackground: "transparent", searchBorder: "#222", searchFocus: "#555",
            dropdownBackground: "#0a0a0a", dropdownBorder: "#222", cardBackground: "#050505",
            cardBorder: "#1a1a1a", cardHoverBorder: "#444", badgeBackground: "rgba(0,0,0,0.9)",
            badgeText: "#ffffff", randomBtnBg: "#ffffff", randomBtnText: "#000000",
            randomBtnHover: "#e0e0e0", pageBtnBg: "#0a0a0a", pageBtnText: "#ffffff",
            pageBtnBorder: "#222", pageBtnActiveBg: "#ffffff", pageBtnActiveText: "#000000",
            actionBtnBorder: "#333", backBtnBg: "#aa2e25", backBtnHover: "#d32f2f",
            backBtnText: "#ffffff", downloadBtnBg: "#000000", downloadBtnHover: "#1a1a1a",
            downloadBtnText: "#ffffff", blankBtnBg: "#000000", blankBtnHover: "#1a1a1a",
            blankBtnText: "#ffffff", fullscreenBtnBg: "#0a0a0a", fullscreenBtnHover: "#1a1a1a",
            fullscreenBtnText: "#ffffff"
        };
    }

    async init(options) {
        this.config = { ...this.config, ...options };
        if (options.colors) {
            this.colors = { ...this.colors, ...options.colors };
        }

        this.container = document.querySelector(this.config.container);
        if (!this.container) return;

        this.injectStyles();
        this.buildUI();
        await this.loadGames();
        this.applyFilters();
    }

    injectStyles() {
        if (document.getElementById('lumi-styles')) {
            document.getElementById('lumi-styles').remove();
        }

        const c = this.colors;
        const style = document.createElement('style');
        style.id = 'lumi-styles';

        style.innerHTML = `
            .lumi-wrapper { font-family: ${this.config.fontFamily}; background: ${c.menuBackground}; color: ${c.text}; width: 100vw; height: 100vh; padding: 2vh 2vw; box-sizing: border-box; display: flex; flex-direction: column; }
            .lumi-wrapper *, .lumi-wrapper *::before, .lumi-wrapper *::after { box-sizing: border-box; }
            .lumi-menu-view { display: flex; flex-direction: column; height: 100%; width: 100%; }
            .lumi-header { flex-shrink: 0; display: flex; gap: 1vw; margin-bottom: 2vh; align-items: center; }

            .lumi-search { flex-grow: 1; padding: 1.5vh 1.5vw; border: 1px solid ${c.searchBorder}; border-radius: 8px; background: ${c.searchBackground}; color: ${c.text}; font-size: max(14px, 1vw); outline: none; transition: all 0.3s ease; }
            .lumi-search:focus { border-color: ${c.searchFocus}; }
            .lumi-search::placeholder { color: #666; }

            .lumi-source-select { padding: 1.5vh 1.5vw; border: 1px solid ${c.dropdownBorder}; border-radius: 8px; background: ${c.dropdownBackground}; color: ${c.text}; font-size: max(14px, 1vw); outline: none; cursor: pointer; transition: all 0.3s ease; }
            .lumi-source-select:hover { filter: brightness(1.2); }

            .lumi-btn { background: ${c.randomBtnBg}; color: ${c.randomBtnText}; border: none; padding: 1.5vh 2vw; border-radius: 8px; cursor: pointer; font-size: max(13px, 0.9vw); font-weight: 700; transition: all 0.2s ease; text-transform: uppercase; }
            .lumi-btn:hover { background: ${c.randomBtnHover}; transform: translateY(-2px); }
            .lumi-btn:active { transform: translateY(1px); }

            .lumi-grid { flex-grow: 1; display: grid; grid-template-columns: repeat(${this.config.columns}, 1fr); grid-template-rows: repeat(${this.config.rows}, 1fr); gap: 1.5vh 1vw; min-height: 0; }

            .lumi-game-card { background: ${c.cardBackground}; border-radius: 12px; overflow: hidden; position: relative; transition: all 0.2s ease; cursor: pointer; border: 1px solid ${c.cardBorder}; width: 100%; height: 100%; }
            .lumi-game-card:hover { transform: scale(1.02); border-color: ${c.cardHoverBorder}; box-shadow: 0 10px 30px rgba(0,0,0,0.8); z-index: 10; }
            .lumi-game-img { width: 100%; height: 100%; object-fit: cover; transition: all 0.3s ease; }
            .lumi-game-card:hover .lumi-game-img { filter: brightness(0.6); transform: scale(1.05); }

            .lumi-badge { position: absolute; top: 8px; right: 8px; background: ${c.badgeBackground}; color: ${c.badgeText}; font-size: max(9px, 0.7vw); font-weight: 700; padding: 4px 8px; border-radius: 6px; z-index: 2; border: 1px solid #333; text-transform: uppercase; }
            .lumi-game-title-overlay { position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, #000 0%, rgba(0,0,0,0.9) 60%, transparent 100%); color: ${c.text}; padding: 20px 10px 10px 10px; font-size: max(12px, 0.9vw); font-weight: 700; text-align: center; opacity: 0; transition: opacity 0.2s ease; pointer-events: none; z-index: 2; }
            .lumi-game-card:hover .lumi-game-title-overlay { opacity: 1; }

            .lumi-pagination { flex-shrink: 0; display: flex; justify-content: center; gap: 0.5vw; margin-top: 2vh; }
            .lumi-page-btn { padding: 1vh 1.5vw; border: 1px solid ${c.pageBtnBorder}; background: ${c.pageBtnBg}; color: ${c.pageBtnText}; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; font-weight: 600; font-size: max(13px, 0.9vw); }
            .lumi-page-btn:hover { filter: brightness(1.2); }
            .lumi-page-btn.active { background: ${c.pageBtnActiveBg}; color: ${c.pageBtnActiveText}; border-color: ${c.pageBtnActiveBg}; }

            .lumi-game-view { display: none; position: relative; width: 100%; height: 100%; background: ${c.gameBackground}; border-radius: 12px; overflow: hidden; border: 1px solid #222; }
            .lumi-iframe { width: 100%; height: 100%; border: none; background: transparent; }
            .lumi-toolbar { position: absolute; top: 12px; left: 12px; display: flex; gap: 10px; z-index: 10; }

            .lumi-action-btn { border: 1px solid ${c.actionBtnBorder}; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.2s ease; }
            .lumi-back-btn { background: ${c.backBtnBg}; color: ${c.backBtnText}; }
            .lumi-back-btn:hover { background: ${c.backBtnHover}; }
            .lumi-download-btn { background: ${c.downloadBtnBg}; color: ${c.downloadBtnText}; }
            .lumi-download-btn:hover { background: ${c.downloadBtnHover}; }
            .lumi-aboutblank-btn { background: ${c.blankBtnBg}; color: ${c.blankBtnText}; }
            .lumi-aboutblank-btn:hover { background: ${c.blankBtnHover}; }
            .lumi-fullscreen-btn { background: ${c.fullscreenBtnBg}; color: ${c.fullscreenBtnText}; }
            .lumi-fullscreen-btn:hover { background: ${c.fullscreenBtnHover}; }
        `;

        document.head.appendChild(style);
    }

    buildUI() {
        this.container.innerHTML = `
            <div class="lumi-wrapper" id="lumi-main-wrapper">
                <div class="lumi-menu-view">
                    <div class="lumi-header">
                        <select class="lumi-source-select">
                            <option value="All">All Sources</option>
                            <option value="GNMath">GNMath</option>
                            <option value="UGS">UGS</option>
                            <option value="Daknux">Daknux</option>
                        </select>
                        <input type="text" class="lumi-search" placeholder="Search games...">
                        <button class="lumi-btn lumi-random-btn">Random Game</button>
                    </div>
                    <div class="lumi-grid"></div>
                    <div class="lumi-pagination"></div>
                </div>
                <div class="lumi-game-view">
                    <div class="lumi-toolbar">
                        <button class="lumi-action-btn lumi-back-btn">Back</button>
                        <button class="lumi-action-btn lumi-download-btn">Download .html</button>
                        <button class="lumi-action-btn lumi-aboutblank-btn">Open in about:blank</button>
                        <button class="lumi-action-btn lumi-fullscreen-btn">Fullscreen</button>
                    </div>
                    <iframe class="lumi-iframe" src="" sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-forms" allowfullscreen></iframe>
                </div>
            </div>
        `;

        this.wrapper = this.container.querySelector('#lumi-main-wrapper');
        this.menuView = this.container.querySelector('.lumi-menu-view');
        this.grid = this.container.querySelector('.lumi-grid');
        this.pagination = this.container.querySelector('.lumi-pagination');
        this.searchInput = this.container.querySelector('.lumi-search');
        this.sourceSelect = this.container.querySelector('.lumi-source-select');
        this.randomBtn = this.container.querySelector('.lumi-random-btn');

        this.gameView = this.container.querySelector('.lumi-game-view');
        this.iframe = this.container.querySelector('.lumi-iframe');
        this.backBtn = this.container.querySelector('.lumi-back-btn');
        this.downloadBtn = this.container.querySelector('.lumi-download-btn');
        this.aboutBlankBtn = this.container.querySelector('.lumi-aboutblank-btn');
        this.fullscreenBtn = this.container.querySelector('.lumi-fullscreen-btn');

        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value;
            this.applyFilters();
        });

        this.sourceSelect.addEventListener('change', (e) => {
            this.currentSource = e.target.value;
            this.applyFilters();
        });

        this.randomBtn.addEventListener('click', () => this.playRandom());
        this.backBtn.addEventListener('click', () => this.closeGame());
        this.downloadBtn.addEventListener('click', () => this.downloadGame());

        this.aboutBlankBtn.addEventListener('click', () => {
            const win = window.open('about:blank', '_blank');
            if (win) {
                win.document.write(`<!DOCTYPE html><html><head><title>${this.currentGameTitle}</title><style>body, html { margin:0; padding:0; width:100%; height:100%; overflow:hidden; background:${this.colors.gameBackground}; }</style></head><body></body></html>`);
                win.document.close();

                const iframe = win.document.createElement('iframe');
                iframe.style.cssText = "width:100%; height:100%; border:none; background:transparent;";
                iframe.setAttribute("sandbox", "allow-scripts allow-same-origin allow-pointer-lock allow-forms");
                iframe.setAttribute("allowfullscreen", "true");

                if (this.currentGameHtml) {
                    win.document.body.appendChild(iframe);
                    iframe.contentDocument.open();
                    iframe.contentDocument.write(this.currentGameHtml);
                    iframe.contentDocument.close();
                } else {
                    iframe.src = this.currentGameUrl;
                    win.document.body.appendChild(iframe);
                }
            }
        });

        this.fullscreenBtn.addEventListener('click', () => {
            if (this.gameView.requestFullscreen) {
                this.gameView.requestFullscreen();
            } else if (this.gameView.webkitRequestFullscreen) {
                this.gameView.webkitRequestFullscreen();
            } else if (this.iframe.requestFullscreen) {
                this.iframe.requestFullscreen();
            }
        });
    }

    cleanPath(path) {
        if (!path) return '';
        return path
            .replace(/%7BHTML_URL%7D\//gi, '')
            .replace(/{HTML_URL}\//gi, '')
            .replace(/%7BCOVER_URL%7D\//gi, '')
            .replace(/{COVER_URL}\//gi, '')
            .replace(/^\//, '');
    }

    async loadGames() {
        let loadedGames = [];
        const fetchJSON = async (url) => {
            try {
                return await (await fetch(url)).json();
            } catch (e) {
                return [];
            }
        };

        const gnmathData = await fetchJSON(GNMATH_API);
        gnmathData.forEach(g => {
            const cleanUrlParam = this.cleanPath(g.url);
            const gameUrl = cleanUrlParam.includes('.') ? `${GNMATH_HTML}/${cleanUrlParam}` : `${GNMATH_HTML}/${cleanUrlParam}/index.html`;

            loadedGames.push({
                title: g.title || g.name,
                cover: g.cover ? `${GNMATH_COVER}/${this.cleanPath(g.cover)}` : FALLBACK_IMAGE,
                url: gameUrl,
                source: "GNMath"
            });
        });

        const ugsData = await fetchJSON(UGS_API);
        ugsData.forEach(g => {
            let ugsHtmlBase = UGS_HTML_URL1;
            let rawUrl = g.url || "";

            if (rawUrl.includes("{HTML_URL2}") || g.repo === 'ugs-2') {
                ugsHtmlBase = UGS_HTML_URL2;
            } else if (rawUrl.includes("{HTML_URL3}") || g.repo === 'ugs-3') {
                ugsHtmlBase = UGS_HTML_URL3;
            }

            let finalCover = g.cover || g.image || "";
            finalCover = finalCover.replace(/{COVER_URL}/g, UGS_HTML_URL1.replace('/ugs-1@main', '/ugs-covers@main'));
            if (!finalCover.startsWith('http')) {
                finalCover = `${UGS_HTML_URL1}/${this.cleanPath(finalCover)}`;
            }

            let finalUrl = rawUrl
                .replace(/{HTML_URL1}/g, UGS_HTML_URL1)
                .replace(/{HTML_URL2}/g, UGS_HTML_URL2)
                .replace(/{HTML_URL3}/g, UGS_HTML_URL3);

            if (!finalUrl.startsWith('http')) {
                finalUrl = `${ugsHtmlBase}/${this.cleanPath(finalUrl)}`;
            }

            loadedGames.push({
                title: g.title || g.name,
                cover: finalCover || FALLBACK_IMAGE,
                url: finalUrl,
                source: "UGS"
            });
        });

        const daknuxData = await fetchJSON(DAKNUX_API);
        daknuxData.forEach(g => {
            const cleanUrlParam = this.cleanPath(g.url);
            const gameUrl = cleanUrlParam.includes('.') ? `${DAKNUX_HTML}/${cleanUrlParam}` : `${DAKNUX_HTML}/${cleanUrlParam}/index.html`;

            loadedGames.push({
                title: g.title || g.name,
                cover: g.cover ? `${DAKNUX_COVER}/${this.cleanPath(g.cover)}` : FALLBACK_IMAGE,
                url: gameUrl,
                source: "Daknux"
            });
        });

        this.games = loadedGames.filter(game => game.url && game.title);
    }

    applyFilters() {
        const lowerQuery = this.currentSearch.toLowerCase();

        this.filteredGames = this.games.filter(game => {
            const matchesSearch = game.title.toLowerCase().includes(lowerQuery);
            const matchesSource = this.currentSource === "All" || game.source === this.currentSource;
            return matchesSearch && matchesSource;
        });

        this.currentPage = 1;
        this.updateView();
    }

    renderGrid() {
        this.grid.innerHTML = '';
        const start = (this.currentPage - 1) * this.config.gamesPerPage;
        const pageGames = this.filteredGames.slice(start, start + this.config.gamesPerPage);

        const fragment = document.createDocumentFragment();
        pageGames.forEach(game => {
            const card = document.createElement('div');
            card.className = 'lumi-game-card';
            card.innerHTML = `
                <span class="lumi-badge">${game.source}</span>
                <img src="${game.cover}" alt="${game.title}" class="lumi-game-img" loading="lazy" onerror="this.src='${FALLBACK_IMAGE}'">
                <div class="lumi-game-title-overlay">${game.title}</div>
            `;
            card.onclick = () => this.playGame(game);
            fragment.appendChild(card);
        });

        this.grid.appendChild(fragment);
    }

    renderPagination() {
        this.pagination.innerHTML = '';
        const totalPages = Math.ceil(this.filteredGames.length / this.config.gamesPerPage);
        if (totalPages <= 1) return;

        const fragment = document.createDocumentFragment();

        const createBtn = (text, page, isActive = false) => {
            const btn = document.createElement('button');
            btn.className = `lumi-page-btn ${isActive ? 'active' : ''}`;
            btn.innerText = text;
            btn.onclick = () => {
                this.currentPage = page;
                this.updateView();
            };
            fragment.appendChild(btn);
        };

        if (this.currentPage > 1) createBtn('Prev', this.currentPage - 1);

        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        for (let i = startPage; i <= endPage; i++) {
            createBtn(i, i, i === this.currentPage);
        }

        if (this.currentPage < totalPages) createBtn('Next', this.currentPage + 1);

        this.pagination.appendChild(fragment);
    }

    updateView() {
        this.renderGrid();
        this.renderPagination();
    }

    async playGame(game) {
        if (!game || !game.url) return;

        this.currentGameUrl = game.url;
        this.currentGameTitle = game.title || "game";
        this.currentGameHtml = "";
        this.menuView.style.display = 'none';
        this.gameView.style.display = 'block';

        try {
            const response = await fetch(game.url);
            let htmlText = await response.text();

            const defaultHtmlUrl = game.source === 'GNMath' ? GNMATH_HTML : game.source === 'Daknux' ? DAKNUX_HTML : UGS_HTML_URL1;
            const defaultCoverUrl = game.source === 'GNMath' ? GNMATH_COVER : game.source === 'Daknux' ? DAKNUX_COVER : UGS_HTML_URL1.replace('/ugs-1@main', '/ugs-covers@main');

            htmlText = htmlText
                .replace(/{HTML_URL1}/gi, UGS_HTML_URL1)
                .replace(/%7BHTML_URL1%7D/gi, UGS_HTML_URL1)
                .replace(/{HTML_URL2}/gi, UGS_HTML_URL2)
                .replace(/%7BHTML_URL2%7D/gi, UGS_HTML_URL2)
                .replace(/{HTML_URL3}/gi, UGS_HTML_URL3)
                .replace(/%7BHTML_URL3%7D/gi, UGS_HTML_URL3)
                .replace(/{HTML_URL}/gi, defaultHtmlUrl)
                .replace(/%7BHTML_URL%7D/gi, defaultHtmlUrl)
                .replace(/{COVER_URL}/gi, defaultCoverUrl)
                .replace(/%7BCOVER_URL%7D/gi, defaultCoverUrl);

            htmlText = htmlText.replace(/(src|href|action|data)=(['"])\/([^/])/gi, '$1=$2$3');

            const baseUrl = game.url.substring(0, game.url.lastIndexOf('/') + 1);

            if (!/<base\b[^>]*>/i.test(htmlText)) {
                const baseTag = `<base href="${baseUrl}">`;
                if (htmlText.match(/<head[^>]*>/i)) {
                    htmlText = htmlText.replace(/(<head[^>]*>)/i, `$1\n    ${baseTag}`);
                } else {
                    htmlText = `${baseTag}\n${htmlText}`;
                }
            }

            const urlPatchScript = `<script>
                (function() {
                    var OriginalURL = window.URL;
                    window.URL = function(url, base) {
                        try {
                            return new OriginalURL(url, base);
                        } catch (e) {
                            return new OriginalURL(url, '${baseUrl}');
                        }
                    };
                    window.URL.createObjectURL = OriginalURL.createObjectURL;
                    window.URL.revokeObjectURL = OriginalURL.revokeObjectURL;
                })();
            </script>`;

            if (htmlText.match(/<head[^>]*>/i)) {
                htmlText = htmlText.replace(/(<head[^>]*>)/i, `$1\n    ${urlPatchScript}`);
            } else {
                htmlText = `${urlPatchScript}\n${htmlText}`;
            }

            this.currentGameHtml = htmlText;
            this.iframe.srcdoc = htmlText;

        } catch (e) {
            this.iframe.removeAttribute('srcdoc');
            this.iframe.src = game.url;
        }
    }

    downloadGame() {
        if (!this.currentGameHtml) {
            alert("This game cannot be downloaded directly (cross-origin restrictions or no source provided).");
            return;
        }

        const blob = new Blob([this.currentGameHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        const cleanTitle = this.currentGameTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `${cleanTitle}.html`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    closeGame() {
        this.gameView.style.display = 'none';
        this.menuView.style.display = 'flex';
        this.iframe.removeAttribute('srcdoc');
        this.iframe.src = '';
        this.currentGameUrl = "";
        this.currentGameHtml = "";
        this.currentGameTitle = "game";
    }

    playRandom() {
        if (this.filteredGames.length === 0) return;
        const randomGame = this.filteredGames[Math.floor(Math.random() * this.filteredGames.length)];
        this.playGame(randomGame);
    }
}

window.Lumi = new LumiSDK();
