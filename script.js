// script.js
import { db, auth, collection, getDocs, doc, setDoc, signInWithPhoneNumber, RecaptchaVerifier, signInWithRedirect, getRedirectResult, GoogleAuthProvider, onAuthStateChanged } from './firebase.js';

let servicesData = [
    { name: 'تصميم شعار', price: '25000', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' },
    { name: 'برمجة موقع', price: '150000', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80' }
];

let invoicesData = [];
let receiptsData = [];
let paymentsData = [];
let currentSelectedServiceIndex = null;
let confirmationResult = null;

auth.languageCode = 'ar';

window.setupRecaptcha = function() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible'
        });
    }
};

window.loginWithGoogle = function() {
    const provider = new GoogleAuthProvider();
    localStorage.setItem('loginMethod', 'google');
    signInWithRedirect(auth, provider);
};

getRedirectResult(auth).catch((error) => {
    Swal.fire({text: 'فشل تسجيل الدخول: ' + error.message, icon: 'error', toast: true, position: 'top-end'});
});

window.sendPhoneCode = async function() {
    const phone = document.getElementById('phone-number').value;
    if (!phone) return;
    window.setupRecaptcha();
    const appVerifier = window.recaptchaVerifier;
    try {
        confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
        document.getElementById('verification-section').style.display = 'block';
        Swal.fire({text: 'تم إرسال الكود بنجاح', icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000});
    } catch (error) {
        Swal.fire({text: 'حدث خطأ: ' + error.message, icon: 'error', toast: true, position: 'top-end'});
    }
};

window.verifyPhoneCode = async function() {
    const code = document.getElementById('verification-code').value;
    if (!code) return;
    try {
        await confirmationResult.confirm(code);
        localStorage.setItem('loginMethod', 'phone');
        showApp();
    } catch (error) {
        Swal.fire({text: 'الكود غير صحيح', icon: 'error', toast: true, position: 'top-end'});
    }
};

function showApp() {
    document.getElementById('login-overlay').style.display = 'none';
    document.getElementById('app-wrapper').style.display = 'block';
    window.loadAllDataFromFirestore();
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        showApp();
    }
});

window.loadAllDataFromFirestore = async function() {
    try {
        const querySnapshot = await getDocs(collection(db, "appData"));
        querySnapshot.forEach((document) => {
            const data = document.data();
            if(document.id === "mainData") {
                if(data.servicesData) servicesData = data.servicesData;
                if(data.invoicesData) invoicesData = data.invoicesData;
                if(data.receiptsData) receiptsData = data.receiptsData;
                if(data.paymentsData) paymentsData = data.paymentsData;
            }
        });
        window.renderServices();
        window.updateReports();
    } catch(e) {
        console.error(e);
    }
};

window.saveAllDataToFirestore = async function() {
    try {
        await setDoc(doc(db, "appData", "mainData"), {
            servicesData, invoicesData, receiptsData, paymentsData
        });
    } catch(e) {
        console.error(e);
    }
};

function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                } else {
                    if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
}

window.switchTab = function(tabId, clickedButton) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(btn => btn.classList.remove('active'));

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
    if(clickedButton) clickedButton.classList.add('active');
};

window.switchReportTab = function(tabId, clickedSpan) {
    const spans = clickedSpan.parentElement.querySelectorAll('span');
    spans.forEach(s => s.classList.remove('active'));
    clickedSpan.classList.add('active');

    document.getElementById('report-overview').style.display = 'none';
    document.getElementById('report-materials').style.display = 'none';
    document.getElementById('report-matching').style.display = 'none';

    document.getElementById('report-' + tabId).style.display = 'block';
    window.updateReports(); 
};

window.addService = async function() {
    const name = document.getElementById('service-name').value;
    const price = document.getElementById('service-price').value;
    const imgInput = document.getElementById('service-image');
    
    let imgSrc = 'https://via.placeholder.com/150?text=بدون+صورة'; 
    
    if(imgInput.files && imgInput.files[0]) {
        imgSrc = await compressImage(imgInput.files[0]);
    }

    if(name && price) {
        const newService = { name, price, img: imgSrc };
        servicesData.push(newService);
        
        window.saveAllDataToFirestore();

        document.getElementById('service-name').value = '';
        document.getElementById('service-price').value = '';
        document.getElementById('service-image').value = '';

        window.renderServices();
        window.showNotification('تم إضافة الخدمة بنجاح!');
    } else {
        Swal.fire({ text: 'يرجى إدخال عنوان الخدمة والسعر', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
};

window.renderServices = function() {
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
};

window.deleteService = function(index, event) {
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
            window.saveAllDataToFirestore();
            window.renderServices();
            window.showNotification('تم حذف الخدمة بنجاح!');
        }
    });
};

window.selectServiceToSell = function(index) {
    currentSelectedServiceIndex = index;
    const srv = servicesData[index];
    document.getElementById('sell-services-grid').style.display = 'none';
    document.getElementById('sell-form-container').style.display = 'block';
    document.getElementById('selected-service-title').innerText = `بيع: ${srv.name} (${srv.price} د.ع)`;
};

window.showSellGrid = function() {
    document.getElementById('sell-services-grid').style.display = 'grid';
    document.getElementById('sell-form-container').style.display = 'none';
    currentSelectedServiceIndex = null;
};

