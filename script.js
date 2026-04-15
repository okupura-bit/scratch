async function initLIFF() {
    try {
        await liff.init({ liffId: "あなたのLIFF ID" }); // 管理画面で発行されたID
        if (!liff.isLoggedIn()) {
            liff.login(); // ログインしていなければログイン画面へ
        } else {
            const profile = await liff.getProfile();
            console.log("こんにちは、" + profile.displayName + "さん！");
            // ここで「〇〇さん、くじを引いてね！」と画面に出すことも可能
        }
    } catch (err) {
        console.error("LIFF初期化失敗", err);
    }
}

initLIFF(); // 起動時に実行

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

// celebrate関数（紙吹雪）の中に、プロフィール表示を追加します
function celebrate() {
    // --- 既存の紙吹雪の演出 ---
    const duration = 3 * 1000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({ particleCount: 7, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ffd700', '#ffffff', '#ff0000'] });
        confetti({ particleCount: 7, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ffd700', '#ffffff', '#ff0000'] });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());

    // --- 【追加】LINEのプロフィールを表示する演出 ---
    liff.getProfile().then(profile => {
        const resultDiv = document.querySelector('.result');
        // HTMLの中身を書き換えて、名前と画像を表示
        resultDiv.innerHTML = `
            <p style="margin-bottom:10px;">おめでとう！</p>
            <img src="${profile.pictureUrl}" style="width:60px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 10px rgba(0,0,0,0.3);">
            <h1 style="font-size:1.5rem; margin-top:10px;">${profile.displayName} さん</h1>
            <p style="font-size:1.2rem; color:#ff0000;">一等 77777pt！</p>
        `;
    }).catch(err => console.error(err));
}

// イベントリスナー登録
canvas.addEventListener('mousemove', (e) => { if(e.buttons === 1) scratch(e); });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); scratch(e); }, {passive: false});

// 実行
init();