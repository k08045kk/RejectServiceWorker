/**
 * オプションページ処理
 */


let listTimer = null;
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
  const text = document.getElementById(listId).value;
  
  listText = text.split('\n').map(v => v.trim()).filter(v => v != '').join('\n');
  await chrome.storage.local.set({whitelist: listText.split('\n')});
  document.getElementById(listId).value = listText;
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
