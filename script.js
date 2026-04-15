// --- LIFF初期化 ---
async function initLIFF() {
    try {
        await liff.init({ liffId: "2009809258-JBMtGduw" }); // ここを自分のIDに！
        if (!liff.isLoggedIn()) {
            liff.login();
        }
    } catch (err) {
        console.error("LIFF初期化失敗", err);
    }
}

initLIFF();

const canvas = document.getElementById('scratch');
const ctx = canvas.getContext('2d');
let isFinished = false;

function init() {
    const grad = ctx.createLinearGradient(0, 0, 320, 320);
    grad.addColorStop(0, '#adb5bd');
    grad.addColorStop(0.5, '#dee2e6');
    grad.addColorStop(1, '#adb5bd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function scratch(e) {
    if (isFinished) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    checkScratchPercentage();
}

function checkScratchPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
    }
    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    
    if (percentage > 40 && !isFinished) {
        isFinished = true;
        canvas.style.transition = 'opacity 1s';
        canvas.style.opacity = '0'; 
        celebrate(); // ここで下の関数を呼ぶ
    }
}

// お祝い演出（紙吹雪 ＋ プロフィール表示）
// 関数は1つにまとめます！
function celebrate() {
    // 1. 紙吹雪
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ffd700', '#ffffff', '#ff0000'] });
        confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ffd700', '#ffffff', '#ff0000'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    // 2. LINEプロフィール取得と画面書き換え
    liff.getProfile().then(profile => {
        const resultDiv = document.querySelector('.result');
        resultDiv.innerHTML = `
            <p style="margin-bottom:10px;">おめでとう！</p>
            <img src="${profile.pictureUrl}" style="width:80px; border-radius:50%; border:4px solid #fff; box-shadow:0 0 15px rgba(0,0,0,0.2);">
            <h1 style="font-size:1.8rem; margin:10px 0;">${profile.displayName} さん</h1>
            <p style="font-size:1.2rem; color:#ff0000; font-weight:bold;">一等 77777pt！</p>
        `;
    }).catch(err => {
        console.error("プロフィール取得失敗", err);
    });
}

canvas.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e); }, {passive: false});

init(); 