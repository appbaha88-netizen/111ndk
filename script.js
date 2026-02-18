// مصفوفة لتخزين الخدمات مع إضافة خدمات افتراضية وصور
let servicesData = [
    { name: 'تصميم شعار', price: '25000', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'برمجة موقع', price: '150000', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' }
];

// مصفوفات لتخزين الفواتير والسندات لربطها بالتقارير
let invoicesData = [];
let receiptsData = [];
let paymentsData = [];
let currentSelectedServiceIndex = null;

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

// دالة التنقل بين التبويبات الرئيسية
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

// دالة التنقل بين التبويبات الفرعية في التقارير
function switchReportTab(tabId, clickedSpan) {
    const spans = clickedSpan.parentElement.querySelectorAll('span');
    spans.forEach(s => s.classList.remove('active'));
    clickedSpan.classList.add('active');

    document.getElementById('report-overview').style.display = 'none';
    document.getElementById('report-materials').style.display = 'none';
    document.getElementById('report-matching').style.display = 'none';

    document.getElementById('report-' + tabId).style.display = 'block';
    
    updateReports(); // تحديث الأرقام والبيانات عند التبديل
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

// دالة رسم وتحديث البطاقات
function renderServices() {
    const servicesList = document.getElementById('services-list');
    const sellGrid = document.getElementById('sell-services-grid');
    
    let htmlServices = '';
    let htmlSell = '';

    servicesData.forEach((srv, index) => {
        htmlServices += `
            <div class="service-card">
                <button class="delete-service-btn" onclick="deleteService(${index}, event)"><i class="fa-solid fa-times"></i></button>
                <img src="${srv.img}" alt="${srv.name}">
                <h4>${srv.name}</h4>
                <p>${srv.price} د.ع</p>
            </div>
        `;
        
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
    event.stopPropagation();
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
            renderServices();
            showNotification('تم حذف الخدمة بنجاح!');
        }
    });
}

// دالة اختيار الخدمة للبيع
function selectServiceToSell(index) {
    currentSelectedServiceIndex = index;
    const srv = servicesData[index];
    document.getElementById('sell-services-grid').style.display = 'none';
    document.getElementById('sell-form-container').style.display = 'block';
    
    document.getElementById('selected-service-title').innerText = `بيع: ${srv.name} (${srv.price} د.ع)`;
}

// دالة الرجوع من حقول البيع إلى شبكة الخدمات
function showSellGrid() {
    document.getElementById('sell-services-grid').style.display = 'grid';
    document.getElementById('sell-form-container').style.display = 'none';
    currentSelectedServiceIndex = null;
}

// دالة حفظ الفاتورة (البيع) وربطها بالتقارير
function saveInvoice() {
    const customer = document.getElementById('sell-customer').value;
    const qty = document.getElementById('sell-qty').value;
    const date = document.getElementById('auto-date').value;

    if(customer && qty && currentSelectedServiceIndex !== null) {
        const srv = servicesData[currentSelectedServiceIndex];
        const total = parseInt(srv.price) * parseInt(qty);

        invoicesData.push({
            id: 1000 + invoicesData.length + 1,
            customer: customer,
            serviceName: srv.name,
            qty: qty,
            total: total,
            date: date
        });

        document.getElementById('sell-customer').value = '';
        document.getElementById('sell-qty').value = '';

        showNotification('تم حفظ الفاتورة بنجاح!');
        showSellGrid();
        updateReports(); // تحديث التقارير فوراً
    } else {
        Swal.fire({
            text: 'يرجى إدخال اسم الزبون والعدد',
            icon: 'error',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000
        });
    }
}

// دوال إضافة السندات وربطها بالتقارير
function addReceipt() {
    const amount = document.getElementById('receipt-amount').value;
    if(amount) {
        receiptsData.push({ 
            amount: parseInt(amount), 
            date: document.getElementById('auto-date').value 
        });
        document.getElementById('receipt-amount').value = '';
        showNotification('تم إضافة سند القبض!');
        updateReports(); // تحديث التقارير
    } else {
        Swal.fire({ text: 'يرجى إدخال المبلغ', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
}

function addPayment() {
    const name = document.getElementById('payment-name').value;
    const amount = document.getElementById('payment-amount').value;
    if(name && amount) {
        paymentsData.push({ 
            name: name, 
            amount: parseInt(amount), 
            date: document.getElementById('auto-date').value 
        });
        document.getElementById('payment-name').value = '';
        document.getElementById('payment-amount').value = '';
        showNotification('تم إضافة سند الصرف!');
        updateReports(); // تحديث التقارير
    } else {
        Swal.fire({ text: 'يرجى إدخال الاسم والمبلغ', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
}

// دالة حساب وتحديث كافة التقارير (رصيد الصندوق، الأرباح، المواد، المطابقة)
function updateReports() {
    let totalSales = 0;
    invoicesData.forEach(inv => totalSales += inv.total);

    let totalReceipts = 0;
    receiptsData.forEach(rec => totalReceipts += rec.amount);

    let totalPayments = 0;
    paymentsData.forEach(pay => totalPayments += pay.amount);

    // الحسابات: رصيد الصندوق = (مبيعات الفواتير + سندات القبض) - سندات الصرف
    // صافي الربح = المبيعات - المصروفات (سندات الصرف)
    let boxBalance = (totalSales + totalReceipts) - totalPayments;
    let netProfit = totalSales - totalPayments;

    // تحديث الواجهة (نظرة عامة)
    if(document.getElementById('rep-box-top')) document.getElementById('rep-box-top').innerText = boxBalance.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-profit-top')) document.getElementById('rep-profit-top').innerText = netProfit.toLocaleString() + ' د.ع';
    
    if(document.getElementById('rep-box-balance')) document.getElementById('rep-box-balance').innerText = boxBalance.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-net-profit')) document.getElementById('rep-net-profit').innerText = netProfit.toLocaleString() + ' د.ع';
    
    if(document.getElementById('rep-invoice-count')) document.getElementById('rep-invoice-count').innerText = invoicesData.length;
    if(document.getElementById('rep-total-sales')) document.getElementById('rep-total-sales').innerText = totalSales.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-paid')) document.getElementById('rep-paid').innerText = totalSales.toLocaleString() + ' د.ع';

    // تحديث الواجهة (المواد)
    let materialsHtml = '';
    servicesData.forEach(srv => {
        let srvQty = 0;
        let srvTotal = 0;
        invoicesData.forEach(inv => {
            if(inv.serviceName === srv.name) {
                srvQty += parseInt(inv.qty);
                srvTotal += inv.total;
            }
        });
        materialsHtml += `
            <div class="summary-section mb-15" style="background:#f9fafb; padding:10px; border-radius:10px;">
                <h4 style="color:var(--primary-purple); margin-bottom:10px;">${srv.name}</h4>
                <div class="summary-row" style="margin-bottom:5px;"><span>الكمية المباعة</span><span class="val">${srvQty}</span></div>
                <div class="summary-row" style="margin-bottom:0;"><span>إجمالي المبيعات</span><span class="val green-text">${srvTotal.toLocaleString()} د.ع</span></div>
            </div>
        `;
    });
    const matContainer = document.getElementById('materials-report-list');
    if(matContainer) matContainer.innerHTML = materialsHtml || '<p style="text-align:center;">لا توجد بيانات</p>';

    // تحديث الواجهة (المطابقة اليومية)
    let matchingHtml = '';
    invoicesData.forEach(inv => { 
        matchingHtml += `<div class="summary-row"><span>فاتورة: ${inv.customer} (${inv.serviceName})</span><span class="green-text">+${inv.total.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; 
    });
    receiptsData.forEach(rec => { 
        matchingHtml += `<div class="summary-row"><span>سند قبض</span><span class="green-text">+${rec.amount.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; 
    });
    paymentsData.forEach(pay => { 
        matchingHtml += `<div class="summary-row"><span>سند صرف: ${pay.name}</span><span class="orange-text">-${pay.amount.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; 
    });

    const matchContainer = document.getElementById('matching-report-list');
    if(matchContainer) matchContainer.innerHTML = matchingHtml || '<p style="text-align:center; color:var(--text-gray);">لا توجد حركات مسجلة</p>';
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
    cancelEditInvoice();
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
    if (localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('login-overlay').style.display = 'none';
        document.getElementById('app-wrapper').style.display = 'block';
    }

    renderServices();

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

    updateReports(); // تهيئة أرقام التقارير عند الفتح
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
    csvContent += "رقم الفاتورة,اسم الزبون,التاريخ,المبلغ\n";
    
    invoicesData.forEach(inv => {
        csvContent += `${inv.id},${inv.customer},${inv.date},${inv.total}\n`;
    });

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
