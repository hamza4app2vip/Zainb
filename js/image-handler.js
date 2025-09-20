// معالج تفاصيل الصورة
document.addEventListener('DOMContentLoaded', function() {
  const imageInput = document.getElementById('imageInput');
  const uploadArea = document.getElementById('uploadArea');
  const imageDetails = document.getElementById('imageDetails');
  const previewOriginal = document.getElementById('previewOriginal');

  // معلومات الصورة
  const imageName = document.getElementById('imageName');
  const imageSize = document.getElementById('imageSize');
  const imageDimensions = document.getElementById('imageDimensions');
  const imageType = document.getElementById('imageType');
  const imageEncoding = document.getElementById('imageEncoding');
  const imageCapacity = document.getElementById('imageCapacity');

  // إظهار نافذة اختيار الملف عند النقر على منطقة التحميل
  uploadArea.addEventListener('click', () => {
    imageInput.click();
  });

  // معالجة تغيير ملف الصورة
  imageInput.addEventListener('change', handleImageUpload);

  // معالجة سحب وإفلات الصورة
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      imageInput.files = files;
      handleImageUpload();
    }
  });

  function handleImageUpload() {
    const file = imageInput.files[0];

    if (!file) return;

    // التحقق من أن الملف هو صورة
    if (!file.type.match('image.*')) {
      alert('يرجى اختيار ملف صورة صالح');
      return;
    }

    // عرض معلومات الملف
    imageName.textContent = file.name;
    imageSize.textContent = formatFileSize(file.size);

    // قراءة الصورة للحصول على الأبعاد
    const reader = new FileReader();
    reader.onload = function(e) {
      previewOriginal.src = e.target.result;

      // الحصول على أبعاد الصورة
      const img = new Image();
      img.onload = function() {
        imageDimensions.textContent = `${img.width} × ${img.height}`;

        // تحديد نوع الترميز
        let encoding = '';
        if (file.type === 'image/jpeg') encoding = 'JPEG';
        else if (file.type === 'image/png') encoding = 'PNG';
        else if (file.type === 'image/gif') encoding = 'GIF';
        else if (file.type === 'image/webp') encoding = 'WebP';
        else encoding = 'غير معروف';

        imageEncoding.textContent = encoding;
        imageType.textContent = file.type;

        // حساب السعة التقريبية للتخزين
        const capacity = calculateImageCapacity(img.width, img.height);
        imageCapacity.textContent = `${capacity} حرف`;

        // إظهار قسم معلومات الصورة
        imageDetails.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // حساب حجم الملف بشكل منسق
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' بايت';
    else if (bytes < 1048576) return Math.round(bytes / 1024) + ' كيلوبايت';
    else return Math.round(bytes / 1048576 * 10) / 10 + ' ميجابايت';
  }

  // حساب السعة التقريبية للتخزين في الصورة
  function calculateImageCapacity(width, height) {
    // تقدير عدد البكسلات المتاحة للتخزين
    const totalPixels = width * height;

    // كل بكسل يمكنه تخزين 3-4 أحرف حسب نوع الصورة
    const capacityPerPixel = 3;

    // حساب السعة الإجمالية
    const totalCapacity = totalPixels * capacityPerPixel;

    // تحويل إلى كيلوبايت
    const capacityKB = Math.round(totalCapacity / 1024);

    if (capacityKB < 1024) {
      return capacityKB + ' كيلوبايت';
    } else {
      return Math.round(capacityKB / 1024 * 10) / 10 + ' ميجابايت';
    }
  }
});
