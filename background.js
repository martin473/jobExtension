let savedElements = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'startSelecting' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveElement') {
    savedElements.push(request.element);
    console.log('Element saved:', request.element);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'highlightSavedElements', elements: savedElements });
  }
});

console.log('Background script loaded');