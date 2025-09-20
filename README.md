# VIP Stego v2 — متعدد الصفحات + أنيميشن فاخر

- صفحات مستقلة: `index.html` (رئيسية)، `encrypt.html`، `decrypt.html`، `about.html`.
- واجهة زجاجية محسّنة + أنيميشن: ظهور تدريجي، شيمر، تموّج أزرار (Ripple)، بارالاكس للأجرام، Tilt ثلاثي الأبعاد للبطاقات.
- تشفير AES‑256‑GCM + PBKDF2‑SHA256 وإخفاء LSB (3 بت/بكسل).
- PWA يعمل دون اتصال بعد أول فتح (sw.js + manifest).

## التشغيل
يفضّل تشغيل خادم محلي (VS Code + Live Server) لعمل WebCrypto بسياق آمن.
