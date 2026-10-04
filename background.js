chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "closeTab") {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  } else if (message.action === "openNewTab") {
    chrome.tabs.create({});
  } else if (message.action === "restoreTab") {
    chrome.sessions.restore();
  } else if (message.action === "switchTabLeft") {
    // 左隣のタブへ移動
    switchTab(sender.tab, -1);
  } else if (message.action === "switchTabRight") {
    // 右隣のタブへ移動
    switchTab(sender.tab, 1);
  }
});

// タブ移動の共通処理関数
function switchTab(currentTab, direction) {
  if (!currentTab) return;
  
  // 現在のウィンドウにある全タブを取得
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length <= 1) return; // タブが1つしかない場合は何もしない

    const currentIndex = currentTab.index;
    // ループ移動（端のタブにいる場合は反対側に移動）
    let targetIndex = (currentIndex + direction + tabs.length) % tabs.length;
    
    // 対象のタブをアクティブにする
    chrome.tabs.update(tabs[targetIndex].id, { active: true });
  });
}
