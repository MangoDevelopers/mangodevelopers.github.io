document.addEventListener('DOMContentLoaded', () => {
    const shellOutput = document.getElementById('shell-output');
    const cursor = document.querySelector('.cursor');
    const stdin = document.getElementById('shell-stdin');
    const shellBody = document.querySelector('.shell-body');
    const body = document.body;

    /* ============================================================
       Interactive terminal
       Intro sequence types itself, then hands over a live prompt.
       ============================================================ */

    const PROMPT = 'mango@mangodevelopers:~$ ';
    const EMAIL = 'admin@mangodevelopers.com';

    const introLines = [
        { text: '\n> whoami', type: 'command', delayAfter: 400 },
        { text: '\nmango_developers\n', type: 'output', delayAfter: 200 },
        { text: '> cat README.md', type: 'command', delayAfter: 400 },
        { text: '\n# Welcome to Mango Developers!\n', type: 'output', delayAfter: 50 },
        { text: 'We are a passionate group of software developers creating awesome stuff.\n', type: 'output', delayAfter: 50 },
        { text: 'We love coding, collaboration, and of course, the mango feeling!\n\n', type: 'output', delayAfter: 300 },
        { text: 'This terminal is real — type ', type: 'output', delayAfter: 0 },
        { text: 'help', type: 'hint', delayAfter: 0 },
        { text: ' and press Enter.\n', type: 'output', delayAfter: 300 },
    ];

    // ---------- printing helpers ----------
    function print(text, cls) {
        const span = document.createElement('span');
        if (cls) span.className = cls;
        span.textContent = text;
        shellOutput.insertBefore(span, cursor);
        scrollToBottom();
    }

    function printLink(text, url, external) {
        const a = document.createElement('a');
        a.href = url;
        a.textContent = text;
        a.className = 'shell-link';
        if (external) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
        shellOutput.insertBefore(a, cursor);
        scrollToBottom();
    }

    function scrollToBottom() {
        shellBody.scrollTop = shellBody.scrollHeight;
    }

    // ---------- intro typewriter ----------
    let lineIndex = 0;
    let charIndex = 0;
    const typingSpeed = 45;
    let interactive = false;

    function typeCharacter() {
        if (lineIndex >= introLines.length) {
            startInteractive();
            return;
        }
        const currentLine = introLines[lineIndex];
        print(currentLine.text[charIndex], currentLine.type);
        charIndex++;
        if (charIndex >= currentLine.text.length) {
            lineIndex++;
            charIndex = 0;
            setTimeout(typeCharacter, currentLine.delayAfter || 150);
        } else {
            setTimeout(typeCharacter, typingSpeed);
        }
    }

    setTimeout(() => {
        cursor.style.animation = 'none';
        typeCharacter();
    }, 800);

    // Let visitors skip the intro
    function skipIntro() {
        if (interactive || lineIndex >= introLines.length) return;
        // flush the remaining intro instantly
        let rest = introLines[lineIndex].text.slice(charIndex);
        print(rest, introLines[lineIndex].type);
        for (let i = lineIndex + 1; i < introLines.length; i++) {
            print(introLines[i].text, introLines[i].type);
        }
        lineIndex = introLines.length;
    }

    // ---------- live prompt ----------
    let inputSpan = null;
    let buffer = '';
    const history = [];
    let histIdx = -1;
    let pendingMailto = null;

    function newPrompt() {
        print(PROMPT, 'prompt');
        inputSpan = document.createElement('span');
        inputSpan.className = 'command';
        shellOutput.insertBefore(inputSpan, cursor);
        buffer = '';
        cursor.style.animation = 'blink 1s step-end infinite';
        scrollToBottom();
    }

    function startInteractive() {
        interactive = true;
        newPrompt();
        // focus so people can type right away (desktop only — avoid
        // popping the keyboard on phones until they tap the shell)
        if (window.matchMedia('(hover: hover)').matches) stdin.focus();
    }

    function renderBuffer() {
        inputSpan.textContent = buffer;
        scrollToBottom();
    }

    const COMMANDS = {
        help: () => {
            print('Available commands:\n', 'output');
            [
                ['help', 'show this help'],
                ['about', 'who we are'],
                ['apps', 'list the apps we build'],
                ['open <app>', 'jump to an app page, e.g. open vast-browser'],
                ['contact', 'get in touch — opens your mail app'],
                ['social', 'where to follow us'],
                ['theme', 'toggle light/dark mode'],
                ['ls / cat', 'poke around the filesystem'],
                ['history', 'your command history'],
                ['clear', 'wipe the screen'],
            ].forEach(([c, d]) => {
                print('  ' + c.padEnd(14), 'hint');
                print(d + '\n', 'output');
            });
            print('...and a few things help does not mention.\n', 'output');
        },
        about: () => {
            print('Mango Developers — a passionate group of software developers\n' +
                'creating awesome stuff. We build free, open software and publish\n' +
                'every release on GitHub.\n', 'output');
        },
        apps: () => {
            print('our apps:\n', 'output');
            print('  VastBrowser  ', 'hint');
            print('web browser for Android TV & Fire TV — ', 'output');
            printLink('/apps/vast-browser/', '/apps/vast-browser/');
            print('\nmore on the way. Run ', 'output');
            print('open vast-browser', 'hint');
            print(' or see ', 'output');
            printLink('/apps/', '/apps/');
            print('\n', 'output');
        },
        open: (args) => {
            const target = (args[0] || '').toLowerCase();
            if (target === 'vast-browser' || target === 'vastbrowser') {
                print('opening /apps/vast-browser/ ...\n', 'output');
                setTimeout(() => { window.location.href = '/apps/vast-browser/'; }, 400);
            } else if (target === 'apps') {
                print('opening /apps/ ...\n', 'output');
                setTimeout(() => { window.location.href = '/apps/'; }, 400);
            } else {
                print('open: unknown app "' + target + '" — try open vast-browser\n', 'error');
            }
        },
        contact: () => {
            print('reach us at ', 'output');
            printLink(EMAIL, 'mailto:' + EMAIL + '?subject=Hello%20Mango%20Developers');
            print('\nopening your mail app', 'output');
            let dots = 0;
            const iv = setInterval(() => {
                print('.', 'output');
                if (++dots >= 3) {
                    clearInterval(iv);
                    print('\n', 'output');
                    window.location.href = 'mailto:' + EMAIL + '?subject=Hello%20Mango%20Developers';
                    newPrompt();
                }
            }, 300);
            return 'async';
        },
        email: (a) => COMMANDS.contact(a),
        social: () => {
            print('follow us:\n  GitHub     ', 'output');
            printLink('github.com/mangodevelopers', 'https://github.com/mangodevelopers', true);
            print('\n  Instagram  ', 'output');
            printLink('instagram.com/mangodevs', 'https://instagram.com/mangodevs', true);
            print('\n  Twitter/X  ', 'output');
            printLink('twitter.com/mangodevs', 'https://twitter.com/mangodevs', true);
            print('\n', 'output');
        },
        follow: (a) => COMMANDS.social(a),
        whoami: () => print('mango_developers\n', 'output'),
        pwd: () => print('/home/mango_developers\n', 'output'),
        ls: () => {
            print('apps/  README.md  contact.txt  mango.txt\n', 'output');
        },
        cat: (args) => {
            const f = args[0] || '';
            if (f === 'README.md') COMMANDS.about();
            else if (f === 'contact.txt') {
                print('email: ', 'output');
                printLink(EMAIL, 'mailto:' + EMAIL);
                print('\n(or just run: contact)\n', 'output');
            }
            else if (f === 'mango.txt') COMMANDS.mango();
            else if (f === '') print('cat: missing file — try cat README.md\n', 'error');
            else print('cat: ' + f + ': No such file or directory\n', 'error');
        },
        echo: (args, raw) => print(raw.replace(/^echo\s?/, '') + '\n', 'output'),
        date: () => print(new Date().toString() + '\n', 'output'),
        theme: () => {
            document.getElementById('theme-toggle').click();
            print('theme toggled — easy on the eyes.\n', 'output');
        },
        history: () => {
            history.forEach((h, i) => print('  ' + (i + 1) + '  ' + h + '\n', 'output'));
        },
        clear: () => {
            while (shellOutput.firstChild && shellOutput.firstChild !== cursor) {
                shellOutput.removeChild(shellOutput.firstChild);
            }
        },
        mango: () => {
            print('        _\n' +
                '      _(_)_        the mango feeling:\n' +
                "    .-'   '-.      a sweet feeling that cannot be\n" +
                '   /         \\     expressed in words, but can\n' +
                '  |  o     o  |    still be shared with everyone.\n' +
                '   \\   \\_/   /\n' +
                "    '-.___.-'\n", 'hint');
        },
        sudo: () => print('mango_developers is not in the sudoers file.\nThis incident will be reported. 🥭\n', 'error'),
        exit: () => print("there's no escape from the mango feeling. Try 'contact' instead.\n", 'output'),
        matrix: () => {
            print('wake up, Neo... (10 seconds)\n', 'hint');
            if (window.__asciiMatrix) window.__asciiMatrix(10000);
        },
        rm: (args, raw) => {
            if (/-rf?\s+\/(\s|$)/.test(raw)) {
                print('nice try. deleting the mango feeling', 'error');
                let n = 0;
                const iv = setInterval(() => {
                    print('.', 'error');
                    if (++n >= 3) {
                        clearInterval(iv);
                        print(' permission denied ❤️\n', 'error');
                        newPrompt();
                    }
                }, 350);
                return 'async';
            }
            print('rm: refusing to remove anything — this is a happy place\n', 'error');
        },
    };

    function runCommand(raw) {
        const trimmed = raw.trim();
        print('\n', 'output');
        if (trimmed) {
            history.push(trimmed);
            histIdx = history.length;
            const parts = trimmed.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const fn = COMMANDS[cmd];
            if (fn) {
                const result = fn(parts.slice(1), trimmed);
                if (result === 'async') return; // command calls newPrompt() itself
            } else {
                print('bash: ' + cmd + ": command not found — try 'help'\n", 'error');
            }
        }
        newPrompt();
    }

    function completeBuffer() {
        const parts = buffer.split(/\s+/);
        if (parts.length > 1) return;
        const matches = Object.keys(COMMANDS).filter(c => c.indexOf(parts[0].toLowerCase()) === 0 && parts[0]);
        if (matches.length === 1) {
            buffer = matches[0] + ' ';
            renderBuffer();
        } else if (matches.length > 1) {
            print('\n' + matches.join('  ') + '\n', 'output');
            newPrompt();
            inputSpan.textContent = buffer;
        }
    }

    function onKey(e) {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (!interactive) {
            if (e.key === 'Enter') skipIntro();
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = buffer;
            inputSpan = null;
            runCommand(cmd);
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            buffer = buffer.slice(0, -1);
            renderBuffer();
        } else if (e.key === 'ArrowUp') {
            if (histIdx > 0) { histIdx--; buffer = history[histIdx]; renderBuffer(); }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (histIdx < history.length - 1) { histIdx++; buffer = history[histIdx]; }
            else { histIdx = history.length; buffer = ''; }
            renderBuffer();
            e.preventDefault();
        } else if (e.key === 'Tab') {
            completeBuffer();
            e.preventDefault();
        } else if (e.key.length === 1) {
            e.preventDefault();
            buffer += e.key;
            renderBuffer();
        }
    }

    stdin.addEventListener('keydown', onKey);
    // Mobile browsers deliver text through input events instead of key events
    stdin.addEventListener('input', () => {
        if (!interactive || !inputSpan) { stdin.value = ''; return; }
        if (stdin.value) {
            buffer += stdin.value;
            stdin.value = '';
            renderBuffer();
        }
    });

    shellBody.addEventListener('click', () => stdin.focus());
    // typing anywhere on the page routes into the terminal
    document.addEventListener('keydown', (e) => {
        if (e.target === stdin) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.key.length === 1 || ['Enter', 'Backspace', 'Tab', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            stdin.focus();
            onKey(e);
        }
    });

    /* ============================================================
       Theme toggle (web.dev pattern, unchanged behaviour)
       ============================================================ */
    const storageKey = 'theme-preference';

    const onClick = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        setPreference();
    };

    const getColorPreference = () => {
        const storedPref = localStorage.getItem(storageKey);
        if (storedPref) return storedPref;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    const setPreference = () => {
        localStorage.setItem(storageKey, theme.value);
        reflectPreference();
    };

    const reflectPreference = () => {
        body.classList.toggle('light-theme', theme.value === 'light');
        document.querySelector('#theme-toggle')?.setAttribute('aria-label', theme.value);
        if (typeof init === 'function') init(); // recolor the ascii field
    };

    const theme = { value: getColorPreference() };
    reflectPreference();

    const themeToggleButton = document.querySelector('#theme-toggle');
    if (themeToggleButton) themeToggleButton.addEventListener('click', onClick);

    window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', ({ matches: isDark }) => {
            theme.value = isDark ? 'dark' : 'light';
            setPreference();
        });
});

