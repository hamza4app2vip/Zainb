// معالج تفاصيل الصورة وفك التشفير
document.addEventListener('DOMContentLoaded', function() {
  const fileDecode = document.getElementById('fileDecode');
  const uploadAreaDecode = document.getElementById('uploadAreaDecode');
  const imageDecryptDetails = document.getElementById('imageDecryptDetails');
  const previewDecoded = document.getElementById('previewDecoded');

  // معلومات الصورة
  const decryptImageName = document.getElementById('decryptImageName');
  const decryptImageSize = document.getElementById('decryptImageSize');
  const decryptImageDimensions = document.getElementById('decryptImageDimensions');
  const decryptImageType = document.getElementById('decryptImageType');
  const decryptImageEncoding = document.getElementById('decryptImageEncoding');
  const encryptionStatus = document.getElementById('encryptionStatus');
  const decryptImageStatus = document.getElementById('decryptImageStatus');

  // إظهار نافذة اختيار الملف عند النقر على منطقة التحميل
  uploadAreaDecode.addEventListener('click', () => {
    fileDecode.click();
  });

  // معالجة تغيير ملف الصورة
  fileDecode.addEventListener('change', handleImageUpload);

  // معالجة سحب وإفلات الصورة
  uploadAreaDecode.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadAreaDecode.classList.add('drag-over');
  });

  uploadAreaDecode.addEventListener('dragleave', () => {
    uploadAreaDecode.classList.remove('drag-over');
  });

  uploadAreaDecode.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadAreaDecode.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileDecode.files = files;
      handleImageUpload();
    }
  });

  function handleImageUpload() {
    const file = fileDecode.files[0];

    if (!file) return;

    // التحقق من أن الملف هو صورة
    if (!file.type.match('image.*')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // عرض معلومات الملف
    decryptImageName.textContent = file.name;
    decryptImageSize.textContent = formatFileSize(file.size);

    // قراءة الصورة للحصول على الأبعاد
    const reader = new FileReader();
    reader.onload = function(e) {
      previewDecoded.src = e.target.result;

      // الحصول على أبعاد الصورة
      const img = new Image();
      img.onload = function() {
        decryptImageDimensions.textContent = `${img.width} × ${img.height}`;

        // تحديد نوع الترميز
        let encoding = '';
        if (file.type === 'image/jpeg') encoding = 'JPEG';
        else if (file.type === 'image/png') encoding = 'PNG';
        else if (file.type === 'image/gif') encoding = 'GIF';
        else if (file.type === 'image/webp') encoding = 'WebP';
        else encoding = 'غير معروف';

        decryptImageEncoding.textContent = encoding;
        decryptImageType.textContent = file.type;

        // التحقق مما إذا كانت الصورة مشفرة أم لا
        checkIfImageIsEncrypted(img);

        // إظهار قسم معلومات الصورة
        imageDecryptDetails.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // التحقق مما إذا كانت الصورة مشفرة أم لا
  function checkIfImageIsEncrypted(img) {
    // عرض حالة التحقق
    decryptImageStatus.innerHTML = `
      <div class="status-indicator checking">
        <i class="fas fa-search"></i>
        <span>جاري التحقق من الصورة...</span>
      </div>
    `;

    // تأخير بسيط لجعل الرسالة واضحة
    setTimeout(() => {
      // إنشاء قماش مؤقت للتحقق من الصورة
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);
      
      // الحصول على بيانات البكسلات
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      // التحقق من وجود توقيع VIP Stego في البكسلات الأولى
      // هذا التوقيع موجود في البكسلات الأولى من الصورة المشفرة
      const signature = [0x53, 0x54, 0x45, 0x47]; // STEG في ASCII
      let foundSignature = false;
      
      // التحقق من أول 100 بكسل (أو أقل إذا كانت الصورة أصغر)
      const checkPixels = Math.min(100, tempCanvas.width * tempCanvas.height);
      const bytesToCheck = checkPixels * 4; // 4 بايت لكل بكسل (RGBA)
      
      for (let i = 0; i < bytesToCheck - 3; i += 4) {
        // التحقق من قناة R (الأحمر) للتوقيع
        if (data[i] === signature[0] && 
            data[i+1] === signature[1] && 
            data[i+2] === signature[2] && 
            data[i+3] === signature[3]) {
          foundSignature = true;
          break;
        }
      }
      
      if (foundSignature) {
        decryptImageStatus.innerHTML = `
          <div class="status-indicator encrypted">
            <i class="fas fa-check-circle"></i>
            <span>الصورة تحتوي على بيانات مخفية</span>
          </div>
        `;
        encryptionStatus.textContent = 'مشفرة';
        encryptionStatus.style.color = '#4caf50';
      } else {
        decryptImageStatus.innerHTML = `
          <div class="status-indicator not-encrypted">
            <i class="fas fa-times-circle"></i>
            <span>الصورة لا تحتوي على بيانات مخفية</span>
          </div>
        `;
        encryptionStatus.textContent = 'غير مشفرة';
        encryptionStatus.style.color = '#f44336';
      }
    }, 1500);
  }

  // حساب حجم الملف بشكل منسق
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' بايت';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' كيلوبايت';
    else return Math.round(bytes / 1048576 * 10) / 10 + ' ميجابايت';
  }
});
