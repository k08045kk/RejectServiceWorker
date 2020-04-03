/**
 * コンテンツスクリプト処理
 */

(function() {
  // サービスワーカー登録を監視
  const jsRegisterServiceWorker = `
    navigator.serviceWorker.register_backup = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function(scriptURL, options) {
      //console.log('RejectServiceWorker.register');
      window.postMessage("RejectServiceWorker.register", "*");
      return navigator.serviceWorker.register_backup(scriptURL, options);
    };
  `;
  // サービスワーカー登録を拒否
  const jsRejectServiceWorker = `
    navigator.serviceWorker.register = function(scriptURL, options) {
      window.postMessage("RejectServiceWorker.register", "*");
      return new Promise(function(resolve, reject) {
        reject(new Error('Reject to register a ServiceWorker.'));
        //console.log('Reject to register a ServiceWorker.');
      });
    };
  `;
  // サービスワーカーをアンインストール
  const jsUnregisterServiceWorker = `
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister();
        //console.log('ServiceWorker unregister.');
        window.caches.keys().then(function(keys) {
          Promise.all(keys.map((key) => { return window.caches.delete(key); })).then(() => {
            //console.log('caches delete.');
          });
        });
      }
    });
  `;
  
  // ページ内スクリプトの実行
  const runPageScript = function(text) {
    var script = document.createElement('script');
    script.textContent = text;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  };
  
  // サービスワーカー登録監視
  window.addEventListener('message', function(event) {
    if (event.source == window && event.data == 'RejectServiceWorker.register') {
      chrome.runtime.sendMessage({
        method: 'register',
        hostname: location.hostname
      }, function (response) {
        
      });
    }
  });
  runPageScript(jsRegisterServiceWorker);
  
  // ページ表示通知 + ホワイトリスト判定結果
  chrome.runtime.sendMessage({
    method: 'view',
    hostname: location.hostname
  }, function (response) {
    if (response.data) {
      // ブロック and アンインストール
      runPageScript(jsRejectServiceWorker + jsUnregisterServiceWorker);
    }
  });
})();
