// Service Worker do Blackboard: permite instalar o app e abrir offline.
const CACHE = "blackboard-v1";
const CORE = [
  "./", "./index.html", "./style.css", "./script.js", "./data.js", "./manifest.json",
  "./assets/icone/flow-ico.svg", "./assets/icone/icon-192.png", "./assets/icone/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // Vídeos do YouTube e imagens externas não são cacheados
  if (url.hostname.includes("youtube") || url.hostname.includes("ytimg") || url.hostname.includes("github.com")) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && (res.ok || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached || (req.mode === "navigate" ? caches.match("./index.html") : undefined));
      return cached || network;
    })
  );
});
