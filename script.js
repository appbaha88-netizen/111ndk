// مصفوفة لتخزين الخدمات مع إضافة خدمات افتراضية وصور
let servicesData = [
    { name: 'تصميم شعار', price: '25000', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'برمجة موقع', price: '150000', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' }
];

// دالة التحقق من رمز الدخول (1001)
function checkLogin() {
    const pass = document.getElementById('login-pass').value;
    if (pass === '1001') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'block';
        // حفظ حالة الدخول لكي لا يطلب الرمز عند تحديث الصفحة
        localStorage.setItem('isLoggedIn', 'true');
    } else {
        Swal.fire({
            text: 'رمز الدخول غير صحيح!',
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// دالة التنقل بين التبويبات
function switchTab(tabId, clickedButton) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => {
        btn.classList.remove('active');
    });

    const activeTab = document.getElementById(tabId);
    if(activeTab) {
        activeTab.classList.add('active');
        
        const animatedElements = activeTab.querySelectorAll('.animate__animated');
        animatedElements.forEach(el => {
            el.classList.remove('animate__fadeInUp', 'animate__fadeInDown', 'animate__fadeIn');
            void el.offsetWidth; 
            
            if(el.classList.contains('section-title') || el.classList.contains('reports-header')) {
                el.classList.add('animate__fadeInDown');
            } else if (el.classList.contains('sub-nav')) {
                el.classList.add('animate__fadeIn');
            } else {
                el.classList.add('animate__fadeInUp');
            }
        });
    }

    if(clickedButton) {
        clickedButton.classList.add('active');
    }
}

// دالة إضافة خدمة جديدة
function addService() {
    const name = document.getElementById('service-name').value;
    const price = document.getElementById('service-price').value;
    const imgInput = document.getElementById('service-image');
    
    let imgSrc = 'https://via.placeholder.com/150?text=بدون+صورة'; 
    
    if(imgInput.files && imgInput.files[0]) {
        imgSrc = URL.createObjectURL(imgInput.files[0]);
    }

    if(name && price) {
        const newService = { name, price, img: imgSrc };
        servicesData.push(newService);
        
        document.getElementById('service-name').value = '';
        document.getElementById('service-price').value = '';
        document.getElementById('service-image').value = '';

        renderServices();
        showNotification('تم إضافة الخدمة بنجاح!');
    } else {
        Swal.fire({
            text: 'يرجى إدخال عنوان الخدمة والسعر',
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// دالة رسم وتحديث البطاقات مع فصل عرض زر الحذف لقسم الخدمات فقط
function renderServices() {
    const servicesList = document.getElementById('services-list');
    const sellGrid = document.getElementById('sell-services-grid');
    
    let htmlServices = '';
    let htmlSell = '';

    servicesData.forEach((srv, index) => {
        // بطاقة قسم الخدمات (تحتوي على زر حذف)
        htmlServices += `
            <div class="service-card">
                <button class="delete-service-btn" onclick="deleteService(${index}, event)"><i class="fa-solid fa-times"></i></button>
                <img src="${srv.img}" alt="${srv.name}">
                <h4>${srv.name}</h4>
                <p>${srv.price} د.ع</p>
            </div>
        `;
        
        // بطاقة قسم البيع (بدون زر حذف، وعند الضغط تنقلك للبيع)
        htmlSell += `
            <div class="service-card" onclick="selectServiceToSell(${index})">
                <img src="${srv.img}" alt="${srv.name}">
                <h4>${srv.name}</h4>
                <p>${srv.price} د.ع</p>
            </div>
        `;
    });

    if(servicesList) servicesList.innerHTML = htmlServices;
    if(sellGrid) sellGrid.innerHTML = htmlSell;
}

// دالة حذف الخدمة
function deleteService(index, event) {
    event.stopPropagation(); // لمنع تداخل الضغطات
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "سيتم حذف هذه الخدمة نهائياً",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'نعم، احذف',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            servicesData.splice(index, 1);
            renderServices(); // إعادة رسم البطاقات بعد الحذف
            showNotification('تم حذف الخدمة بنجاح!');
        }
    });
}

// دالة اختيار الخدمة للبيع
function selectServiceToSell(index) {
    const srv = servicesData[index];
    document.getElementById('sell-services-grid').style.display = 'none';
    document.getElementById('sell-form-container').style.display = 'block';
    
    document.getElementById('selected-service-title').innerText = `بيع: ${srv.name} (${srv.price} د.ع)`;
}

// دالة الرجوع من حقول البيع إلى شبكة الخدمات
function showSellGrid() {
    document.getElementById('sell-services-grid').style.display = 'grid';
    document.getElementById('sell-form-container').style.display = 'none';
}

// دوال تعديل الفاتورة
function editInvoice() {
    document.getElementById('invoice-list-container').style.display = 'none';
    document.getElementById('edit-invoice-container').style.display = 'block';
}

function cancelEditInvoice() {
    document.getElementById('invoice-list-container').style.display = 'block';
    document.getElementById('edit-invoice-container').style.display = 'none';
}

function saveInvoiceEdit() {
    showNotification('تم حفظ التعديلات بنجاح!');
    cancelEditInvoice(); // الرجوع لقائمة الفواتير بعد الحفظ
}

// دالة حذف الفاتورة
function deleteInvoice(btn) {
    Swal.fire({
        title: 'هل أنت متأكد؟',
        text: "لن تتمكن من استرجاع الفاتورة بعد الحذف!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'نعم، احذفها!',
        cancelButtonText: 'إلغاء'
    }).then((result) => {
        if (result.isConfirmed) {
            const card = btn.closest('.invoice-card');
            if (card) {
                card.style.display = 'none';
            }
            Swal.fire({
                title: 'تم الحذف!',
                text: 'تم حذف الفاتورة بنجاح.',
                icon: 'success',
                confirmButtonColor: '#6b46c1'
            });
        }
    });
}

// عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التحقق من حالة الدخول
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'block';
    }

    // عرض الخدمات الافتراضية فوراً
    renderServices();

    // تعيين التاريخ التلقائي
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    const dateInput = document.getElementById('auto-date');
    if(dateInput) dateInput.value = formattedDate;

    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');
    
    if(fromDate) fromDate.value = `${yyyy}-${mm}-01`;
    if(toDate) toDate.value = formattedDate;
});

// نظام التنبيهات
function showNotification(message) {
    Swal.fire({
        text: message,
        icon: 'success',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: '#fff',
        color: '#6b46c1',
        iconColor: '#22c55e'
    });
}

// دالة تصدير ملف الإكسل (CSV)
function exportExcel() {
    let csvContent = "\uFEFF"; 
    csvContent += "رقم الفاتورة,اسم الزبون,التاريخ,الحالة,المبلغ\n";
    csvContent += "1001,علي محمد,16 فبراير 2026,قيد العمل,0\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "تقارير_المبيعات.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('تم تحميل ملف الإكسل بنجاح!');
}

function backupData() {
    Swal.fire({
        title: 'نسخة احتياطية',
        text: 'تم تجهيز النسخة الاحتياطية بنجاح!',
        icon: 'success',
        confirmButtonText: 'حفظ الملف',
        confirmButtonColor: '#6b46c1'
    });
}

function restoreData() {
    Swal.fire({
        title: 'استعادة البيانات',
        text: 'الرجاء اختيار ملف النسخة الاحتياطية.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'اختر ملف',
        cancelButtonText: 'إلغاء',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444'
    });
}
