/**
 * コンテンツスクリプト処理
 * Firefox 用
 */
//console.log('content-script', location.href);

let   isExec = true;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：「http:」のページでも実行されることがある
//       "matches": ["https://*/*"], で何故か動作する。
// 備考：navigator.serviceWorker アクセスでエラーすることがある（#15）
//       エラー時でも、登録拒否だけは実施する。
//       エラー時は、登録解除は実施しない。
if (isExec) {
  let verify = null;

  // サービスワーカー登録監視
  // サービスワーカー登録は、サービスワーカー登録鍵を待機する
  // サービスワーカー登録鍵あり時、登録する
  // サービスワーカー登録鍵なし時、登録拒否する
  const register = new Proxy(ServiceWorkerContainer.prototype.register, {
    apply(target, self, args) {
      return new window.Promise((resolve, reject) => {
        const func = () => {
          if (verify) {
            if (verify === 'OK') {
              Reflect.apply(target, self, args).then(resolve, reject);
            } else {
              reject(new window.Error('Reject to register a ServiceWorker.'));
            }
          } else {
            window.setTimeout(func, 1000);
          }
        };
        func();
      });
    }
  });
  // サービスワーカー登録拒否（再度、上書きされる可能性あり）
  const reject = function(scriptURL, options) {
    return window.Promise.reject(new Error('Reject to register a ServiceWorker.'));
    // 備考：[ブラウザツールボックス][マルチプロセス]でエラーを表示する
    //       DevTools 等への表示はなし（ユーザーからはほぼ見えない）
    //       「Error: Reject to register a ServiceWorker.」
  };
  // サービスワーカー登録解除（失敗する可能性あり）
  const unregister = function() {
    let   isExec2 = false;
    try { isExec2 = !!navigator.serviceWorker; } catch {}
    // 備考：navigator.serviceWorker アクセスでエラーすることがある（#15）
    //       エラー時は、登録解除は実施しない。
    if (isExec2) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let i=0; i<registrations.length; i++) {
          registrations[i].unregister();
          //console.log('ServiceWorker unregister.');
        }
        if (registrations.length != 0) {
          caches.keys().then((keys) => {
            Promise.all(keys.map((key) => caches.delete(key))).then(() => {
              //console.log('caches delete.');
            });
          });
        }
      }).catch((error) => {});
      // 備考：[ブラウザツールボックス][マルチプロセス]でエラーを表示する
      //       「Failed to get service worker registration(s): Storage access is restricted in this context due to user settings or private browsing mode.」
      //       try / catch では止まらない。止め方がわからないため、出力したままにしておく。
    }
  };
  // Note: #9 ページスクリプト内では、ページスクリプトのオブジェクトを使用する必要があります。
  //       window.Object でコンテンツスクリプトではなく、ページスクリプトのオブジェクトを使用できます。
  //       see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts



  // サービスワーカー登録監視
  exportFunction(
      register, 
      ServiceWorkerContainer.prototype, 
      {defineAs: 'register'});


  // サービスワーカー登録許可・拒否
  chrome.storage.local.get(defaultStorage).then((cache) => {
    if (cache.whitelist.includes(location.hostname)) {
      // 許可
      verify = 'OK';
    } else {
      // 拒否
      verify = 'NG';
      exportFunction(
          reject, 
          ServiceWorkerContainer.prototype, 
          {defineAs: 'register'});
      unregister();
    }
  });
}
// 備考
// document_start でスクリプトを挿入することで、登録関数をバックアップ前に上書きできる予定
// 登録鍵への総当り攻撃で登録をされる可能性がある。登録解除は、確実に成功する保証はない。