/* ============================================================
   Interactive ASCII-art background
   A character field driven by layered sine waves; the cursor
   carries a glow, clicks ring outward as ripples, and `matrix`
   flips it into green rain for a while.
   ============================================================ */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');

const RAMP = ' ·.:-=+*#%@';
const CELL = 14;
let cols = 0, rows = 0;
let fieldColor = '#40E0D0';
let t = 0;
const mouse = { x: -1e4, y: -1e4 };
const trail = [];   // fading glow points the cursor leaves behind
const ripples = []; // expanding rings from clicks
let matrixUntil = 0;
let drops = [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeField() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    cols = Math.ceil(canvas.width / CELL);
    rows = Math.ceil(canvas.height / CELL);
    drops = Array.from({ length: cols }, () => Math.random() * rows);
}

// Called on load and whenever the theme flips (name kept for the
// theme-toggle hook above).
function init() {
    const cs = getComputedStyle(document.body);
    fieldColor = cs.getPropertyValue('--shell-body-color').trim() || '#40E0D0';
}

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    if (!reduceMotion) {
        trail.push({ x: e.clientX, y: e.clientY, life: 1 });
        if (trail.length > 24) trail.shift();
    }
});

window.addEventListener('mouseout', () => {
    mouse.x = -1e4;
    mouse.y = -1e4;
});

