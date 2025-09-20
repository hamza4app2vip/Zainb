/* App logic */
(async function(){
  if('serviceWorker' in navigator){
    try{ await navigator.serviceWorker.register('./sw.js'); }catch{}
  }

  const dzInput = document.getElementById('dz-input');
  const dzDecode = document.getElementById('dz-decode');
  const fileInput = document.getElementById('fileInput');
  const fileDecode = document.getElementById('fileDecode');
  const secretText = document.getElementById('secretText');
  const password = document.getElementById('password');
  const togglePass = document.getElementById('togglePass');
  const passStrength = document.getElementById('passStrength');
  const imgMeta = document.getElementById('imgMeta');
  const iterationsEl = document.getElementById('iterations');
  const exportFormat = document.getElementById('exportFormat');
  const alphaMode = document.getElementById('alphaMode');
  const autoCapacity = document.getElementById('autoCapacity');
  const encryptLog = document.getElementById('encryptLog');
  const previewEncoded = document.getElementById('previewEncoded');
  const btnEncrypt = document.getElementById('btnEncrypt');
  const btnDownload = document.getElementById('btnDownload');

  const passwordDecode = document.getElementById('passwordDecode');
  const togglePassDecode = document.getElementById('togglePassDecode');
  const imgMetaDecode = document.getElementById('imgMetaDecode');
  const btnDecrypt = document.getElementById('btnDecrypt');
  const btnCopy = document.getElementById('btnCopy');
  const decryptLog = document.getElementById('decryptLog');
  const outputText = document.getElementById('outputText');

  const workCanvas = document.getElementById('workCanvas');
  const ctx = workCanvas.getContext('2d', { willReadFrequently:true });

  togglePass.addEventListener('click', ()=>{
    password.type = (password.type === 'password') ? 'text' : 'password';
  });
  togglePassDecode.addEventListener('click', ()=>{
    passwordDecode.type = (passwordDecode.type === 'password') ? 'text' : 'password';
  });

  password.addEventListener('input', ()=>{
    const s = estimatePasswordStrength(password.value);
    const texts = ['ضعيفة جدًا','ضعيفة','متوسطة','جيّدة','قوية'];
    passStrength.textContent = 'قوة كلمة المرور: ' + texts[s];
  });

  dzInput.addEventListener('click', ()=> fileInput.click());
  dzDecode.addEventListener('click', ()=> fileDecode.click());

  function readImage(file){
    return new Promise((resolve, reject)=>{
      const img = new Image();
      img.onload = ()=> resolve(img);
      img.onerror = ()=> reject(new Error('تعذر تحميل الصورة.'));
      img.src = URL.createObjectURL(file);
    });
  }

  function drawImageToCanvas(img){
    workCanvas.width = img.naturalWidth;
    workCanvas.height = img.naturalHeight;
    ctx.clearRect(0,0,workCanvas.width,workCanvas.height);
    ctx.drawImage(img, 0, 0);
  }

  function normalizeAlpha(imageData){
    if(alphaMode.value !== 'remove') return imageData;
    // set A channel to 255 to reduce alpha-based artifacts
    for(let i=3; i<imageData.data.length; i+=4){ imageData.data[i] = 255; }
    return imageData;
  }

  fileInput.addEventListener('change', async (e)=>{
    encryptLog.textContent='';
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const img = await readImage(f);
      drawImageToCanvas(img);
      const id = ctx.getImageData(0,0,workCanvas.width,workCanvas.height);
      const cap = Math.floor((id.data.length/4)*3/8); // in bytes
      imgMeta.textContent = `أبعاد: ${img.naturalWidth}×${img.naturalHeight} — السعة التقريبية: ${cap.toLocaleString()} بايت.`;
    }catch(err){
      logLine(encryptLog, 'خطأ: '+err.message, 'err');
    }
  });

  fileDecode.addEventListener('change', async (e)=>{
    decryptLog.textContent='';
    const f = e.target.files?.[0];
    if(!f) return;
    try{
      const img = await readImage(f);
      drawImageToCanvas(img);
      const cap = Math.floor((workCanvas.width*workCanvas.height*3)/8);
      imgMetaDecode.textContent = `أبعاد: ${workCanvas.width}×${workCanvas.height} — سعة نظرية: ${cap.toLocaleString()} بايت.`;
    }catch(err){
      logLine(decryptLog, 'خطأ: '+err.message, 'err');
    }
  });

  btnEncrypt.addEventListener('click', async ()=>{
    encryptLog.textContent='';
    btnEncrypt.disabled = true;
    try{
      if(workCanvas.width===0 || workCanvas.height===0){ throw new Error('رجاءً اختر صورة أولاً.'); }
      const msg = secretText.value;
      if(!msg || msg.trim().length===0){ throw new Error('نص الرسالة فارغ.'); }
      const pw = password.value;
      if(!pw || pw.length<8){ throw new Error('رجاءً استخدم كلمة مرور بطول 12+ مفضّل.'); }
      const iters = Math.max(100000, parseInt(iterationsEl.value||'310000',10));

      const id = ctx.getImageData(0,0,workCanvas.width,workCanvas.height);
      normalizeAlpha(id);

      // AAD includes image dimensions to bind ciphertext to this carrier
      const aad = new Uint8Array(8);
      new DataView(aad.buffer).setUint32(0, workCanvas.width, true);
      new DataView(aad.buffer).setUint32(4, workCanvas.height, true);

      // Encrypt
      logLine(encryptLog, '🔐 تشفير البيانات...');
      const pt = enc.encode(msg);
      const payload = await encryptBytesAESGCM(pt, pw, aad, iters);

      // Optionally check capacity before embedding
      const capBytes = Math.floor((id.data.length/4)*3/8);
      if(autoCapacity.value === 'on' && payload.length > capBytes){
        throw new Error(`البيانات الناتجة (${payload.length.toLocaleString()} بايت) تتجاوز السعة (${capBytes.toLocaleString()} بايت). جرّب صورة أكبر أو نص أقصر.`);
      }

      // Encode to image LSB
      logLine(encryptLog, `🧩 إخفاء الحزمة داخل البكسلات (${payload.length.toLocaleString()} بايت)...`);
      encodeLSB(id, payload);
      ctx.putImageData(id, 0, 0);

      // Export
      const mime = exportFormat.value || 'image/png';
      const url = workCanvas.toDataURL(mime);
      previewEncoded.src = url;
      btnDownload.disabled = false;
      btnDownload.onclick = ()=>{
        // Convert dataURL to blob for download
        fetch(url).then(r=>r.blob()).then(blob=>{
          const ext = mime==='image/png' ? 'png' : 'jpg';
          const name = `VIP-Stego-encoded.${ext}`;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = name; a.click();
          setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
        });
      };

      logLine(encryptLog, '✅ تم التشفير بنجاح! تم إخفاء البيانات داخل الصورة.', 'ok');
    }catch(err){
      logLine(encryptLog, '⚠️ '+err.message, 'err');
    }finally{
      btnEncrypt.disabled = false;
    }
  });

  btnDecrypt.addEventListener('click', async ()=>{
    decryptLog.textContent='';
    btnDecrypt.disabled = true;
    try{
      if(workCanvas.width===0 || workCanvas.height===0){ throw new Error('رجاءً اختر صورة تحتوي على بيانات مخفية.'); }
      const pw = passwordDecode.value;
      if(!pw){ throw new Error('أدخل كلمة المرور.'); }

      const id = ctx.getImageData(0,0,workCanvas.width,workCanvas.height);

      // First, decode header portion to learn lengths:
      // Header is 19 bytes; decode exactly 19 bytes from LSB
      logLine(decryptLog, '📥 قراءة رأس الحزمة...');
      const headerBytes = decodeFirstNBytes(id, 19);
      // Now parse to get total length needed
      const MAGIC = headerBytes.slice(0,4);
      if(!(MAGIC[0]==0x53 && MAGIC[1]==0x54 && MAGIC[2]==0x45 && MAGIC[3]==0x47)){
        throw new Error('هذه الصورة لا تحتوي على حزمة VIP Stego صالحة.');
      }
      const saltLen = headerBytes[7];
      const ivLen = headerBytes[8];
      const aadLen = bytes_to_u16_le(headerBytes, 13);
      const ctLen = bytes_to_u32_le(headerBytes, 15);
      const totalLen = 19 + saltLen + ivLen + aadLen + ctLen;

      logLine(decryptLog, `🧮 حجم البيانات المتوقّع: ${totalLen.toLocaleString()} بايت`);
      const allBytes = decodeLSB(id, totalLen);

      // AAD must match the carrier's dimensions
      const aad = new Uint8Array(8);
      new DataView(aad.buffer).setUint32(0, workCanvas.width, true);
      new DataView(aad.buffer).setUint32(4, workCanvas.height, true);

      const pt = await decryptBytesAESGCM(allBytes, pw);
      const text = dec.decode(pt);
      outputText.value = text;
      btnCopy.disabled = false;
      btnCopy.onclick = ()=>{
        outputText.select();
        document.execCommand('copy');
      };
      logLine(decryptLog, '✅ تم فك التشفير بنجاح!', 'ok');
    }catch(err){
      logLine(decryptLog, '⚠️ '+err.message, 'err');
    }finally{
      btnDecrypt.disabled = false;
    }
  });
})();