window.saveInvoice = function() {
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

        window.saveAllDataToFirestore();

        document.getElementById('sell-customer').value = '';
        document.getElementById('sell-qty').value = '';

        window.showNotification('تم حفظ الفاتورة بنجاح!');
        window.showSellGrid();
        window.updateReports(); 
    } else {
        Swal.fire({ text: 'يرجى إدخال اسم الزبون والعدد', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
    }
};

window.addReceipt = function() {
    const amount = document.getElementById('receipt-amount').value;
    if(amount) {
        receiptsData.push({ amount: parseInt(amount), date: document.getElementById('auto-date').value });
        window.saveAllDataToFirestore();
        document.getElementById('receipt-amount').value = '';
        window.showNotification('تم إضافة سند القبض!');
        window.updateReports(); 
    } else {
        Swal.fire({ text: 'يرجى إدخال المبلغ', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
};

window.addPayment = function() {
    const name = document.getElementById('payment-name').value;
    const amount = document.getElementById('payment-amount').value;
    if(name && amount) {
        paymentsData.push({ name: name, amount: parseInt(amount), date: document.getElementById('auto-date').value });
        window.saveAllDataToFirestore();
        document.getElementById('payment-name').value = '';
        document.getElementById('payment-amount').value = '';
        window.showNotification('تم إضافة سند الصرف!');
        window.updateReports(); 
    } else {
        Swal.fire({ text: 'يرجى إدخال الاسم والمبلغ', icon: 'error', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 });
    }
};

window.updateReports = function() {
    let totalSales = 0; invoicesData.forEach(inv => totalSales += inv.total);
    let totalReceipts = 0; receiptsData.forEach(rec => totalReceipts += rec.amount);
    let totalPayments = 0; paymentsData.forEach(pay => totalPayments += pay.amount);

    let boxBalance = (totalSales + totalReceipts) - totalPayments;
    let netProfit = totalSales - totalPayments;

    if(document.getElementById('rep-box-top')) document.getElementById('rep-box-top').innerText = boxBalance.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-profit-top')) document.getElementById('rep-profit-top').innerText = netProfit.toLocaleString() + ' د.ع';
    
    if(document.getElementById('rep-box-balance')) document.getElementById('rep-box-balance').innerText = boxBalance.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-net-profit')) document.getElementById('rep-net-profit').innerText = netProfit.toLocaleString() + ' د.ع';
    
    if(document.getElementById('rep-invoice-count')) document.getElementById('rep-invoice-count').innerText = invoicesData.length;
    if(document.getElementById('rep-total-sales')) document.getElementById('rep-total-sales').innerText = totalSales.toLocaleString() + ' د.ع';
    if(document.getElementById('rep-paid')) document.getElementById('rep-paid').innerText = totalSales.toLocaleString() + ' د.ع';

    let materialsHtml = '';
    servicesData.forEach(srv => {
        let srvQty = 0; let srvTotal = 0;
        invoicesData.forEach(inv => {
            if(inv.serviceName === srv.name) { srvQty += parseInt(inv.qty); srvTotal += inv.total; }
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

    let matchingHtml = '';
    invoicesData.forEach(inv => { matchingHtml += `<div class="summary-row"><span>فاتورة: ${inv.customer} (${inv.serviceName})</span><span class="green-text">+${inv.total.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; });
    receiptsData.forEach(rec => { matchingHtml += `<div class="summary-row"><span>سند قبض</span><span class="green-text">+${rec.amount.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; });
    paymentsData.forEach(pay => { matchingHtml += `<div class="summary-row"><span>سند صرف: ${pay.name}</span><span class="orange-text">-${pay.amount.toLocaleString()} د.ع</span></div><hr style="margin:5px 0;">`; });

    const matchContainer = document.getElementById('matching-report-list');
    if(matchContainer) matchContainer.innerHTML = matchingHtml || '<p style="text-align:center; color:var(--text-gray);">لا توجد حركات مسجلة</p>';
};

window.editInvoice = function() {
    document.getElementById('invoice-list-container').style.display = 'none';
    document.getElementById('edit-invoice-container').style.display = 'block';
};

window.cancelEditInvoice = function() {
    document.getElementById('invoice-list-container').style.display = 'block';
    document.getElementById('edit-invoice-container').style.display = 'none';
};

window.saveInvoiceEdit = function() {
    window.showNotification('تم حفظ التعديلات بنجاح!');
    window.cancelEditInvoice();
};

window.deleteInvoice = function(btn) {
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
            if (card) { card.style.display = 'none'; }
            Swal.fire({ title: 'تم الحذف!', text: 'تم حذف الفاتورة بنجاح.', icon: 'success', confirmButtonColor: '#6b46c1' });
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {
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

window.showNotification = function(message) {
    Swal.fire({ text: message, icon: 'success', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true, background: '#fff', color: '#6b46c1', iconColor: '#22c55e' });
};

window.exportExcel = function() {
    let csvContent = "\uFEFF"; 
    csvContent += "رقم الفاتورة,اسم الزبون,التاريخ,المبلغ\n";
    
    invoicesData.forEach(inv => { csvContent += `${inv.id},${inv.customer},${inv.date},${inv.total}\n`; });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "تقارير_المبيعات.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.showNotification('تم تحميل ملف الإكسل بنجاح!');
};

window.backupData = function() {
    Swal.fire({ title: 'نسخة احتياطية', text: 'تم تجهيز النسخة الاحتياطية بنجاح!', icon: 'success', confirmButtonText: 'حفظ الملف', confirmButtonColor: '#6b46c1' });
};

window.restoreData = function() {
    Swal.fire({ title: 'استعادة البيانات', text: 'الرجاء اختيار ملف النسخة الاحتياطية.', icon: 'warning', showCancelButton: true, confirmButtonText: 'اختر ملف', cancelButtonText: 'إلغاء', confirmButtonColor: '#3b82f6', cancelButtonColor: '#ef4444' });
};
