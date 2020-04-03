/**
 * 共通処理
 */

// ブラウザ判定
function isFirefox() {
  return typeof browser !== void 0 && typeof chrome !== void 0;
};
function isChrome() {
  return !(isFirefox());
};
function isEdge() {
  return typeof edge !== void 0 && typeof chrome !== void 0;
};

// モバイル判定
function isMobile() {
  let ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('android') >= 0
      || ua.indexOf('mobile') >= 0
      || ua.indexOf('iphone') >= 0
      || ua.indexOf('ipod') >= 0;
};

// Windows判定
function isWindows() {
  return (window.navigator.platform.indexOf('Win') == 0);
};

// ストレージの初期値
var defaultStorage = {
  whitelist: [],
  checkbox: {
    popup: false,
    icon: false
  }
};

// ストレージの取得
function getStorage() {
  //return (chrome.storage.sync ? chrome.storage.sync : chrome.storage.local);
  return chrome.storage.local;
};

// ブラウザアクションの更新
function updateBrowserAction() {
  chrome.browserAction.setPopup({popup: '/html/popup.html'});
};