window.addEventListener('click', (e) => {
    // Ignore clicks on real UI so buttons don't ring the background
    if (e.target.closest('a, button, .shell-container')) return;
    ripples.push({ x: e.clientX, y: e.clientY, r: 0, life: 1 });
});

// `matrix` command hook
window.__asciiMatrix = function (ms) {
    matrixUntil = performance.now() + ms;
};

function fieldValue(px, py) {
    const gx = px / CELL, gy = py / CELL;
    // ambient layered waves — kept subtle so the cursor glow pops
    let v = 0.10 * Math.sin(gx * 0.22 + t * 0.6) * Math.sin(gy * 0.19 - t * 0.4)
        + 0.08 * Math.sin((gx + gy) * 0.09 + t * 0.25)
        + 0.10;

    // cursor glow
    const dm = Math.hypot(px - mouse.x, py - mouse.y);
    if (dm < 260) {
        const g = 1 - dm / 260;
        v += g * g * 1.1;
    }

    // trailing glow
    for (let i = 0; i < trail.length; i++) {
        const p = trail[i];
        const d = Math.hypot(px - p.x, py - p.y);
        if (d < 120) {
            const g = (1 - d / 120) * p.life;
            v += g * g * 0.5;
        }
    }

    // click ripples: bright expanding ring
    for (let i = 0; i < ripples.length; i++) {
        const rp = ripples[i];
        const d = Math.hypot(px - rp.x, py - rp.y);
        const band = Math.abs(d - rp.r);
        if (band < 40) {
            v += Math.exp(-(band * band) / 320) * rp.life * 0.9;
        }
    }
    return v;
}

