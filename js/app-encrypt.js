/* Encrypt page logic - Fixed Version */
(function(){
  // تحديد جميع العناصر المطلوبة
  const fileInput = document.getElementById('imageInput');
  const secretText = document.getElementById('secretText');
  const password = document.getElementById('password');
  const togglePass = document.getElementById('togglePass');
  const passStrength = document.getElementById('passStrength');
  const bar = document.getElementById('bar');
  const encryptLog = document.getElementById('encryptLog');
  const previewEncoded = document.getElementById('previewEncoded');
  const btnEncrypt = document.getElementById('btnEncrypt');
  const workCanvas = document.getElementById('workCanvas');
  const previewOriginal = document.getElementById('previewOriginal');
  const previewOriginalContainer = document.getElementById('previewOriginalContainer');
  const iterationsEl = document.getElementById('iterations');
  const exportFormat = document.getElementById('exportFormat');
  const alphaMode = document.getElementById('alphaMode');
  const autoCapacity = document.getElementById('autoCapacity');

  // التأكد من وجود جميع العناصر المطلوبة
  if (!btnEncrypt) {
    console.error('زر التشفير غير موجود في الصفحة');
    return;
  }

  // الحصول على سياق canvas
  const ctx = workCanvas.getContext('2d', {willReadFrequently:true});

  // دالة لتقدير قوة كلمة المرور
  function estimatePasswordStrength(password) {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  }

  // دالة لعرض رسائل في منطقة السجل
  function logLog(element, message, type = 'info') {
    if (!element) return;
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;
    logEntry.textContent = `[${timestamp}] ${message}`;
    element.appendChild(logEntry);
    element.scrollTop = element.scrollHeight;
  }

  // إظهار وإخفاء كلمة المرور مع أنيميشنات محترفة
  togglePass.addEventListener('click', function() {
    const isPassword = password.type === 'password';
    
    // إضافة تأثير دوران للزر
    togglePass.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    togglePass.style.transform = 'rotate(360deg)';
    
    // تغيير أيقونة الزر
    setTimeout(() => {
      togglePass.textContent = isPassword ? '🙈' : '👁️';
    }, 200);
    
    // إعادة تعيين التحويل بعد انتهاء الرسوم المتحركة
    setTimeout(() => {
      togglePass.style.transform = 'rotate(0deg)';
    }, 400);
    
    // تأثيرات التشويش عند إخفاء كلمة المرور
    if (!isPassword) {
      // عند إخفاء كلمة المرور
      password.style.transition = 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
      
      // تأثير التلاشي الأول
      password.style.opacity = '0.7';
      password.style.filter = 'blur(1px)';
      password.style.transform = 'scale(0.98)';
      
      setTimeout(() => {
        // تأثير التشويش المتقدم
        password.style.filter = 'blur(4px)';
        password.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          // تأثير التلاشي النهائي قبل الإخفاء
          password.style.opacity = '0.3';
          password.style.filter = 'blur(8px)';
          password.style.transform = 'scale(0.92)';
          
          setTimeout(() => {
            // تغيير نوع الحقل إلى password
            password.type = 'password';
            
            // إعادة التأثيرات إلى حالتها الطبيعية
            setTimeout(() => {
              password.style.opacity = '1';
              password.style.filter = '';
              password.style.transform = 'scale(1)';
              password.style.transition = '';
            }, 300);
          }, 100);
        }, 200);
      }, 200);
    } else {
      // عند إظهار كلمة المرور
      password.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      // تأثير التلاشي الأول
      password.style.opacity = '0.3';
      password.style.filter = 'blur(8px)';
      password.style.transform = 'scale(0.92)';
      
      setTimeout(() => {
        // تأثير الوضوح المتقدم
        password.style.opacity = '0.7';
        password.style.filter = 'blur(4px)';
        password.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
          // تأثير الوضوح النهائي قبل الإظهار
          password.style.opacity = '1';
          password.style.filter = 'blur(1px)';
          password.style.transform = 'scale(0.98)';
          
          setTimeout(() => {
            // تغيير نوع الحقل إلى text
            password.type = 'text';
            
            // التركيز على الحقل بعد إظهار كلمة المرور
            password.focus();
            
            // تحديد كل النص لسهولة القراءة
            password.select();
            
            // إعادة التأثيرات إلى حالتها الطبيعية
            setTimeout(() => {
              password.style.opacity = '1';
              password.style.filter = '';
              password.style.transform = 'scale(1)';
              password.style.transition = '';
            }, 100);
          }, 100);
        }, 200);
      }, 200);
    }
  });

  // تحديث قوة كلمة المرور
  password.addEventListener('input', function() {
    const s = estimatePasswordStrength(password.value);
    const labels = ['ضعيفة جدًا', 'ضعيفة', 'متوسطة', 'جيّدة', 'قوية'];
    if (passStrength) passStrength.textContent = 'القوة: ' + labels[s];
    if (bar) bar.style.width = (s/4*100) + '%';
  });

  // قراءة الصورة المختارة
  function readImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('تعذر تحميل الصورة.'));
      img.src = URL.createObjectURL(file);
    });
  }

  // رسم الصورة على الـ canvas
  function drawImage(img) {
    workCanvas.width = img.naturalWidth;
    workCanvas.height = img.naturalHeight;
    ctx.clearRect(0, 0, workCanvas.width, workCanvas.height);
    ctx.drawImage(img, 0, 0);
  }

  // معالجة تغيير الصورة
  fileInput.addEventListener('change', async function(e) {
    if (!encryptLog) return;
    encryptLog.textContent = '';
    const f = e.target.files?.[0];
    if (!f) return;

    try {
      const img = await readImage(f);
      drawImage(img);
      const id = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);
      const cap = Math.floor((id.data.length/4)*3/8);

      // عرض معاينة الصورة الأصلية
      if (previewOriginal && previewOriginalContainer) {
        previewOriginal.src = URL.createObjectURL(f);
        previewOriginalContainer.style.display = 'block';
      }

      // إظهار معلومات الصورة
      logLog(encryptLog, `أبعاد: ${img.naturalWidth}×${img.naturalHeight} — السعة: ${cap.toLocaleString()} بايت.`);
    } catch (err) {
      logLog(encryptLog, 'خطأ: ' + err.message, 'err');
    }
  });

  // دالة التشفير الرئيسية
  btnEncrypt.addEventListener('click', async function() {
    if (!encryptLog) return;
    encryptLog.textContent = '';

    // تعطيل الزر مؤقتًا
    btnEncrypt.disabled = true;
    
    // إضافة تأثيرات بصرية عند بدء التشفير
    const encryptButton = btnEncrypt;
    encryptButton.style.transition = 'all 0.3s ease';
    encryptButton.style.boxShadow = '0 0 20px rgba(109, 94, 252, 0.6)';
    encryptButton.style.transform = 'scale(0.95)';
    
    // إزالة التأثيرات بعد فترة قصيرة
    setTimeout(() => {
      encryptButton.style.boxShadow = '';
      encryptButton.style.transform = '';
    }, 300);
    
    // أنيميشن القفل سيظهر بعد التشفير في قسم النجاح أو الفشل
    const lockIcon = document.querySelector('.lock-icon');
    const lockBody = document.querySelector('.lock-body');
    const lockShackle = document.querySelector('.lock-shackle');
    const lockKey = document.querySelector('.lock-key') || document.querySelector('.lock-keyhole');
    
    if (lockIcon && lockBody && lockShackle && lockKey) {
      // التحقق من أن القفل مفتوح في البداية
      if (!lockBody.classList.contains('unlocked')) {
        lockBody.classList.add('unlocked');
        lockShackle.classList.add('unlocked');
        lockBody.classList.remove('locked');
        lockShackle.classList.remove('locked');
      }
      
      // إظهار المفتاح وتحريكه للأسفل
      lockKey.classList.add('visible');
      lockKey.classList.add('key-insert');
      
      // بعد اكتمال إدخال المفتاح، قلبه
      setTimeout(() => {
        lockKey.classList.remove('key-insert');
        lockKey.classList.add('key-turn');
        
        // إضافة تأثيرات ضوئية أثناء دوران المفتاح
        lockKey.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
      }, 1500);
      
      // بعد قلب المفتاح، قفل القفل
      setTimeout(() => {
        lockKey.classList.remove('key-turn');
        lockKey.classList.add('key-remove');
        
        // تغيير شكل القفل إلى مغلق بشكل واضح
        lockBody.classList.remove('unlocked');
        lockBody.classList.add('locked');
        lockShackle.classList.remove('unlocked');
        lockShackle.classList.add('locked');
        
        // إضافة تأثير بصري عند إغلاق القفل
        lockBody.style.transition = 'all 0.5s ease';
        lockBody.style.boxShadow = '0 0 30px rgba(109, 94, 252, 0.8)';
        
        // إغلاق القفل بشكل حقيقي مع حركة سلسة
        setTimeout(() => {
          lockShackle.style.transform = 'translateX(-50%) rotate(0deg)';
          lockBody.style.boxShadow = '0 15px 30px rgba(0,0,0,0.25), inset 0 -3px 8px rgba(0,0,0,0.15), 0 0 30px rgba(109,94,252,0.4)';
        }, 100);
        
        // دوران القفل مع تأثيرات بصرية
        lockIcon.style.transform = 'scale(1.2) rotate(360deg)';
        lockBody.style.boxShadow = '0 0 40px rgba(109, 94, 252, 0.8)';
        
        // إخفاء التأثير الضوئي
        lockKey.style.boxShadow = '';
      }, 2700);
      
      // إخفاء المفتاح بعد الانتهاء مع تأثيرات متقدمة
      setTimeout(() => {
        // تأثير التلاشي للمفتاح
        lockKey.style.transition = 'opacity 0.5s, transform 0.5s';
        lockKey.style.opacity = '0';
        lockKey.style.transform = 'translateX(-50%) translateY(-50px) rotate(-90deg)';
        
        // إعادة القفل إلى حالته الطبيعية
        lockIcon.style.transition = 'transform 0.5s';
        lockIcon.style.transform = 'scale(1) rotate(0deg)';
        lockBody.style.transition = 'box-shadow 0.5s';
        lockBody.style.boxShadow = '';
        
        // إزالة الفلاتر بعد انتهاء الانتقال
        setTimeout(() => {
          lockKey.classList.remove('key-remove', 'visible');
          lockKey.style.transition = '';
          lockKey.style.opacity = '';
          lockKey.style.transform = '';
          lockIcon.style.transition = '';
          lockBody.style.transition = '';
        }, 500);
      }, 3700);
    }

    try {
      // التحقق من وجود صورة
      if (workCanvas.width === 0 || workCanvas.height === 0) {
        throw new Error('رجاءً اختر صورة أولًا.');
      }

      // التحقق من النص
      const text = secretText.value;
      if (!text || !text.trim()) {
        throw new Error('الرسالة فارغة.');
      }

      // التحقق من كلمة المرور
      const pw = password.value;
      if (!pw || pw.length < 8) {
        throw new Error('استخدم كلمة مرور أقوى (12+ محرف مفضّل).');
      }

      // الحصول على القيم من عناصر الواجهة
      const iters = Math.max(100000, parseInt(iterationsEl?.value || '310000', 10));

      // قراءة بيانات الصورة
      const id = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);

      // إنشاء بيانات إضافية (AAD) للاستخدام في التشفير
      const aad = new Uint8Array(8);
      new DataView(aad.buffer).setUint32(0, workCanvas.width, true);
      new DataView(aad.buffer).setUint32(4, workCanvas.height, true);

      logLog(encryptLog, '🔐 تشفير البيانات...');

      // تشفير النص
      const enc = new TextEncoder();
      const payload = await encryptBytesAESGCM(enc.encode(text), pw, aad, iters);

      // التحقق من سعة الصورة
      const capBytes = Math.floor((id.data.length/4)*3/8);
      if (autoCapacity?.value === 'on' && payload.length > capBytes) {
        throw new Error(`الحزمة (${payload.length}) بايت أكبر من السعة (${capBytes}). استخدم صورة أكبر أو رسالة أقصر.`);
      }

      logLog(encryptLog, '🧩 دمج البيانات داخل الصورة...');

      // دمج البيانات المشفرة في الصورة باستخدام LSB
      encodeLSB(id, payload);
      ctx.putImageData(id, 0, 0);

      // تحديد تنسيق التصدير
      const mime = exportFormat?.value || 'image/png';
      const url = workCanvas.toDataURL(mime);

      // عرض المعاينة
      if (previewEncoded) {
        previewEncoded.src = url;
      }

      // إنشاء رابط التحميل التلقائي
      fetch(url).then(r => r.blob()).then(blob => {
        const ext = mime === 'image/png' ? 'png' : 'jpg';
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `VIP-Stego-encoded.${ext}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
        }, 1000);
      });

      logLog(encryptLog, '✅ تم التشفير والإخفاء بنجاح!', 'ok');
      
        // رسوم متحكة متقدمة عند نجاح التشفير
      if (lockIcon && lockBody && lockShackle) {
        // التأكد من أن القفل مغلق بعد النجاح
        lockBody.classList.add('locked');
        lockShackle.classList.add('locked');
        lockBody.classList.remove('unlocked');
        lockShackle.classList.remove('unlocked');
        
        // إضافة تأثير نجاح
        const screen = document.querySelector('.screen');
        if (screen) {
          screen.classList.add('success');
          
          // تأثير نبض للقفل
          lockIcon.style.transition = 'transform 0.3s, box-shadow 0.3s';
          lockBody.style.transition = 'box-shadow 0.3s';
          
          lockIcon.style.transform = 'scale(1.1)';
          lockBody.style.boxShadow = '0 0 40px rgba(34, 211, 238, 0.8)';
          
          setTimeout(() => {
            lockIcon.style.transform = 'scale(1.05)';
            lockBody.style.boxShadow = '0 0 60px rgba(34, 211, 238, 1)';
            
            setTimeout(() => {
              lockIcon.style.transform = 'scale(1)';
              lockBody.style.boxShadow = '0 0 30px rgba(34, 211, 238, 0.6)';
              
              setTimeout(() => {
                lockBody.style.boxShadow = '';
              }, 300);
            }, 200);
          }, 200);
        }
        
        // إعادة القفل إلى حالته المغلقة
        setTimeout(() => {
          relock();
        }, 1000);
      }

    } catch (err) {
      logLog(encryptLog, '⚠️ ' + err.message, 'err');
      
      // رسوم متحكة متقدمة للقفل عند فشل التشفير
      if (lockIcon && lockBody && lockShackle && lockKey) {
        // التأكد من أن القفل يفتح في حالة الفشل
        lockBody.classList.remove('locked');
        lockBody.classList.add('unlocked');
        lockShackle.classList.remove('locked');
        lockShackle.classList.add('unlocked');
        
        // إضافة تأثير فشل
        const screen = document.querySelector('.screen');
        if (screen) {
          screen.classList.add('error');
          screen.classList.add('shake');
          
          // اهتزاز القفل بقوة
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
          
          // إضافة تأثير احمرار قوي للقفل
          lockBody.style.transition = 'box-shadow 0.5s';
          lockBody.style.boxShadow = '0 0 40px rgba(255, 85, 119, 0.8)';
          
          // إزالة تأثير الاهتزاز بعد فترة
          setTimeout(() => {
            screen.classList.remove('shake');
            lockBody.style.boxShadow = '';
          }, 600);
        }
      }
    } finally {
      // إعادة تفعيل الزر
      btnEncrypt.disabled = false;
    }
  });

  // دالة لإعادة القفل إلى حالته المغلقة
  function relock() {
    setLocked(true);
    const screen = document.querySelector('.screen');
    if (screen) {
      screen.classList.remove('success', 'error');
    }
    state.input = "";
    renderDots();
  }

  // دالة لضبط حالة القفل
  function setLocked(locked) {
    const lockIcon = document.querySelector('.lock-icon');
    const lockBody = document.querySelector('.lock-body');
    const lockShackle = document.querySelector('.lock-shackle');
    
    if (lockIcon && lockBody && lockShackle) {
      if (locked) {
        lockBody.classList.add('locked');
        lockShackle.classList.add('locked');
        lockBody.classList.remove('unlocked');
        lockShackle.classList.remove('unlocked');
      } else {
        lockBody.classList.remove('locked');
        lockShackle.classList.remove('locked');
        lockBody.classList.add('unlocked');
        lockShackle.classList.add('unlocked');
      }
    }
  }

  // دالة لعرض النقاط في شاشة القفل
  function renderDots() {
    const dotsContainer = document.querySelector('.dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      for (let i = 0; i < state.input.length; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot filled';
        dotsContainer.appendChild(dot);
      }
      for (let i = state.input.length; i < 8; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dotsContainer.appendChild(dot);
      }
    }
  }

  // تهيئة القفل
  setLocked(true);
  renderDots();
})();
