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
    const hostname = url.hostname.replace(/\.$/, '');   // ルートドメイン（末尾のドット）を省略
    const cache = await chrome.storage.local.get(defaultStorage);
    const verify = cache.whitelist.includes(hostname);
    const id = verify ? 'item_removeWhitelist' : 'item_addWhitelist';
    
    let startSlicking = false;
    const element = document.getElementById(id);
    element.addEventListener('click', async () => {
      if (startSlicking) { return; }
      startSlicking = true;
      element.classList.add('checked');
      
      const cache = await chrome.storage.local.get(defaultStorage);
      cache.whitelist = cache.whitelist.filter(v => v != hostname);
      if (!verify) {
        cache.whitelist.push(hostname);
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
