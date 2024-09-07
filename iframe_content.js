(function() {
  if (window.iframeContentScriptLoaded) return;
  window.iframeContentScriptLoaded = true;

  console.log('iframe_content script loaded');

  let isSelecting = false;

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

  function setupFormElementListeners() {
    console.log('Setting up form element listeners in iframe');
    const formElements = document.querySelectorAll('input, select, textarea, [role="combobox"], [role="listbox"], .select2-selection');
    console.log(`Found ${formElements.length} form elements in iframe`);
    formElements.forEach(element => {
      console.log('Form element in iframe:', getElementInfo(element));
      element.addEventListener('focus', () => {
        if (isSelecting) {
          console.log('Focus event captured in iframe:', element.tagName);
          highlightElement(element);
          window.parent.postMessage({
            action: 'elementSelected',
            element: getElementInfo(element)
          }, '*');
        }
      });

      element.addEventListener('blur', () => {
        console.log('Blur event captured in iframe:', element.tagName);
        removeHighlight(element);
      });
    });
  }

  window.addEventListener('message', event => {
    console.log('Message received in iframe:', event.data);
    if (event.data.action === 'injectScript') {
      const script = document.createElement('script');
      script.src = event.data.script;
      document.head.appendChild(script);
    } else if (event.data.action === 'startSelecting') {
      isSelecting = true;
      setupFormElementListeners();
    } else if (event.data.action === 'stopSelecting') {
      isSelecting = false;
    }
  });

  // Set up a MutationObserver to watch for changes in the DOM
  const observer = new MutationObserver(() => {
    console.log('DOM mutation observed in iframe, re-setting up form element listeners');
    setupFormElementListeners();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  window.parent.postMessage({ action: 'iframeReady' }, '*');

  console.log('iframe_content script setup complete');
})();