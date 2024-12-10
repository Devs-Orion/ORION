import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import { getFirestore, collection, addDoc, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDNYWfJ3_Wc4oXy4bB7atwIT05nVBM217A",
    authDomain: "orion-bd.firebaseapp.com",
    databaseURL: "https://orion-bd-default-rtdb.firebaseio.com",
    projectId: "orion-bd",
    storageBucket: "orion-bd.firebasestorage.app",
    messagingSenderId: "422514877849",
    appId: "1:422514877849:web:779f2651108685b553df08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase inicializado:", app);
console.log("Firestore inicializado:", db);


// Habilitar persistencia offline
enableIndexedDbPersistence(db).catch((err) => {
    console.error("Error estableciendo persistencia offline:", err);
});


// Referencia a la colección
const messagesRef = collection(db, "messages");

// Manejo del formulario
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contactForm");
    const status = document.getElementById("status");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // Evita la recarga de la página

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const message = document.getElementById("message").value.trim();

        if (!name || !email || !message) {
            // Muestra el alert de error si faltan datos
            const alertDanger = document.getElementById("alert-danger");
            alertDanger.textContent = "Por favor, completa todos los campos.";
            alertDanger.classList.remove("d-none");
            return;
        }

        try {
            // Enviar los datos a Firestore
            await addDoc(messagesRef, { name, email, message, timestamp: new Date() });

            // Muestra el alert de éxito
            const alertSuccess = document.getElementById("alert-success");
            alertSuccess.classList.remove("d-none");

            // Oculta el alert de error, si estaba visible
            document.getElementById("alert-danger").classList.add("d-none");

            // Limpia el formulario
            form.reset();
        } catch (error) {
            console.error("Error al enviar el mensaje:", error);

            // Muestra el alert de error
            const alertDanger = document.getElementById("alert-danger");
            alertDanger.textContent = "Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.";
            alertDanger.classList.remove("d-none");

            // Oculta el alert de éxito, si estaba visible
            document.getElementById("alert-success").classList.add("d-none");
        }
    });

});
