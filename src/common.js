/**
 * 共通処理
 */
/**
 * 備考
 * 最小対応バージョンの覚書
 * 
 * Firefox 115.0+
 *   manifest.json
 *     browser_specific_settings.gecko.strict_min_version = "115.0";
 *   109: Manifest V3 対応（既定で有効化）
 *   115: ESR
 * 
 * Android Firefox 121.0+
 *   manifest.json
 *     browser_specific_settings.gecko_android.strict_min_version = "121.0";
 *   107: Android Firefox Bate: Supports WebExtension API
 *   121: Android Firefox:      Supports WebExtension API
 *   122: Android Firefox: Bug: Obtaining host_permission is required for content_scripts operation.
 * 
 * Chrome 88.0+
 *   manifest.json
 *     minimum_chrome_version = "88.0"
 *   88:  Manifest v3 対応
*/

const defaultStorage = {
  version: 2,
  whitelist: [],
};
