// invalid key
try {
  const id = 'RejectServiceWorker';
  const name = id;
  name in ServiceWorkerContainer.prototype.register;
} catch (e) { /*console.log(e);*/ }
