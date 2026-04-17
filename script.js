// --- 設定 ---
const LIFF_ID = "あなたのLIFF ID"; 
const canvas = document.getElementById('scratch');
const ctx = canvas.getContext('2d');
let isFinished = false;

// --- 1. 初期化 (高級感のある銀色の質感を出す) ---
function init() {
    // 銀色のザラザラ感を出すためにパターンを描画
    ctx.fillStyle = '#C0C0C0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // ノイズ（削りカス感）を薄く乗せる
    for (let i = 0; i < 500; i++) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 2, 2);
    }
    
    // 「ここを削ってね！」という文字を入れる
    ctx.font = "bold 20px 'Hiragino Kaku Gothic ProN'";
    ctx.fillStyle = "#888";
    ctx.textAlign = "center";
    ctx.fillText("ここをこすってね！", canvas.width / 2, canvas.height / 2);
}

// --- 2. 削る処理 (滑らかさを重視) ---
function scratch(e) {
    if (isFinished) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    
    // 筆圧を感じさせるような少しぼかした円で削る
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 25);
    gradient.addColorStop(0, 'rgba(0,0,0,1)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gradient;
    
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();

    checkScratchPercentage();
}

// 面積チェックロジックは前回同様
function checkScratchPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;
    for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] === 0) transparentPixels++;
    }
    const percentage = (transparentPixels / (canvas.width * canvas.height)) * 100;
    
    if (percentage > 45 && !isFinished) {
        isFinished = true;
        canvas.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
        canvas.style.opacity = '0'; 
        canvas.style.transform = 'scale(1.2)'; // 少し膨らんで消える演出
        celebrate();
    }
}

// --- 3. お祝い演出 (LINEプロフィールをリッチに表示) ---
async function celebrate() {
    // 紙吹雪
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

    try {
        const profile = await liff.getProfile();
        const resultDiv = document.querySelector('.result');
        
        // 結果画面をリッチに書き換え
        resultDiv.style.opacity = '1';
        resultDiv.innerHTML = `
            <div style="animation: bounce 1s infinite alternate;">
                <p style="color: #ff0000; font-weight: bold; font-size: 1.2rem;">CONGRATULATIONS!</p>
                <img src="${profile.pictureUrl}" style="width:100px; border-radius:50%; border:5px solid #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.5);">
                <h2 style="margin: 10px 0;">${profile.displayName} 様</h2>
                <div style="background: linear-gradient(45deg, #ffd700, #ff8c00); color: white; padding: 10px; border-radius: 10px; display: inline-block;">
                    <span style="font-size: 2rem; font-weight: bold;">一等当選</span>
                </div>
            </div>
        `;
    } catch (err) {
        console.error(err);
    }
}

// イベント・初期化処理は前回同様
liff.init({ liffId: LIFF_ID }).then(() => {
    if (!liff.isLoggedIn()) liff.login();
});

canvas.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e); }, {passive: false});
init();