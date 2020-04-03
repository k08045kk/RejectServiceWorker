/**
 * バックグラウンド処理
 */

(function() {
  var cacheStorage = defaultStorage;
  var whiteSet = new Set(cacheStorage.whitelist);
  
  // オプション画面の更新通知
  function sendUpdateOptions() {
    getStorage().set({whitelist: cacheStorage.whitelist});
    chrome.runtime.sendMessage({
      method: 'updateOptions',
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
    case 'view':
    case 'popup':
      // ホワイトリストを判定
      sendResponse({data: !whiteSet.has(request.hostname)});
      break;
      break;
    case 'register':
      // アイコン変更
      // 登録通知
      /*
      if (cacheStorage.checkbox.popup) {
        const currentTab = {currentWindow:true, active:true};
        chrome.tabs.query(currentTab, function(tabs) {
          popup = 'register';
          chrome.browserAction.openPopup();
        });
      }
      if (cacheStorage.checkbox.icon) {
        
      }*/
      sendResponse({data: true});
      break;
    case 'getWhitelist':
      sendResponse({data: cacheStorage.whitelist});
      break;
    case 'setWhitelist':
      cacheStorage.whitelist = request.data;
      whiteSet = new Set(cacheStorage.whitelist);
      sendUpdateOptions();
      break;
    case 'addWhitelist':
      if (!whiteSet.has(request.hostname)) {
        cacheStorage.whitelist.push(request.hostname);
        whiteSet.add(request.hostname);
        sendUpdateOptions();
      }
      break;
    case 'removeWhitelist':
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
/*
1. 表示時
  + ホワイトリスト
    + サービスワーカー登録
  + 上記以外
    + サービスワーカー登録拒否
      + ブラウザアクションの表示を変更
1. ブラウザアクション
1. コンテキストメニュー
  + [不採用]サービスワーカー登録確認
    + ブラウザアクションの表示を変更
  + ホワイトリスト追加
  + ホワイトリスト除外


+ オプション
  + サービスワーカー登録拒否時に通知する
  + サービスワーカー登録時にアイコンを変更する
*/
