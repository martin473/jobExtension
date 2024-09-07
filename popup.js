console.log('Popup script started');

let isSelecting = false;
let selectedElementInfo = null;

function updateStatus(message) {
    console.log('Status update:', message);
    document.getElementById('status').textContent = message;
}

function toggleSelectionMode() {
    isSelecting = !isSelecting;
    const selectButton = document.getElementById('selectButton');
    const highlightButton = document.getElementById('highlightButton');

    if (isSelecting) {
        selectButton.textContent = 'Cancel Selection';
        highlightButton.disabled = true;
        updateStatus('Click on an input, select, or textarea element');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "startSelecting"});
        });
    } else {
        selectButton.textContent = 'Start Selecting';
        updateStatus('Selection mode cancelled');
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "stopSelecting"});
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Popup DOM loaded');
    const selectButton = document.getElementById('selectButton');
    const highlightButton = document.getElementById('highlightButton');

    chrome.storage.local.get(['selectedElementInfo'], function(result) {
        if (chrome.runtime.lastError) {
            console.error('Error accessing storage:', chrome.runtime.lastError);
        } else if (result.selectedElementInfo) {
            selectedElementInfo = result.selectedElementInfo;
            highlightButton.disabled = false;
            updateStatus('Element selected: ' + selectedElementInfo.tagName);
        }
    });

    selectButton.addEventListener('click', toggleSelectionMode);

    highlightButton.addEventListener('click', function() {
        if (selectedElementInfo) {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "highlightSimilar", info: selectedElementInfo});
            });
            updateStatus('Highlighting similar elements');
        }
    });
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('Message received in popup:', request);
    if (request.action === "elementSelected") {
        selectedElementInfo = request.info;
        document.getElementById('highlightButton').disabled = false;
        updateStatus('Element selected: ' + selectedElementInfo.tagName);
        document.getElementById('selectButton').textContent = 'Start Selecting';
        isSelecting = false;
    }
});

console.log('Popup script loaded');