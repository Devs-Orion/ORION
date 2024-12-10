document.getElementById("downloadBtn").addEventListener("click", function () {
    // Verifica si el dispositivo es Android
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isAndroid) {
        // Inicia la descarga si es un dispositivo Android
        window.location.href = "https://drive.google.com/uc?export=download&id=1cXyLmw_aRsEGAtKSK5Py_Wc6blS6Rxn-";
    } else {
        event.preventDefault(); // Evita que el enlace se siga
        // Si no es Android, muestra el mensaje informando que no se puede descargar desde la computadora
        alert("Este archivo APK solo puede ser descargado desde un dispositivo Android.");
    }
});
