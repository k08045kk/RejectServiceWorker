/**
 * バックグラウンド処理
 */

(function() {
  var cacheStorage = defaultStorage;
  var whiteSet = new Set(cacheStorage.whitelist);
  
  // オプション画面の更新通知
  function sendUpdateOptions() {
    getStorage().set({whitelist: cacheStorage.whitelist}, () => {});
    chrome.runtime.sendMessage({
      method: 'updateOptions',  // options.js
      data: cacheStorage
    });
  };
  
  // ストレージ読み出し
  getStorage().get(defaultStorage, function(storage) {
    cacheStorage = storage;
    whiteSet = new Set(cacheStorage.whitelist);
  });
  
  // メッセージイベント
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
    case 'register':            // content.js
      // アイコン変更
      // 登録通知
      break;
    case 'verify':              // content.js
      // 登録解除を判定
      sendResponse({
        data: whiteSet.has(request.hostname),
      });
      break;
    case 'popup':               // popup.js
      sendResponse({data:!whiteSet.has(request.hostname)});
      break;
    case 'setWhitelist':        // options.js
      cacheStorage.whitelist = request.data;
      whiteSet = new Set(cacheStorage.whitelist);
      sendUpdateOptions();
      break;
    case 'addWhitelist':       // popup.js
      if (!whiteSet.has(request.hostname)) {
        cacheStorage.whitelist.push(request.hostname);
        whiteSet.add(request.hostname);
        sendUpdateOptions();
      }
      break;
    case 'removeWhitelist':    // popup.js
      if (whiteSet.has(request.hostname)) {
        cacheStorage.whitelist = cacheStorage.whitelist.filter((v) => { return v!=request.hostname; });
        whiteSet.delete(request.hostname);
        sendUpdateOptions();
      }
      break;
    }
  });
  
  // ブラウザアクションの更新
  updateBrowserAction();
})();
