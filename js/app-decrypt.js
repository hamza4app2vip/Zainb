/* Decrypt page logic */
(function(){
  const fileDecode = $('#fileDecode');
  const passwordDecode = $('#passwordDecode');
  const togglePassDecode = $('#togglePassDecode');
  const imgMetaDecode = $('#imgMetaDecode');
  const btnDecrypt = $('#btnDecrypt');
  const btnCopy = $('#btnCopy');
  const decryptLog = $('#decryptLog');
  const outputText = $('#outputText');
  const dzDecode = $('#dz-decode');

  const workCanvas = $('#workCanvas');
  const ctx = workCanvas.getContext('2d', {willReadFrequently:true});

  togglePassDecode.addEventListener('click', async ()=>{
    // إضافة تأثير على الزر
    togglePassDecode.style.transition = 'transform 0.2s';
    togglePassDecode.style.transform = 'rotate(360deg)';
    
    // إعادة تعيين التحويل بعد انتهاء الرسوم المتحركة
    setTimeout(() => {
      togglePassDecode.style.transform = 'rotate(0deg)';
    }, 200);
    
    // التحقق من نوع الحقل الحالي
    const isPassword = passwordDecode.type === 'password';
    
    if (isPassword) {
      // عند إظهار كلمة المرور
      // إنشاء تأثير التشويش
      passwordDecode.style.transition = 'all 0.5s ease';
      passwordDecode.style.filter = 'blur(8px)';
      passwordDecode.style.transform = 'scale(0.95)';
      
      // الانتقال التدريجي
      setTimeout(() => {
        passwordDecode.style.filter = 'blur(4px)';
        passwordDecode.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
          passwordDecode.style.filter = 'blur(0px)';
          passwordDecode.style.transform = 'scale(1)';
          
          setTimeout(() => {
            passwordDecode.type = 'text';
            // التركيز على الحقل بعد إظهار كلمة المرور
            passwordDecode.focus();
            // تحديد كل النص لسهولة القراءة
            passwordDecode.select();
          }, 100);
        }, 150);
      }, 150);
    } else {
      // عند إخفاء كلمة المرور
      // إنشاء تأثير التشويش
      passwordDecode.style.transition = 'all 0.5s ease';
      passwordDecode.style.filter = 'blur(0px)';
      passwordDecode.style.transform = 'scale(1)';
      
      // الانتقال التدريجي
      setTimeout(() => {
        passwordDecode.style.filter = 'blur(4px)';
        passwordDecode.style.transform = 'scale(0.98)';
        
        setTimeout(() => {
          passwordDecode.style.filter = 'blur(8px)';
          passwordDecode.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            passwordDecode.type = 'password';
            passwordDecode.style.filter = '';
            passwordDecode.style.transform = '';
          }, 150);
        }, 150);
      }, 150);
    }
  });

  dzDecode.addEventListener('click', ()=> fileDecode.click());

  function readImage(file){
    return new Promise((resolve, reject)=>{
      const img = new Image();
      img.onload = ()=> resolve(img);
      img.onerror = ()=> reject(new Error('تعذر تحميل الصورة.'));
      img.src = URL.createObjectURL(file);
    });
  }
  function drawImage(img){
    workCanvas.width = img.naturalWidth;
    workCanvas.height = img.naturalHeight;
    ctx.clearRect(0,0,workCanvas.width,workCanvas.height);
    ctx.drawImage(img, 0, 0);
  }

  fileDecode.addEventListener('change', async (e)=>{
    decryptLog.textContent='';
    const f = e.target.files?.[0]; if(!f) return;
    try{
      const img = await readImage(f);
      drawImage(img);
      const cap = Math.floor((workCanvas.width*workCanvas.height*3)/8);
      imgMetaDecode.textContent = `أبعاد: ${workCanvas.width}×${workCanvas.height} — سعة نظرية: ${cap.toLocaleString()} بايت.`;

      // عرض الصورة في معاينة الأعلى
      const previewDecoded = $('#previewDecoded');
      const previewDecryptContainer = $('#previewDecryptContainer');
      previewDecoded.src = URL.createObjectURL(f);
      previewDecryptContainer.style.display = 'block';

      // إضافة تأثيرات على المعاينة
      previewDecryptContainer.style.transform = 'scale(0.95)';
      setTimeout(() => {
        previewDecryptContainer.style.transform = 'scale(1)';
      }, 300);
    }catch(err){
      logLine(decryptLog, 'خطأ: '+err.message, 'err');
    }
  });

  btnDecrypt.addEventListener('click', async ()=>{
    decryptLog.textContent='';
    btnDecrypt.disabled = true;

    // أنيميشن قفل ومفتاح أثناء فك التشفير
    const lockIcon = document.querySelector('.lock-icon');
    const lockBody = document.querySelector('.lock-body');
    const lockKey = document.querySelector('.lock-key');
    if (lockIcon && lockBody && lockKey) {
      lockBody.classList.remove('unlocked');
      lockBody.classList.add('locked');
      lockKey.classList.add('visible');

      // إظهار المفتاح وتحريكه للأسفل
      lockKey.classList.add('key-insert');

      // بعد اكتمال إدخال المفتاح، قلبه
      setTimeout(() => {
        lockKey.classList.remove('key-insert');
        lockKey.classList.add('key-turn');
      }, 1500);

      // بعد قلب المفتاح، فتح القفل
      setTimeout(() => {
        lockKey.classList.remove('key-turn');
        lockKey.classList.add('key-remove');
        lockBody.classList.remove('locked');
        lockBody.classList.add('unlocked');
        lockIcon.style.transform = 'scale(1.1)';
      }, 2700);

      // إخفاء المفتاح بعد الانتهاء
      setTimeout(() => {
        lockKey.classList.remove('key-remove', 'visible');
        lockIcon.style.transform = 'scale(1)';
      }, 3700);
    }

    try{
      if(workCanvas.width===0 || workCanvas.height===0) throw new Error('اختر صورة تحتوي على بيانات مخفية.');
      const pw = passwordDecode.value; if(!pw) throw new Error('أدخل كلمة المرور.');

      const id = ctx.getImageData(0,0,workCanvas.width,workCanvas.height);

      logLine(decryptLog, '📥 قراءة رأس الحزمة...');
      const header = decodeFirstNBytes(id, 19);
      if(!(header[0]==0x53 && header[1]==0x54 && header[2]==0x45 && header[3]==0x47)){
        throw new Error('هذه الصورة لا تحتوي على حزمة VIP Stego صالحة.');
      }
      const saltLen = header[7];
      const ivLen = header[8];
      const aadLen = bytes_to_u16_le(header, 13);
      const ctLen = bytes_to_u32_le(header, 15);
      const totalLen = 19 + saltLen + ivLen + aadLen + ctLen;

      logLine(decryptLog, `🧮 حجم البيانات المتوقّع: ${totalLen.toLocaleString()} بايت`);
      const allBytes = decodeLSB(id, totalLen);

      const aad = new Uint8Array(8);
      new DataView(aad.buffer).setUint32(0, workCanvas.width, true);
      new DataView(aad.buffer).setUint32(4, workCanvas.height, true);

      const pt = await decryptBytesAESGCM(allBytes, pw);
      const text = dec.decode(pt);
      outputText.value = text;
      btnCopy.disabled = false;
      btnCopy.onclick = ()=>{ outputText.select(); document.execCommand('copy'); };
      logLine(decryptLog, '✅ تم فك التشفير بنجاح!', 'ok');

      // أنيميشن قفل مفتوح بعد فك التشفير
      if (lockIcon && lockBody) {
        setTimeout(() => {
          lockBody.classList.remove('locked');
          lockBody.classList.add('unlocked');
          lockIcon.style.transform = 'scale(1.1)';
          setTimeout(() => {
            lockIcon.style.transform = 'scale(1)';
          }, 200);
        }, 500);
      }

      // إضافة تأثير فك التشفير الناجح
      const successEffect = document.createElement('div');
      successEffect.className = 'decryption-success';
      document.body.appendChild(successEffect);

      // إزالة التأثير بعد اكتمال الأنيمشن
      setTimeout(() => {
        document.body.removeChild(successEffect);
      }, 2000);
    }catch(err){
      logLine(decryptLog, '⚠️ '+err.message, 'err');

      // أنيميشن قفل جميل عند خطأ كلمة المرور
      if (lockIcon && lockBody) {
        // إضافة تأثير اهتزاز للقفل
        lockIcon.style.transition = 'transform 0.2s';
        lockIcon.style.transform = 'scale(0.85) rotate(-8deg)';
        setTimeout(() => {
          lockIcon.style.transform = 'scale(1.15) rotate(8deg)';
          setTimeout(() => {
            lockIcon.style.transform = 'scale(0.9) rotate(-5deg)';
            setTimeout(() => {
              lockIcon.style.transform = 'scale(1.05) rotate(5deg)';
              setTimeout(() => {
                lockIcon.style.transform = 'scale(1) rotate(0deg)';
              }, 100);
            }, 100);
          }, 100);
        }, 100);

        // إضافة تأثير احمرار للقفل
        lockBody.style.transition = 'box-shadow 0.5s';
        lockBody.style.boxShadow = '0 0 40px rgba(255, 85, 119, 0.8)';

        // إعادة القفل إلى حالته الأصلية بعد الانتهاء
        setTimeout(() => {
          lockBody.style.boxShadow = '';
        }, 600);
      }
    }finally{
      btnDecrypt.disabled = false;
    }
  });
})();
