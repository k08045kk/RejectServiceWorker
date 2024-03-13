/**
 * オプションページ処理
 */


let listTimer = 0;
let listText = '';
const listId = 'storage_whitelist';


// リストの更新
const updateList = async () => {
  const text = document.getElementById(listId).value;
  if (listText != text) {
    listText = text;
    await chrome.storage.local.set({whitelist: listText.split('\n')});
  }
};
const updateList2 = async () => {
  clearTimeout(listTimer);
  listTimer = 0;
  
  const text = document.getElementById(listId).value;
  
  let list = text.split('\n');
  // 行頭行末のスペース除去（「　.jp（全角スペース.jp）」等は存在しない）
  // ルートドメインの省略
  list = list.map(v => v.trim().replace(/\.$/, '')).filter(v => v != '');
  list = list.map(v => {
    // ピュニコードへエンコード
    // ホスト名でない部分を削除
    try { return new URL(v).hostname; } catch {}        // URL 形式（http://host or http://host/path）
    try { return new URL('http://'+v).hostname; } catch {}  // ドメイン名形式（日本語.jp）
    return '';
  }).filter(v => v != '');
  list = [...new Set(list)];  // 重複排除
  
  listText = list.join('\n');
  await chrome.storage.local.set({whitelist: listText.split('\n')});
  document.getElementById(listId).value = listText;
  
  // 備考：タブ・ウィンドウを直接クローズすると、本関数を回避できる
};


// オプション画面の初期化
document.addEventListener('DOMContentLoaded', async () => {
  const cache = await chrome.storage.local.get(defaultStorage);
  listText = cache.whitelist.join('\n');
  document.getElementById(listId).value = listText;
  document.getElementById(listId).addEventListener('blur', updateList2);
  document.getElementById(listId).addEventListener('input', () => {
    clearTimeout(listTimer);
    listTimer = setTimeout(updateList, 500);
  });
});


// ストレージの変更通知（別ページ限定）
chrome.storage.local.onChanged.addListener((changes) => {
  if (changes.whitelist) {
    const whitelist = changes.whitelist.newValue || [];
    listText = whitelist.join('\n');
    document.getElementById(listId).value = listText;
  }
});
