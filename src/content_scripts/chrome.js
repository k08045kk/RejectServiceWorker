/**
 * コンテンツスクリプト（ISOLATED）
 * Chrome 用
 */


let   isExec = false;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：「http:」のページでも実行される
//       "matches": ["https://*/*"], で何故か動作する。
if (isExec) {
  const name = 'RejectServiceWorker';
  const key = Math.random().toString(36).substring(2);
  
  
  
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
  let verifyPromise;
  
  
  
  // コンテンツスクリプト（MAIN）を実行する
  // サービスワーカー登録監視（登録 or 拒否）
  const script = document.createElement('script');
  script.dataset.arg = key;
  script.addEventListener(name+'.ready', (event) => {
    verifyPromise = verifyPromise || verifyAsyncFunc();
    verifyPromise.then((verify) => {
      const detail = verify === 'OK' ? key : '.';
      script.dispatchEvent(new CustomEvent(name+'.verify', {detail}));
    });
  }, {capture:true, onece:true, passive:true});
  script.src = chrome.runtime.getURL('/content_scripts/chrome-main.js');
  document.documentElement.appendChild(script);
  script.remove();
  // 備考：ServiceWorkerContainer.prototype.register (navigator.serviceWorker.register) を上書きする
  //       本処理まで、即時実行する必要がある。そのため、非同期処理に侵入してはならない。
  // 備考：document_start でのスクリプト挿入で、登録前に上書きできる予定
  
  
  
  ;(async function() {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      if (registrations.length) {
        verifyPromise = verifyPromise || verifyAsyncFunc();
        if (await verifyPromise === 'NG') {
          // サービスワーカーを登録解除
          const unregisterPromises = registrations.map(registration => registration.unregister());
          await Promise.all(unregisterPromises);
          
          // キャッシュストレージを全削除
          const keys = await caches.keys();
          const cacheDeletePromises = keys.map(key => caches.delete(key));
          await Promise.all(cacheDeletePromises);
          
          // 備考：登録解除・キャッシュ削除後に登録された場合、
          //       次回アクセス時に登録解除・キャッシュ削除します。
          //       事実として突破されるパターンは存在します。
          // 備考：登録された場合、 install でキャッシュされます。
          //       また、 activate で skipWaiting() を実施することで、
          //       ページが閉じるのを待たずに直ちに処理を開始することもできます。
        }
      }
    } catch (e) {
      //console.log(e);
    }
  })();
}
// 備考：localhost(127.0.0.1) は、コンテンツスクリプト（ISOLATED）から拒否できない。貫通する。 #20
//       だが、ページスクリプト（MAIN）からは、登録解除できる。
//       Chrome 側の意図的な処理であると考えるため、拒否しないでおく
