/**
 * ポップアップページ処理
 */

(function() {
  function onComplate() {
    window.close();
  };
  
  // ページ読み込み完了イベント
  function onInitialize() {
    /*
    chrome.runtime.sendMessage({
      method: 'getWhitelist'
    }, function(response) {
      document.getElementById('item_Whitelist').innerText = response.data.join('\n');
    });*/
    
    const currentTab = {currentWindow:true, active:true};
    chrome.tabs.query(currentTab, function(tabs) {
      const url = new URL(tabs[0].url);
      chrome.runtime.sendMessage({
        method: 'popup',
        hostname: url.hostname
      }, function (response) {
        if (response.data) {
          document.getElementById('item_AddWhitelist').addEventListener('click', function() {
            chrome.runtime.sendMessage({
              method: 'addWhitelist',
              hostname: url.hostname
            });
            onComplate();
          });
          document.getElementById('item_AddWhitelist').style.display = '';
          document.getElementById('popup').style.display = '';
        } else {
          document.getElementById('item_RemoveWhitelist').addEventListener('click', function() {
            chrome.runtime.sendMessage({
              method: 'removeWhitelist',
              hostname: url.hostname
            });
            onComplate();
          });
          document.getElementById('item_RemoveWhitelist').style.display = '';
          document.getElementById('popup').style.display = '';
        }
      });
    });
  };
  
  document.addEventListener("DOMContentLoaded", onInitialize);
})();
