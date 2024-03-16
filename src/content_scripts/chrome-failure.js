// invalid key
window.RejectServiceWorker = {key: '.'};



// ServiceWorker registration reject
ServiceWorkerContainer.prototype.register = new Proxy(ServiceWorkerContainer.prototype.register, {
  apply(target, self, args) {
    return Promise.reject(new Error('Reject to register a ServiceWorker.'));
    // Issues #14: "Uncaught (in promise) Error: Reject to register a ServiceWorker."
    // If the site does not catch it, the above error will occur.
    // It will be described as an error on the extension side. (occurs from manifest v3)
  }
});



//(async function() {
//  try {
//    const registrations = await navigator.serviceWorker.getRegistrations();
//    if (registrations.length) {
//      // Unregister service worker
//      const unregisterPromises = registrations.map(registration => registration.unregister());
//      
//      // Delete all cache storage
//      const keys = await caches.keys();
//      const cacheDeletePromises = keys.map(key => caches.delete(key));
//      
//      //await Promise.all(unregisterPromises);
//      //await Promise.all(cacheDeletePromises);
//    }
//  } catch (e) {
//    //console.log(e);
//  }
//})();
