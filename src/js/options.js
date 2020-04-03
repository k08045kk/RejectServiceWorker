/**
 * オプションページ処理
 */

(function() {
  // オプション画面の更新
  function onUpdateOptions(storage) {
    document.getElementById('storage_whitelist').value = storage.whitelist.join('\n');
    Object.keys(storage.checkbox).forEach(function(v) {
      document.getElementById('storage_checkbox_'+v).checked = storage.checkbox[v];
    });
  };
  
  // ホワイトリストの更新
  function onUpdateWhitelist() {
    const text = document.getElementById('storage_whitelist').value;
    chrome.runtime.sendMessage({
      method: 'setWhitelist',
      data: text.split('\n').map((v) => { return v.trim(); }).filter((v) => { return v != ''; })
    });
  };
  
  // チェックボックスの更新
  function onUpdateCheckbox() {
    const checkbox = {};
    Object.keys(defaultStorage.checkbox).forEach(function(v) {
      checkbox[v] = document.getElementById('storage_checkbox_'+v).checked;
    });
    getStorage().set({checkbox: checkbox});
  };
  
  // オプション画面の初期化
  function onInitialize() {
    getStorage().get(defaultStorage, function(storage) {
      onUpdateOptions(storage);
      document.getElementById('storage_whitelist').addEventListener('input', onUpdateWhitelist);
      Object.keys(storage.checkbox).forEach(function(v) {
        document.getElementById('storage_checkbox_'+v).addEventListener('click', onUpdateCheckbox);
      });
    });
  };
  
  // メッセージイベント
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.method) {
    case 'updateOptions':
      onUpdateOptions(request.data);
      break;
    }
  });
  
  document.addEventListener("DOMContentLoaded", onInitialize);
})();
