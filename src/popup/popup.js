/**
 * ポップアップページ処理
 */

document.addEventListener('DOMContentLoaded', async () => {
  const currentTab = {currentWindow:true, active:true};
  const tabs = await chrome.tabs.query(currentTab);
  let url = null;
  try {
      url = new URL(tabs[0].url);
  } catch (e) {}
  
  if (url && url.protocol == 'https:') {
    const cache = await chrome.storage.local.get(defaultStorage);
    const verify = cache.whitelist.includes(url.hostname);
    const id = verify ? 'item_removeWhitelist' : 'item_addWhitelist';
    
    document.getElementById(id).addEventListener('click', async () => {
      const cache = await chrome.storage.local.get(defaultStorage);
      if (verify) {
        cache.whitelist = cache.whitelist.filter(v => v != url.hostname);
      } else {
        cache.whitelist.push(url.hostname);
      }
      await chrome.storage.local.set({whitelist: cache.whitelist});
      window.close();
    });
    document.getElementById(id).hidden = false;
  } else {
    document.getElementById('item_unexpected').hidden = false;
  }
  document.getElementById('popup').hidden = false;
});
