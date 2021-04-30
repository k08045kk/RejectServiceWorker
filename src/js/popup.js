/**
 * ポップアップページ処理
 */

(function() {
  // ポップアップクローズ
  function onComplate() {
    window.close();
  };
  
  // ページ読み込み完了イベント
  function onInitialize() {
    const currentTab = {currentWindow:true, active:true};
    chrome.tabs.query(currentTab, function(tabs) {
      let url;
      try {
        url = new URL(tabs[0].url);
      } catch (e) {}
      if (url && url.protocol == 'https:') {
        chrome.runtime.sendMessage({
          method: 'popup',
          hostname: url.hostname,
        }, function (response) {
          if (response.data) {
            document.getElementById('item_AddWhitelist').addEventListener('click', function() {
              chrome.runtime.sendMessage({
                method: 'addWhitelist',
                hostname: url.hostname
              });
              onComplate();
            });
            document.getElementById('item_AddWhitelist').hidden = false;
          } else {
            document.getElementById('item_RemoveWhitelist').addEventListener('click', function() {
              chrome.runtime.sendMessage({
                method: 'removeWhitelist',
                hostname: url.hostname
              });
              onComplate();
            });
            document.getElementById('item_RemoveWhitelist').hidden = false;
          }
        });
      }
      document.getElementById('popup').hidden = false;
    });
  };
  
  document.addEventListener('DOMContentLoaded', onInitialize);
})();
