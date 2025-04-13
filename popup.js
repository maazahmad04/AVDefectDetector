document.addEventListener('DOMContentLoaded', () => {
  const selectAll = document.getElementById('selectAll');
  const checkboxes = document.querySelectorAll('input[name="defect"]');
  const apiKeyInput = document.getElementById('apiKeyInput');
  // Toggle all checkboxes when "Select All" is clicked
  selectAll.addEventListener('change', () => {
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
  });

  // If a single checkbox is unchecked, uncheck Select All
  checkboxes.forEach(cb => {
    cb.addEventListener('change', () => {
      if (!cb.checked) {
        selectAll.checked = false;
      } else if (Array.from(checkboxes).every(cb => cb.checked)) {
        selectAll.checked = true;
      }
    });
  });

  // Handle Analyze button click
  document.getElementById('run').addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form from reloading the popup
    document.body.style.cursor = 'wait';
    const selected = Array.from(document.querySelectorAll('input[name="defect"]:checked')).map(cb => cb.value);
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey) {
      alert("Please enter your API key.");
      document.body.style.cursor = 'default';
      return;
    }
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (defects,apiKey) => window.detectImageDefects(defects,apiKey),
      args: [selected,apiKey]
    });
    
  });
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'resetCursor') {
        // Reset cursor back to 'default' in the popup
        document.body.style.cursor = 'default'; // Apply default cursor on the popup
    }
});

});
