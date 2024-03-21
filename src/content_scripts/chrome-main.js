// ServiceWorker registration monitoring (register or reject)
;(function() {
  const id = 'RejectServiceWorker'
  const key = document.currentScript.dataset.arg;
  const name = id+'.'+key;
  
  const gError = Error;
  const gString = String;
  const gStringStartsWith = String.prototype.startsWith;
  const gPromise = Promise;
  const gReflectApply = Reflect.apply;
  // Note: Modest resistance to getter / apply traps.
  
  
  const verifyPromise = new Promise((resolve) => {
    ServiceWorkerContainer.prototype.register = new Proxy(ServiceWorkerContainer.prototype.register, {
      apply(target, self, args) {
        return new gPromise((resolve, reject) => {
          verifyPromise.then((verify) => {
            if (verify === 'NG') {
              reject(new gError('Reject to register a ServiceWorker.'));
              // Issue #14: "Error: Reject to register a ServiceWorker."
              // If the site does not catch it, the above error will occur.
            } else {
              gReflectApply(target, self, args).then(resolve, reject);
            }
          });
        });
      },
      has(target, prop) {
        try {
          if (resolve) {
            const str = gString(prop);
            if (gReflectApply(gStringStartsWith, str, [id])) {
              resolve(str === name ? 'OK' : 'NG');
              resolve = null;
            }
            // Note: Multiple attempts to open the lock will be treated as a forced failure.
          }
        } catch {}
        return prop in target;
      },
    });
  });
})();
