// valid key
try {
  const id = 'RejectServiceWorker';
  const key = document?.currentScript?.dataset?.arg ?? '';
  const name = id+'.'+key;
  name in ServiceWorkerContainer.prototype.register;
} catch (e) { /*console.log(e);*/ }
