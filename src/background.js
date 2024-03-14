/**
 * background.js
 */



// メモリ上にキャッシュする
if (chrome.storage.session.setAccessLevel) {
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes.whitelist) {
      const whitelist = changes.whitelist.newValue || [];
      chrome.storage.session.set({whitelist});
    }
  });
}



async function onStartup() {
  // メモリ上にキャッシュする
  if (chrome.storage.session.setAccessLevel) {
    const accessOptions = {accessLevel: chrome.storage.AccessLevel.TRUSTED_AND_UNTRUSTED_CONTEXTS};
    await chrome.storage.session.setAccessLevel(accessOptions);
    
    const localStorege = await chrome.storage.local.get({whitelist:[]});
    await chrome.storage.session.set(localStorege);
  }
};



let startupingPromise = null;
async function startuping() {
//console.log('startuping');
  const sessionStorage = await chrome.storage.session.get({startup:false});
  if (!sessionStorage.startup) {
    await chrome.storage.session.set({startup:true});
    await onStartup();
  }
};
async function startup() {
  if (startupingPromise) {
    await startupingPromise;
  } else {
    startupingPromise = startuping();
    await startupingPromise;
    //startupingPromise = null;
  }
};
chrome.runtime.onInstalled.addListener(startup);
chrome.runtime.onStartup.addListener(startup);
startup();
