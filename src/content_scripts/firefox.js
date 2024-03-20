/**
 * コンテンツスクリプト（ISOLATED）
 * Firefox 用
 */


let   isExec = false;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：「http:」のページでも実行されることがある
//       "matches": ["https://*/*"], で何故か動作する。
if (isExec) {
  
  
  // サービスワーカーの登録可否を確認する
  const verifyAsyncFunc = async () => {
    let cache = null;
    try {
      cache = await browser.storage.session?.get({whitelist:null});
    } catch {
      // Error: Access to storage is not allowed from this context.
    }
    if (!cache?.whitelist) {
      cache = await browser.storage.local.get({whitelist:[]});
    }
    const hostname = location.hostname.replace(/\.$/, '');
    return cache.whitelist.includes(hostname) ? 'OK' : 'NG';
    // 備考：mv2 対策のため、 chrome ではなく browser でアクセスする。
  };
  let verifyPromise = null;
  
  
  
  // サービスワーカー登録監視（登録 or 拒否）
  const register = new Proxy(window.ServiceWorkerContainer.prototype.register, {
    apply(target, self, args) {
      return new window.Promise((resolve, reject) => {
        verifyPromise = verifyPromise || verifyAsyncFunc();
        verifyPromise.then((verify) => {
          if (verify === 'NG') {
            reject(new window.Error('Reject to register a ServiceWorker.'));
            // 備考：標準関数は、 reject() 時エラーを出力する。
            //       例：sw.js is 404
          } else {
            Reflect.apply(target, self, args).then(resolve, reject);
          }
        });
      });
    },
    // 備考: #9 ページスクリプト内では、ページスクリプトのオブジェクトを使用する必要があります。
    //       window.Object でコンテンツスクリプトではなく、ページスクリプトのオブジェクトを使用できます。
    //       コンテンツスクリプトの Promise を間違って渡すとエラーを出力します。
    //         「 Error: Permission denied to access property "then"」
    //       コンテンツスクリプトの Error を間違って渡すとエラーを出力します。
    //         「InternalError: Promise rejection value is a non-unwrappable cross-compartment wrapper.」
    //       window.Proxy
    //         「Error: Permission denied to access property "apply"」
    //       window.Reflect
    //         「TypeError: window.Reflect.apply is not a function」
    //   see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts
  });
  exportFunction(
      register, 
      window.ServiceWorkerContainer.prototype, 
      {defineAs: 'register'});
  // 備考：ServiceWorkerContainer.prototype.register (navigator.serviceWorker.register) 上書きする
  //       本処理まで、即時実行する必要がある。そのため、非同期処理に侵入してはならない。
  // 備考：document_start でのスクリプト挿入で、登録前に上書きできる予定
  
  
  
  (async function() {
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
      // 備考：[ブラウザツールボックス][マルチプロセス]でエラーを表示する
      //       「Failed to get service worker registration(s): Storage access is restricted in this context due to user settings or private browsing mode.」
      //       try / catch では止まらない。止め方がわからないため、出力したままにしておく。
    } catch (e) {
      //console.log(e);
      // DOMException: The operation is insecure.
    }
  })();
}
