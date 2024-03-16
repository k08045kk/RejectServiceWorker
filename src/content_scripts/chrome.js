/**
 * コンテンツスクリプト（ISOLATED）
 * Chrome 用
 */


let   isExec = false;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：「http:」のページでも実行される
//       "matches": ["https://*/*"], で何故か動作する。
if (isExec) {
  
  
  
  // ページスクリプト（MAIN）を実行する
  const runPageScript = (src) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    document.documentElement.appendChild(script);
    script.remove();
  };
  // サービスワーカーの登録可否を確認する
  const verifyAsyncFunc = async () => {
    let cache = null;
    try {
      cache = await chrome.storage.session?.get({whitelist:null});
    } catch {
      // Error: Access to storage is not allowed from this context.
    }
    if (!cache?.whitelist) {
      cache = await chrome.storage.local.get({whitelist:[]});
    }
    const hostname = location.hostname.replace(/\.$/, '');
    return cache.whitelist.includes(hostname) ? 'OK' : 'NG';
  };
  
  
  
  // サービスワーカー登録監視（登録 or 拒否）
  runPageScript('/content_scripts/chrome-main.js');
  // 備考：ServiceWorkerContainer.prototype.register (navigator.serviceWorker.register) 上書きする
  //       本処理まで、即時実行する必要がある。そのため、非同期処理に侵入してはならない。
  // 備考：document_start でのスクリプト挿入で、登録前に上書きできる予定
  // 備考：key が固定値であるため、対策すれば突破される。
  //       突破された場合、登録解除・キャッシュ削除で妥協する。
  
  
  
  (async function() {
    if (await verifyAsyncFunc() === 'NG') {
      // 拒否
      runPageScript('/content_scripts/chrome-failure.js');
      
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        if (registrations.length) {
          // サービスワーカーを登録解除
          const unregisterPromises = registrations.map(registration => registration.unregister());
          
          // キャッシュストレージを全削除
          const keys = await caches.keys();
          const cacheDeletePromises = keys.map(key => caches.delete(key));
          
          //await Promise.all(unregisterPromises);
          //await Promise.all(cacheDeletePromises);
        }
      } catch (e) {
        //console.log(e);
      }
    } else {
      // 許可
      runPageScript('/content_scripts/chrome-success.js');
    }
  })();
}
// 備考：localhost(127.0.0.1) は、コンテンツスクリプト（ISOLATED）から拒否できない。貫通する。 #20
//       だが、ページスクリプト（MAIN）からは、登録解除できる。
//       Chrome 側の意図的な処理であると考えるため、拒否しないでおく
