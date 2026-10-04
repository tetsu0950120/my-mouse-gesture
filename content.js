let isRightMouseDown = false;
let startX = 0;
let startY = 0;
let gestureTrack = "";
let isGesturing = false;

// ジェスチャー判定の最小距離（ピクセル）
const MIN_DISTANCE = 30;

// Canvas軌跡描画用の変数
let canvas = null;
let ctx = null;
let lastX = 0;
let lastY = 0;

// 軌跡描画用Canvasの初期化・取得
function getCanvas() {
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none'; // クリックイベント等を透過
    canvas.style.zIndex = '2147483647';  // 最前面に表示
    ctx = canvas.getContext('2d');
  }
  
  // 画面サイズに合わせる
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  if (!canvas.parentNode) {
    (document.body || document.documentElement).appendChild(canvas);
  }
  return ctx;
}

// 軌跡をクリアして削除
function clearCanvas() {
  if (canvas && canvas.parentNode) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.parentNode.removeChild(canvas);
  }
}

document.addEventListener('mousedown', (e) => {
  if (e.button === 2) { // 右クリック
    isRightMouseDown = true;
    startX = e.clientX;
    startY = e.clientY;
    lastX = e.clientX;
    lastY = e.clientY;
    gestureTrack = "";
    isGesturing = false;
  }
}, true);

document.addEventListener('mousemove', (e) => {
  if (!isRightMouseDown) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  // 軌跡ラインの描画処理
  const context = getCanvas();
  context.beginPath();
  context.moveTo(lastX, lastY);
  context.lineTo(currentX, currentY);
  context.strokeStyle = 'rgba(255, 69, 0, 0.8)'; // 線の色（オレンジレッド）
  context.lineWidth = 4;                          // 線の太さ
  context.lineCap = 'round';
  context.stroke();

  lastX = currentX;
  lastY = currentY;

  // 方向判定処理
  const dx = currentX - startX;
  const dy = currentY - startY;
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);

  if (absX < MIN_DISTANCE && absY < MIN_DISTANCE) return;

  let direction = "";
  if (absX > absY) {
    direction = dx > 0 ? "R" : "L"; // 右 / 左
  } else {
    direction = dy > 0 ? "D" : "U"; // 下 / 上
  }

  // 直前と同じ方向でなければ軌跡コードに追加
  if (gestureTrack.slice(-1) !== direction) {
    gestureTrack += direction;
    isGesturing = true;
  }

  // 起点を現在位置に更新
  startX = currentX;
  startY = currentY;
}, true);

document.addEventListener('mouseup', (e) => {
  if (e.button === 2 && isRightMouseDown) {
    isRightMouseDown = false;
    clearCanvas(); // 軌跡を消去

    if (isGesturing) {
      // ジェスチャー実行時はコンテキストメニュー（右クリックメニュー）を抑制
      const preventMenu = (evt) => {
        evt.preventDefault();
        window.removeEventListener('contextmenu', preventMenu, true);
      };
      window.addEventListener('contextmenu', preventMenu, true);

      // ジェスチャーコマンドの実行
      executeGesture(gestureTrack);
    }
  }
}, true);

// コマンド分岐
function executeGesture(gesture) {
  switch (gesture) {
    case "L": // 左：戻る
      window.history.back();
      break;
    case "R": // 右：進む
      window.history.forward();
      break;
    case "U": // 上：ページ最上部へスクロール
      window.scrollTo({ top: 0, behavior: 'smooth' });
      break;
    case "D": // 下：ページ最下部へスクロール
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      break;
    case "DR": // 下→右：タブを閉じる
      chrome.runtime.sendMessage({ action: "closeTab" });
      break;
    case "DU": // 下→上：ページの更新（リロード）
      location.reload();
      break;
    case "UL": // 上→左：左隣のタブへ移動 【★変更】
      chrome.runtime.sendMessage({ action: "switchTabLeft" });
      break;
    case "UR": // 上→右：右隣のタブへ移動 【★変更】
      chrome.runtime.sendMessage({ action: "switchTabRight" });
      break;
    default:
      console.log("未登録のジェスチャー:", gesture);
  }
}
