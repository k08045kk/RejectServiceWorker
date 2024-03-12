/**
 * コンテンツスクリプト処理
 * Chrome 用（ISOLATED）
 */


let   isExec = true;
try { isExec = !!navigator.serviceWorker; } catch {}
// 備考：「http:」のページでも実行される
//       "matches": ["https://*/*"], で何故か動作する。
// 備考：navigator.serviceWorker アクセスでエラーすることがある（#15）
//       エラー時でも、登録拒否だけは実施する。
//       エラー時は、登録解除は実施しない。
if (isExec) {
  // ページ内スクリプトの実行
  const runPageScript = (src) => {
    const script = document.createElement('script');
    script.src = src;
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  };


  // サービスワーカー登録監視
  runPageScript(chrome.runtime.getURL("/content-script/chrome-main.js"));


  // サービスワーカー登録確認
  (async function() {
    let cache = null;
    try {
      cache = await chrome.storage.session?.get({whitelist:null});
    } catch {
      // Uncaught (in promise) Error: Access to storage is not allowed from this context.
    }
    if (!cache?.whitelist) {
      cache = await chrome.storage.local.get({whitelist:[]});
    }
    
    if (cache.whitelist.includes(location.hostname)) {
      // 許可
      runPageScript(chrome.runtime.getURL("/content-script/chrome-success.js"));
    } else {
      // 拒否
      runPageScript(chrome.runtime.getURL("/content-script/chrome-failure.js"));
    }
  })();
}
