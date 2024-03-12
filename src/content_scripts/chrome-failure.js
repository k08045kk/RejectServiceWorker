
// jsRejectServiceWorkerDisableKey
window.RejectServiceWorker = {key: '.'};



// jsRejectServiceWorker
ServiceWorkerContainer.prototype.register = (scriptURL, options) => {
  return Promise.reject(new Error('Reject to register a ServiceWorker.'));
  // Issues #14: "Uncaught (in promise) Error: Reject to register a ServiceWorker."
  // If the site does not catch it, the above error will occur.
  // It will be described as an error on the extension side. (occurs from manifest v3)
};



// jsUnregisterServiceWorker
let   isExec = false;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：navigator.serviceWorker アクセスでエラーすることがある（#15）
//       エラー時は、登録解除は実施しない。
if (isExec) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let i=0; i<registrations.length; i++) {
      registrations[i].unregister();
      //console.log('RejectServiceWorker', 'unregister');
    }
    if (registrations.length != 0) {
      window.caches.keys().then((keys) => {
        Promise.all(keys.map((key) => window.caches.delete(key))).then(() => {
          //console.log('RejectServiceWorker', 'caches delete');
        });
      });
    }
  }).catch(error => {});
}
