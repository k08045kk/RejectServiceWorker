// ServiceWorker registration monitoring (register or reject)
;(function() {
  const gError = Error;
  const gPromise = Promise;
  const gReflectApply = Reflect.apply;
  const gDispatchEvent = EventTarget.prototype.dispatchEvent;
  // Note: Modest resistance to apply / construct / getter traps.
  
  
  const name = 'RejectServiceWorker';
  const script = document.currentScript;
  const key = script.dataset.arg;
  script.dataset.arg = '.';
  
  
  let ready = false;
  const event = new CustomEvent(name+'.ready');
  const verifyPromise = new Promise((resolve) => {
    const listener = (event) => resolve(ready && event.detail === key ? 'OK' : 'NG');
    script.addEventListener(name+'.verify', listener, {capture:true, onece:true, passive:true});
    // Note: Without a ready event, receiving the event will fail due to timing issues.
    //       It waits for the listener to register and then fires the verify event.
    // Note: Don't verify until needed to reduce storage access.
    //       If a security issue is confirmed, we will change the authentication method.
  });
  // Note: Authenticate with both dataset and addEventListener.
  //       This is a risk hedge in case one of them is breached.
  
  
  ServiceWorkerContainer.prototype.register = new Proxy(ServiceWorkerContainer.prototype.register, {
    apply(target, self, args) {
      return new gPromise((resolve, reject) => {
        if (!ready) {
          ready = true;
          gReflectApply(gDispatchEvent, script, [event]);       // RejectServiceWorker.ready
        }
        verifyPromise.then((verify) => {
          if (verify === 'NG') {
            reject(new gError('Reject to register the service worker.'));
            // Issue #14: "Error: Reject to register a ServiceWorker."
            // If the site does not catch it, the above error will occur.
          } else {
            gReflectApply(target, self, args).then(resolve, reject);
          }
        });
      });
    },
  });
})();
