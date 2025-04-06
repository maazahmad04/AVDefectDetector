document.getElementById('run').addEventListener('click', async () => {
  console.log("submitted")
  const selected = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (defects) => window.detectImageDefects(defects),
    args: [selected]
  });
});
