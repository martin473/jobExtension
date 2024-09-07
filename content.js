console.log('Content script loaded');

let isSelecting = false;

function injectScriptIntoIframes() {
  console.log('Attempting to inject script into iframes');
  const iframes = document.querySelectorAll('iframe');
  console.log(`Found ${iframes.length} iframes`);
  iframes.forEach((iframe, index) => {
    try {
      console.log(`Sending message to iframe ${index}:`, iframe);
      iframe.contentWindow.postMessage({ action: 'injectScript', script: chrome.runtime.getURL('iframe_content.js') }, '*');
    } catch (error) {
      console.error(`Error sending message to iframe ${index}:`, error);
    }
  });
}

function highlightSavedElements(elements) {
  console.log('Highlighting saved elements:', elements);
  elements.forEach(elementInfo => {
    const element = findElementByInfo(elementInfo);
    if (element) {
      highlightElement(element);
    }
  });
}

function findElementByInfo(elementInfo) {
  let selector = '';
  if (elementInfo.id) {
    selector += `#${elementInfo.id}`;
  } else if (elementInfo.name) {
    selector += `[name="${elementInfo.name}"]`;
  } else {
    selector += elementInfo.tagName.toLowerCase();
  }

  if (elementInfo.className) {
    selector += `.${elementInfo.className.split(' ').join('.')}`;
  }

  return document.querySelector(selector);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in content script:', request);
  if (request.action === 'startSelecting') {
    isSelecting = true;
    injectScriptIntoIframes();
    setupFormElementListeners(document);
  } else if (request.action === 'stopSelecting') {
    isSelecting = false;
  } else if (request.action === 'highlightSavedElements') {
    highlightSavedElements(request.elements);
  }
});

window.addEventListener('message', event => {
  console.log('Message received from iframe:', event.data);
  if (event.data.action === 'elementSelected' && isSelecting) {
    console.log('Element selected in iframe:', event.data.element);
    chrome.runtime.sendMessage({
      action: 'saveElement',
      element: event.data.element
    });
  } else if (event.data.action === 'iframeReady') {
    event.source.postMessage({ action: 'startSelecting' }, '*');
  }
});

function setupFormElementListeners(doc) {
  console.log('Setting up form element listeners');
  const formElements = doc.querySelectorAll('input, select, textarea');
  console.log(`Found ${formElements.length} form elements`);

  formElements.forEach(element => {
    console.log('Form element:', element);

    element.addEventListener('focus', () => {
      console.log('Focus event captured:', element.tagName);
      if (isSelecting) {
        highlightElement(element);
        chrome.runtime.sendMessage({
          action: 'saveElement',
          element: getElementInfo(element)
        });
      }
    });

    element.addEventListener('blur', () => {
      console.log('Blur event captured:', element.tagName);
      removeHighlight(element);
    });
  });
}

function highlightElement(element) {
  console.log('Highlighting element:', element);
  element.style.outline = '2px solid red';
  element.style.backgroundColor = 'yellow';
}

function removeHighlight(element) {
  console.log('Removing highlight from element:', element);
  element.style.outline = '';
  element.style.backgroundColor = '';
}

function getElementInfo(element) {
  return {
    tagName: element.tagName,
    type: element.type || '',
    name: element.name || '',
    id: element.id || '',
    className: element.className || '',
    value: element.value || '',
    placeholder: element.placeholder || '',
    ariaLabel: element.getAttribute('aria-label') || '',
    parentId: element.parentElement ? element.parentElement.id : '',
    parentClass: element.parentElement ? element.parentElement.className : '',
    role: element.getAttribute('role') || ''
  };
}

console.log('Content script setup complete');