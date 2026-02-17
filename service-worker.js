const CACHE_NAME = 'app-cache-v1';
// قائمة الملفات التي سيتم تخزينها في الكاش (بما في ذلك المكتبات الخارجية لتعمل بدون إنترنت)
const urlsToCache = [
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    'https://cdn-icons-png.flaticon.com/512/3204/3204052.png'
];

// 3- تخزين كل الملفات في Cache عند أول تحميل (install)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// 7- حذف الكاش القديم عند تحديث النسخة (activate)
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 4- جلب الملفات من الكاش وإذا لم تكن موجودة جلبها من الإنترنت وتخزينها
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // إذا الملف موجود في الكاش يرجع من الكاش
                if (response) {
                    return response;
                }
                
                // إذا غير موجود يجلبه من الإنترنت
                const fetchRequest = event.request.clone();
                return fetch(fetchRequest).then(
                    response => {
                        if(!response || response.status !== 200 || response.type !== 'basic' && response.type !== 'cors') {
                            return response;
                        }
                        
                        // تخزينه في الكاش للمرات القادمة
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                            
                        return response;
                    }
                ).catch(() => {
                    // 8- إذا المستخدم Offline والملف غير موجود يرجع index.html كـ fallback
                    if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
                        return caches.match('index.html');
                    }
                });
            })
    );
});
