// ServiceWorker registration monitoring (register or reject)
ServiceWorkerContainer.prototype.register = new Proxy(ServiceWorkerContainer.prototype.register, {
  apply(target, self, args) {
    return new Promise((resolve, reject) => {
      const func = () => {
        const key = window.RejectServiceWorker?.key;
        if (key === 'falajmifjcihbmlokgomiklbfmgmnopd') {
          Reflect.apply(target, self, args).then(resolve, reject);
        } else if (key) {
          reject(new Error('Reject to register a ServiceWorker.'));
          // Issues #14: "Uncaught (in promise) Error: Reject to register a ServiceWorker."
          // If the site does not catch it, the above error will occur.
          // It will be described as an error on the extension side. (occurs from manifest v3)
        } else {
          setTimeout(func, 1000);
        }
      };
      func();
    });
  }
});
