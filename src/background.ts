/**
 * Background service worker
 * Currently minimal - can be extended for future features
 */

chrome.runtime.onInstalled.addListener(() => {
  console.log('AliceHR extension installed');
});
