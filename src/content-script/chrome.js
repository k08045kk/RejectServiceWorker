/**
 * コンテンツスクリプト処理
 * Chrome 用（ISOLATED）
 */


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
chrome.storage.local.get(defaultStorage).then((cache) => {
  if (cache.whitelist.includes(location.hostname)) {
    // 許可
    runPageScript(chrome.runtime.getURL("/content-script/chrome-success.js"));
  } else {
    // 拒否
    runPageScript(chrome.runtime.getURL("/content-script/chrome-failure.js"));
  }
});
