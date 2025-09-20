const CACHE = 'vip-stego-v2';
const ASSETS = [
  './',
  './index.html',
  './encrypt.html',
  './decrypt.html',
  './about.html',
  './css/styles.css',
  './js/animations.js',
  './js/utils.js',
  './js/stego.js',
  './js/crypto.js',
  './js/app-encrypt.js',
  './js/app-decrypt.js',
  './assets/ai-lock.svg',
  './assets/icon.png',
  './manifest.webmanifest'
];
self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e)=>{
  e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request)));
});
