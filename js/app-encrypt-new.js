/* Encrypt page logic - Enhanced Animation Version */
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

  // دالة لتقدير قوة كلمة المرور
  function estimatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  }

  // دالة لإضافة رسائل السجل
  function logLog(container, message, type) {
    if (!container) return;
    const p = document.createElement('p');
    if (type === 'err') p.style.color = 'red';
    if (type === 'ok') p.style.color = 'green';
    p.textContent = message;
    container.appendChild(p);
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
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = new Image();
      img.onload = function() {
        try {
          const cap = estimateCapacity(img);
          iterationsEl.textContent = cap.toLocaleString();

          // إظهار الصورة الأصلية في المعاينة
          if (previewOriginal && previewOriginalContainer) {
            previewOriginal.src = URL.createObjectURL(f);
            previewOriginalContainer.style.display = 'block';
          }

          // إظهار معلومات الصورة
          logLog(encryptLog, `أبعاد: ${img.naturalWidth}×${img.naturalHeight} — السعة: ${cap.toLocaleString()} بايت.`);
        } catch (err) {
          logLog(encryptLog, 'خطأ: ' + err.message, 'err');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  fileInput.addEventListener('change', function(e) {
    const f = e.target.files[0];
    if (f) readImage(f);
  });

  // تقدير سعة التضمين
  function estimateCapacity(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      // حساب عدد وحدات البكسل التي يمكن تعديلها
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];

      // البكسلات ذات القيم المنخفضة أكثر أمانًا للتغيير
      if (r < 200 || g < 200 || b < 200) {
        count++;
      }
    }

    // تقدير السعة بناءً على عدد البكسلات القابلة للتغيير
    return Math.floor(count * 3 / 8);
  }

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

    try {
      // التحقق من وجود صورة
      if (!fileInput.files || !fileInput.files[0]) {
        throw new Error('الرجاء اختيار صورة أولاً');
      }

      // التحقق من وجود نص سري
      if (!secretText.value) {
        throw new Error('الرجاء إدخال نص سري');
      }

      // التحقق من كلمة المرور
      if (!password.value) {
        throw new Error('الرجاء إدخال كلمة مرور');
      }

      // قراءة الصورة
      const file = fileInput.files[0];
      const reader = new FileReader();

      reader.onload = async function(e) {
        const img = new Image();
        img.onload = async function() {
          try {
            // إنشاء قماش للعمل
            workCanvas.width = img.width;
            workCanvas.height = img.height;
            const ctx = workCanvas.getContext('2d');

            // رسم الصورة على القماش
            ctx.drawImage(img, 0, 0);

            // الحصول على بيانات البكسل
            const imageData = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);
            const pixels = imageData.data;

            // تحويل النص السري إلى ثنائي
            const binaryText = secretText.value.split('').map(char => 
              char.charCodeAt(0).toString(2).padStart(8, '0')
            ).join('');

            // إضافة حرف النهاية
            const binaryWithEnd = binaryText + '00000000';

            // التحقق من أن النص يتناسب مع الصورة
            if (binaryWithEnd.length > pixels.length / 4 * 3) {
              throw new Error('النص السري طويل جدًا لهذه الصورة');
            }

            // إخفاء النص في الصورة
            let bitIndex = 0;
            for (let i = 0; i < pixels.length && bitIndex < binaryWithEnd.length; i += 4) {
              // تعديل القيم الأقل أهمية (LSB) في كل قناة لونية
              for (let j = 0; j < 3 && bitIndex < binaryWithEnd.length; j++) {
                // الحصول على القيمة الحالية
                const value = pixels[i + j];

                // تحويل إلى ثنائي وإزالة البت الأقل أهمية
                const binary = value.toString(2).padStart(8, '0');
                const newBinary = binary.substring(0, 7) + binaryWithEnd[bitIndex];

                // تحويل مرة أخرى إلى عشري وتخزينها
                pixels[i + j] = parseInt(newBinary, 2);
                bitIndex++;
              }
            }

            // وضع بيانات البكسل المعدلة обратно على القماش
            ctx.putImageData(imageData, 0, 0);

            // تحويل القماش إلى بيانات URL
            const mimeType = exportFormat.value === 'png' ? 'image/png' : 'image/jpeg';
            const url = workCanvas.toDataURL(mimeType, alphaMode.checked ? 1.0 : 0.95);

            // عرض الصورة المشفرة في المعاينة
            previewEncoded.src = url;
            previewEncoded.style.display = 'block';

            // إنشاء رابط التحميل التلقائي
            fetch(url).then(r => r.blob()).then(blob => {
              const ext = mimeType === 'image/png' ? 'png' : 'jpg';
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
            
            // رسالة إضافية تعبر عن النجاح
            logLog(encryptLog, '🔒 تم تأمين البيانات بنجاح، يمكنك الآن مشاركة الصورة بأمان!', 'ok');

            // رسوم متحكة متقدمة عند نجاح التشفير
            const lockIcon = document.querySelector('.lock-icon');
            const lockBody = document.querySelector('.lock-body');
            const lockShackle = document.querySelector('.lock-shackle');
            const screen = document.querySelector('.screen');

            if (lockIcon && lockBody && lockShackle && screen) {
              // التأكد من أن القفل مغلق
              if (!lockBody.classList.contains('locked')) {
                lockBody.classList.add('locked');
                lockShackle.classList.add('locked');
                lockBody.classList.remove('unlocked');
                lockShackle.classList.remove('unlocked');
              }

              // إضافة تأثير نجاح للشاشة
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

              // إعادة القفل إلى حالته المغلقة
              setTimeout(() => {
                relock();
              }, 1000);
            }
          } catch (err) {
            logLog(encryptLog, '⚠️ ' + err.message, 'err');

            // رسوم متحكة متقدمة للقفل عند فشل التشفير
            const lockIcon = document.querySelector('.lock-icon');
            const lockBody = document.querySelector('.lock-body');
            const lockShackle = document.querySelector('.lock-shackle');
            const screen = document.querySelector('.screen');

            if (lockIcon && lockBody && lockShackle && screen) {
              // التأكد من أن القفل يفتح في حالة الفشل
              lockBody.classList.remove('locked');
              lockBody.classList.add('unlocked');
              lockShackle.classList.remove('locked');
              lockShackle.classList.add('unlocked');

              // إضافة تأثير فشل
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
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      logLog(encryptLog, '⚠️ ' + err.message, 'err');

      // رسوم متحكة متقدمة للقفل عند فشل التشفير
      const lockIcon = document.querySelector('.lock-icon');
      const lockBody = document.querySelector('.lock-body');
      const lockShackle = document.querySelector('.lock-shackle');
      const screen = document.querySelector('.screen');

      if (lockIcon && lockBody && lockShackle && screen) {
        // التأكد من أن القفل يفتح في حالة الفشل
        lockBody.classList.remove('locked');
        lockBody.classList.add('unlocked');
        lockShackle.classList.remove('locked');
        lockShackle.classList.add('unlocked');

        // إضافة تأثير فشل
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
    } finally {
      // إعادة تفعيل الزر
      btnEncrypt.disabled = false;
    }
  });
})();
