import { CALENDAR_UPDATE_MSG } from "./constants";


function updateBadge(tab: chrome.tabs.Tab, causedByTabChange: boolean) {
  if (tab.url) {
    chrome.tabs.sendMessage(tab.id, { message: CALENDAR_UPDATE_MSG }, (res) => {
      if (chrome.runtime.lastError) {
        console.log("Couldn't reach listener. Probably, script hasn't been injected yet.")
        return;
      } 
      if (res && res.text > 0) {
        chrome.browserAction.setBadgeText(res);
      } else {
        chrome.browserAction.setBadgeText({ text: "" });
      }
    });
  } else if (causedByTabChange) {
    chrome.browserAction.setBadgeText({ text: "" });
  }
}

chrome.tabs.onUpdated.addListener((tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    if (tab.active) {
      try {
        updateBadge(tab, false);
      } catch (err) {
        console.log(
          "Took too long to get response. Probably script hasn't been injected yet."
        );
      }
    }
  });
});

chrome.tabs.onActiveChanged.addListener((tabId) => {
  chrome.tabs.get(tabId, (tab) => {
    updateBadge(tab, true);
  });
});
