import { db, collection, addDoc, getDocs } from "./firebase.js";

// مصفوفة الخدمات
let servicesData = [
{ name: 'تصميم شعار', price: '25000', img: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=150&q=80' },
{ name: 'برمجة موقع', price: '150000', img: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=150&q=80' }
];

let invoicesData = [];
let receiptsData = [];
let paymentsData = [];
let currentSelectedServiceIndex = null;


// تحميل البيانات من الجهاز
function loadAllDataFromStorage(){

const storedServices = localStorage.getItem('app_servicesData');
if(storedServices) servicesData = JSON.parse(storedServices);

const storedInvoices = localStorage.getItem('app_invoicesData');
if(storedInvoices) invoicesData = JSON.parse(storedInvoices);

const storedReceipts = localStorage.getItem('app_receiptsData');
if(storedReceipts) receiptsData = JSON.parse(storedReceipts);

const storedPayments = localStorage.getItem('app_paymentsData');
if(storedPayments) paymentsData = JSON.parse(storedPayments);

}


// حفظ البيانات في الجهاز
function saveAllDataToStorage(){

localStorage.setItem('app_servicesData',JSON.stringify(servicesData));
localStorage.setItem('app_invoicesData',JSON.stringify(invoicesData));
localStorage.setItem('app_receiptsData',JSON.stringify(receiptsData));
localStorage.setItem('app_paymentsData',JSON.stringify(paymentsData));

}


// تسجيل الدخول
window.checkLogin = function () {

const pass = document.getElementById('login-pass').value;

if(pass === '1001'){

document.getElementById('login-overlay').style.display='none';
document.getElementById('app-wrapper').style.display='block';

localStorage.setItem('isLoggedIn','true');

}else{

Swal.fire({
text:'رمز الدخول غير صحيح!',
icon:'error',
toast:true,
position:'top-end',
showConfirmButton:false,
timer:3000
});

}

}


// إضافة خدمة
function addService(){

const name = document.getElementById('service-name').value;
const price = document.getElementById('service-price').value;
const imgInput = document.getElementById('service-image');

let imgSrc = 'https://via.placeholder.com/150';

if(imgInput.files && imgInput.files[0]){
imgSrc = URL.createObjectURL(imgInput.files[0]);
}

if(name && price){

servicesData.push({name,price,img:imgSrc});

saveAllDataToStorage();

document.getElementById('service-name').value='';
document.getElementById('service-price').value='';
document.getElementById('service-image').value='';

renderServices();

showNotification('تم إضافة الخدمة بنجاح');

}else{

Swal.fire({
text:'يرجى إدخال اسم الخدمة والسعر',
icon:'error',
toast:true,
position:'top-end',
showConfirmButton:false,
timer:3000
});

}

}


// عرض الخدمات
function renderServices(){

const servicesList=document.getElementById('services-list');
const sellGrid=document.getElementById('sell-services-grid');

let html1='';
let html2='';

servicesData.forEach((srv,index)=>{

html1+=`
<div class="service-card">
<button class="delete-service-btn" onclick="deleteService(${index},event)">X</button>
<img src="${srv.img}">
<h4>${srv.name}</h4>
<p>${srv.price} د.ع</p>
</div>
`;

html2+=`
<div class="service-card" onclick="selectServiceToSell(${index})">
<img src="${srv.img}">
<h4>${srv.name}</h4>
<p>${srv.price} د.ع</p>
</div>
`;

});

if(servicesList) servicesList.innerHTML=html1;
if(sellGrid) sellGrid.innerHTML=html2;

}


// حذف خدمة
function deleteService(index,event){

event.stopPropagation();

servicesData.splice(index,1);

saveAllDataToStorage();

renderServices();

showNotification('تم حذف الخدمة');

}


// اختيار خدمة للبيع
function selectServiceToSell(index){

currentSelectedServiceIndex=index;

const srv=servicesData[index];

document.getElementById('sell-services-grid').style.display='none';
document.getElementById('sell-form-container').style.display='block';

document.getElementById('selected-service-title').innerText=
`بيع: ${srv.name} (${srv.price} د.ع)`;

}


// رجوع للبيع
function showSellGrid(){

document.getElementById('sell-services-grid').style.display='grid';
document.getElementById('sell-form-container').style.display='none';

currentSelectedServiceIndex=null;

}


// حفظ فاتورة
function saveInvoice(){

const customer=document.getElementById('sell-customer').value;
const qty=document.getElementById('sell-qty').value;
const date=document.getElementById('auto-date').value;

if(customer && qty && currentSelectedServiceIndex!==null){

const srv=servicesData[currentSelectedServiceIndex];

const total=parseInt(srv.price)*parseInt(qty);

const invoice={

id:1000+invoicesData.length+1,
customer,
serviceName:srv.name,
qty,
total,
date

};
addDoc(collection(db, "invoices"), {
    customer: customer,
    serviceName: srv.name,
    qty: qty,
    total: total,
    date: date
});
invoicesData.push(invoice);

saveAllDataToStorage();

document.getElementById('sell-customer').value='';
document.getElementById('sell-qty').value='';

showNotification('تم حفظ الفاتورة');

showSellGrid();

updateReports();

}else{

Swal.fire({
text:'يرجى إدخال اسم الزبون والكمية',
icon:'error',
toast:true,
position:'top-end',
showConfirmButton:false,
timer:3000
});

}

}


// إضافة سند قبض
function addReceipt(){

const amount=document.getElementById('receipt-amount').value;

if(amount){

receiptsData.push({
amount:parseInt(amount),
date:document.getElementById('auto-date').value
});

saveAllDataToStorage();

document.getElementById('receipt-amount').value='';

showNotification('تم إضافة سند قبض');

updateReports();

}

}


// إضافة سند صرف
function addPayment(){

const name=document.getElementById('payment-name').value;
const amount=document.getElementById('payment-amount').value;

if(name && amount){

paymentsData.push({
name,
amount:parseInt(amount),
date:document.getElementById('auto-date').value
});

saveAllDataToStorage();

document.getElementById('payment-name').value='';
document.getElementById('payment-amount').value='';

showNotification('تم إضافة سند صرف');

updateReports();

}

}


// التقارير
function updateReports(){

let totalSales=0;
invoicesData.forEach(inv=> totalSales+=inv.total);

let totalPayments=0;
paymentsData.forEach(p=> totalPayments+=p.amount);

let totalReceipts=0;
receiptsData.forEach(r=> totalReceipts+=r.amount);

let boxBalance=(totalSales+totalReceipts)-totalPayments;
let netProfit=totalSales-totalPayments;

if(document.getElementById('rep-box-balance'))
document.getElementById('rep-box-balance').innerText=boxBalance+' د.ع';

if(document.getElementById('rep-net-profit'))
document.getElementById('rep-net-profit').innerText=netProfit+' د.ع';

}


// تشغيل التطبيق
document.addEventListener('DOMContentLoaded',()=>{

if(localStorage.getItem('isLoggedIn')==='true'){

document.getElementById('login-overlay').style.display='none';
document.getElementById('app-wrapper').style.display='block';

}

loadAllDataFromStorage();

renderServices();

updateReports();

});


// إشعار
function showNotification(message){

Swal.fire({
text:message,
icon:'success',
toast:true,
position:'top-end',
showConfirmButton:false,
timer:3000
});

}
window.switchTab = switchTab;
window.switchReportTab = switchReportTab;
window.addService = addService;
window.deleteService = deleteService;
window.selectServiceToSell = selectServiceToSell;
window.showSellGrid = showSellGrid;
window.saveInvoice = saveInvoice;
window.addReceipt = addReceipt;
window.addPayment = addPayment;
window.exportExcel = exportExcel;
window.backupData = backupData;
window.restoreData = restoreData;
window.editInvoice = editInvoice;
window.cancelEditInvoice = cancelEditInvoice;
window.saveInvoiceEdit = saveInvoiceEdit;
window.deleteInvoice = deleteInvoice;