function drawField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = CELL + 'px Consolas, Monaco, monospace';
    ctx.textBaseline = 'top';
    ctx.fillStyle = fieldColor;

    const now = performance.now();
    if (now < matrixUntil) {
        drawMatrix();
        return;
    }

    for (let cy = 0; cy < rows; cy++) {
        const py = cy * CELL;
        for (let cx = 0; cx < cols; cx++) {
            const px = cx * CELL;
            const v = fieldValue(px + CELL / 2, py + CELL / 2);
            if (v < 0.06) continue;
            const clamped = Math.min(1, v);
            const idx = Math.min(RAMP.length - 1, Math.max(1, Math.round(clamped * (RAMP.length - 1))));
            ctx.globalAlpha = Math.min(0.55, 0.06 + clamped * 0.5);
            ctx.fillText(RAMP[idx], px, py);
        }
    }
    ctx.globalAlpha = 1;
}

function drawMatrix() {
    ctx.fillStyle = '#00ff70';
    for (let i = 0; i < cols; i++) {
        const ch = String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96));
        ctx.globalAlpha = 0.8;
        ctx.fillText(ch, i * CELL, Math.floor(drops[i]) * CELL);
        ctx.globalAlpha = 0.3;
        ctx.fillText(ch, i * CELL, (Math.floor(drops[i]) - 1) * CELL);
        drops[i] += 0.4 + Math.random() * 0.4;
        if (drops[i] * CELL > canvas.height && Math.random() > 0.975) drops[i] = 0;
    }
    ctx.globalAlpha = 1;
}

function stepField() {
    t += 0.016;
    for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.04;
        if (trail[i].life <= 0) trail.splice(i, 1);
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].r += 6;
        ripples[i].life -= 0.012;
        if (ripples[i].life <= 0) ripples.splice(i, 1);
    }
}

function animate() {
    requestAnimationFrame(animate);
    stepField();
    drawField();
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        resizeField();
        init();
    }, 100);
});

resizeField();
init();
if (reduceMotion) {
    // one calm, static frame — no animation
    drawField();
} else {
    animate();
}
