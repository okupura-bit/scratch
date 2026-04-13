const canvas = document.getElementById('scratch');
const ctx = canvas.getContext('2d');
let isFinished = false;

// 初期化: 銀色の膜を塗る
function init() {
    const grad = ctx.createLinearGradient(0, 0, 320, 320);
    grad.addColorStop(0, '#adb5bd');
    grad.addColorStop(0.5, '#dee2e6');
    grad.addColorStop(1, '#adb5bd');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 削るメイン処理
function scratch(e) {
    if (isFinished) return;
    const rect = canvas.getBoundingClientRect();
    
    // マウスとタッチ両方の座標取得に対応
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

// 削った面積を計算
function checkScratchPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
    }

    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    
    // 40%以上削られたら全消去して演出開始
    if (percentage > 40 && !isFinished) {
        isFinished = true;
        canvas.style.transition = 'opacity 1s';
        canvas.style.opacity = '0'; 
        celebrate();
    }
}

// 紙吹雪エフェクト
function celebrate() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 7,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ffd700', '#ffffff', '#ff0000']
        });
        confetti({
            particleCount: 7,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ffd700', '#ffffff', '#ff0000']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// イベントリスナー登録
canvas.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e); }, {passive: false});

// 実行
init();