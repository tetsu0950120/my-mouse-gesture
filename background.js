chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "closeTab") {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
    }
  } else if (message.action === "openNewTab") {
    chrome.tabs.create({});
  } else if (message.action === "restoreTab") {
    chrome.sessions.restore();
  }
});
