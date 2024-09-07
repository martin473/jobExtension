let savedElements = [];

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'startSelecting' });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveElement') {
    const existingIndex = savedElements.findIndex(el => 
      el.id === request.element.id && 
      el.name === request.element.name &&
      el.tagName === request.element.tagName
    );
    if (existingIndex !== -1) {
      savedElements[existingIndex] = request.element;
    } else {
      savedElements.push(request.element);
    }
    console.log('Element saved:', request.element);
  } else if (request.action === 'saveElementValue') {
    const existingIndex = savedElements.findIndex(el => 
      el.id === request.element.id && 
      el.name === request.element.name &&
      el.tagName === request.element.tagName
    );
    if (existingIndex !== -1) {
      savedElements[existingIndex].value = request.element.value;
    }
    console.log('Element value saved:', request.element);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.tabs.sendMessage(tabId, { action: 'highlightSavedElements', elements: savedElements });
  }
});

console.log('Background script loaded');