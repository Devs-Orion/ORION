const CACHE_NAME = 'mi-pwa-cache-v1';
const urlsToCache = [
    '/',                   // Página de inicio
    '/index.html',         // Archivo HTML principal
    '/historia.html',
    '/personajes.html',
    '/arte.html',
    '/informacion.html',
    '/niveles.html',
    '/contact.html',
    '/mejores-puntajes.html',
    '/mis-puntajes.html',
    '/mi-perfil.html',

    '/reg_srv.js',             // Archivo JavaScript para cargar el service worker

    // Archivos JavaScript
    'js/jquery-3.3.1.min.js',
    'js/bootstrap.min.js',
    'js/jquery.magnific-popup.min.js',
    'js/mixitup.min.js',
    'js/masonry.pkgd.min.js',
    'js/jquery.slicknav.js',
    'js/owl.carousel.min.js',
    'js/main.js',

    // Archivo de estilo
    'css/bootstrap.min.css',
    'css/font-awesome.min.css',
    'css/elegant-icons.css',
    'css/owl.carousel.min.css',
    'css/magnific-popup.css',
    'css/slicknav.min.css',
    'css/style.css',
    'css/tabla.css',

    // Fuentes
    'https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap',
    'https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@300;400;500;600;700&display=swap',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',

    //Imagenes
    'img/logo.png',
    'img/home/portada.png',
    'img/icons/clasificacion.png',
    'img/icons/frascos.png',
    'img/icons/info.png',
    'img/niveles/nivel 3.png',
    'ORION-512.png',
    'ORION-192.png',

    'img/niveles/background_espacial.webp',
    'img/niveles/nivel_1.webp',
    'img/niveles/nivel_2.jpg',
    'img/niveles/nivel_3.png',

    'img/team/steven.JPG',
    'img/team/diego.jpg',

    'img/breadcrumb-bg.jpg',
    'img/hero/hero-marte.jpg',
    'img/hero/hero-personajes.jpg',
    'img/hero/hero-IA.jpg',
    'img/home/astronauta_perfil.jpg',
    'img/home/astronauta.jpg',
    'img/historia/marte.jpg',
    'img/historia/viaje_espacial.jpg',
    'img/team-bg.jpg',
    'img/team/team-2.jpg',
    'img/team/team-3.jpg',
    'img/team/team-4.jpg',

    'img/home/espacio.jpeg',
    'img/home/despegue.jpeg',
    'img/home/astronautas.jpeg',




];

// Evento de instalación: ocurre la primera vez que el Service Worker se registra
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Abriendo caché')
                return cache.addAll(urlsToCache);
            })
            .catch(err => console.log('Falló registro de cache', err))
    );
});

// Evento de activación: se ejecuta después de que el SW se instala y toma el control de la aplicación
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    console.log('Service Worker activado');
});


// Intercepta las solicitudes de red y responde con los recursos en caché si están disponibles
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
            .catch(() => {
                return caches.match('/index.html');
            })
    );
});


