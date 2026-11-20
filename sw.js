// Service Worker：第一次連網開啟後，把頁面和照片存在 iPhone 裡，之後離線也能開
var CACHE = "clock-v1";
var FILES = ["./", "./index.html"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; })
      .map(function (k) { return caches.delete(k); }));
  }));
});

// 自己網站的檔案（頁面、images/ 裡的照片）：先用快取，背景再偷偷更新
// 外部的東西（天氣、隨機照片）不快取
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res.ok) c.put(req, res.clone());
        return res;
      })["catch"](function () { return hit; });
      return hit || net;
    });
  }));
});
