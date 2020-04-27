/**
 * 共通処理
 */

// ブラウザ判定
function isFirefox() {
  return typeof browser != "undefined" && typeof chrome != "undefined";
};
function isChrome() {
  return !isFirefox();
};

// モバイル判定
function isMobile() {
  const ua = window.navigator.userAgent.toLowerCase();
  return ua.indexOf('android') != -1
      || ua.indexOf('mobile') != -1
      || ua.indexOf('iphone') != -1
      || ua.indexOf('ipod') != -1;
}

// ストレージの初期値
var defaultStorage = {
  version: 1,
  whitelist: [],
  checkbox: {
    notificationPopup: false,
    notificationIcon: false,
  },
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
