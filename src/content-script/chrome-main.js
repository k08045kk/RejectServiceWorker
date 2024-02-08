ServiceWorkerContainer.prototype.register = new Proxy(ServiceWorkerContainer.prototype.register, {
  apply(target, self, args) {
    return new Promise((resolve, reject) => {
      const func = () => {
        if (window.RejectServiceWorker?.key) {
          if (window.RejectServiceWorker?.key === 'falajmifjcihbmlokgomiklbfmgmnopd') {
            //console.log('RejectServiceWorker', 'register', 'register');
            Reflect.apply(target, self, args).then(resolve, reject);
          } else {
            //console.log('RejectServiceWorker', 'register', 'reject');
            reject(new Error('Reject to register a ServiceWorker.'));
            // Issues #14: "Uncaught (in promise) Error: Reject to register a ServiceWorker."
            // If the site does not catch it, the above error will occur.
            // It will be described as an error on the extension side. (occurs from manifest v3)
          }
        } else {
          window.setTimeout(func, 1000);
        }
      };
      func();
    });
  }
});
