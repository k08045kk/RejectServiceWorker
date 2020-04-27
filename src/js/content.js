/**
 * コンテンツスクリプト処理
 */

const RejectServiceWorker = {
  ver: 1,
  registers: [],
};

(function() {
  // サービスワーカー登録鍵
  const key = Math.random().toString(32).substring(2);
  const jsRejectServiceWorkerEnableKey = `
    navigator.serviceWorker.RejectServiceWorkerKey = '`+key+`';
  `;
  const jsRejectServiceWorkerDisableKey = `
    navigator.serviceWorker.RejectServiceWorkerKey = '.';
  `;
  // サービスワーカー登録監視
  // サービスワーカー登録は、サービスワーカー登録鍵を待機する
  // サービスワーカー登録鍵あり時、登録する
  // サービスワーカー登録鍵なし時、登録拒否する
  const jsRegisterServiceWorker = `
    try {
      ServiceWorkerContainer.prototype.register = (function(register, key) {
        return function(scriptURL, options) {
          //console.log('RejectServiceWorker.register: jsRegisterServiceWorker');
          window.postMessage({
            method: 'RejectServiceWorker.register',
            register: {
              scriptURL: scriptURL,
              options: options,
            },
          }, '*');
          return new Promise((resolve, reject) => {
            var func = function() {
              if (navigator.serviceWorker.RejectServiceWorkerKey) {
                if (navigator.serviceWorker.RejectServiceWorkerKey == key) {
                  register(scriptURL, options).then(resolve, reject);
                } else {
                  reject(new Error('Reject to register a ServiceWorker.'));
                }
              } else {
                window.setTimeout(func, 100);
              }
            };
            func();
          });
        };
      })(ServiceWorkerContainer.prototype.register.bind(navigator.serviceWorker), '`+key+`');
    } catch (e) {}
  `;
  // サービスワーカー登録拒否（再度、上書きされる可能性あり）
  const jsRejectServiceWorker = `
    try {
      ServiceWorkerContainer.prototype.register = function(scriptURL, options) {
        //console.log('RejectServiceWorker.register: jsRejectServiceWorker');
        window.postMessage({
          method: 'RejectServiceWorker.register',
          register: {
            scriptURL: scriptURL,
            options: options,
          },
        }, '*');
        return new Promise((resolve, reject) => {
          //console.log('Reject to register a ServiceWorker.');
          reject(new Error('Reject to register a ServiceWorker.'));
        });
      };
    } catch (e) {}
  `;
  // サービスワーカー登録解除（失敗する可能性あり）
  const jsUnregisterServiceWorker = `
    try {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let i=0; i<registrations.length; i++) {
          registrations[i].unregister();
          //console.log('ServiceWorker unregister.');
        }
        if (registrations.length != 0) {
          window.caches.keys().then((keys) => {
            Promise.all(keys.map((key) => { return window.caches.delete(key); })).then(() => {
              //console.log('caches delete.');
            });
          });
        }
      });
    } catch (e) {}
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
    if (event.source == window && event.data.method == 'RejectServiceWorker.register') {
      //console.log(event.data.register.scriptURL);
      RejectServiceWorker.registers.push(event.data.register);
      
      // TODO: 登録通知
    }
  });
  runPageScript(jsRegisterServiceWorker);
  
  // サービスワーカー登録拒否
  chrome.runtime.sendMessage({
    method: 'verify',
    hostname: location.hostname,
  }, (response) => {
    if (response.data) {
      // 許可
      runPageScript(jsRejectServiceWorkerEnableKey);
    } else {
      // 拒否
      runPageScript(jsRejectServiceWorkerDisableKey + jsRejectServiceWorker + jsUnregisterServiceWorker);
    }
  });
})();

// 備考
// document_startタイミングでスクリプトを挿入することで、登録関数をバックアップされる前に上書きできる予定
// 登録鍵への総当り攻撃で登録をされる可能性がある。
// 登録解除は、確実に成功する保証はない。
