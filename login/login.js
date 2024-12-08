import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js"
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc, collection, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-firestore.js";
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

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app); // Inicializar Firestore


async function updateAllScoresFromAPI() {
  try {
      // Obtener todos los registros de la API
      const response = await fetch('https://rentamecabanas.pythonanywhere.com/api/puntajes/');
      if (!response.ok) throw new Error('Error al obtener datos de la API');

      const apiData = await response.json();

      // Recorrer cada registro de la API
      for (const record of apiData) {
          const userId = record.jugador_id;

          // Obtener el documento del usuario correspondiente en Firestore
          const userDocRef = doc(firestore, 'users', userId);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
              console.warn(`El documento del usuario con id ${userId} no existe en Firestore.`);
              continue;
          }

          const firebaseData = userDoc.data();
          let updated = false;
          const fields = ['lvl_1_best_score', 'lvl_2_best_score', 'lvl_3_best_score'];

          fields.forEach(field => {
              if (record[field] > firebaseData[field]) {
                  firebaseData[field] = record[field];
                  updated = true;
              }
          });

          if (updated) {
              await updateDoc(userDocRef, firebaseData);
              console.log(`Puntajes actualizados para el usuario con id ${userId}`);
          } else {
              console.log(`No se necesita actualizar los puntajes para el usuario con id ${userId}`);
          }
      }

  } catch (error) {
      console.error('Error al actualizar los puntajes desde la API: ', error);
  }
}

// Verificar el estado de la sesión
onAuthStateChanged(auth, async (user) => {
    const currentPage = window.location.pathname;

    const menuContainer = document.getElementById("menu-container");
    const footmenuContainer = document.getElementById("footmenu-container");


    if (user) {
        // Si el usuario está autenticado
        console.log("Usuario autenticado:", user.email);

      // Verificar si la tabla existe antes de cargar los datos del usuario
      const tableExists = document.querySelector('.table tbody');
      if (tableExists) {
        // Actualizar todos los puntajes desde la API
        await updateAllScoresFromAPI();
        // Cargar datos del usuario
        const userStats = await loadUserStats(user.uid);
        updateStatsTable(userStats);
      }

    // Verificar si los campos existen antes de cargar los datos del usuario
    const camposExists = document.getElementById('frmPerfil');
    if (camposExists) {
      const emailInput = document.getElementById('email');
      const displayNameInput = document.getElementById('displayName');
  
      // Mostrar el correo y el nombre del usuario
      emailInput.value = user.email;
      displayNameInput.value = user.displayName || '';
  
      // Manejar el evento de guardar cambios
      document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const newDisplayName = displayNameInput.value;
  
        if (newDisplayName && newDisplayName !== user.displayName) {
            try {
                // Actualizar el perfil del usuario en Firebase Authentication
                await updateProfile(user, {
                displayName: newDisplayName
                });
    
                // Actualizar el nombre de usuario en Firestore
                const userDocRef = doc(firestore, 'users', user.uid);
                await updateDoc(userDocRef, {
                displayName: newDisplayName
                });
    
                alert('Perfil actualizado correctamente.');
            } catch (error) {
                console.error('Error al actualizar el perfil: ', error);
                alert('Hubo un error al actualizar el perfil.');
            }
        } else {
            alert('No se realizaron cambios.');
        }
      });
    }
        menuContainer.innerHTML = `
            <li>
                <a href="#">Mi perfil</a>
                <ul class="dropdown">
                    <li><a href="./mis-puntajes.html">Mis Puntajes</a></li>
                    <li><a href="./mi-perfil.html">Mi información</a></li>
                    <li><a href="#">Dar mi opinión</a></li>
                    <li id="logout"><a href="#">Cerrar Sesión</a></li>
                </ul>
            </li>
        `;
        footmenuContainer.innerHTML = `
            <li><a href="./mis-puntajes.html">Mis Puntajes</a></li>
            <li><a href="./mi-perfil.html">Mi información</a></li>
            <li><a href="#">Dar mi opinion</a></li>
        `;
        // Manejo del cierre de sesión
        const logout = document.getElementById('logout');
        if (logout) {
            logout.addEventListener("click", () => {
                signOut(auth)
                    .then(() => {
                        alert("Sesión cerrada exitosamente.");
                        window.location.href = "index.html"; // Redirigir al login
                    })
                    .catch((error) => {
                        alert(`Error al cerrar sesión: ${error.message}`);
                    });
            });
        }
    } else {
        // Si el usuario no está autenticado
        console.log("No hay sesión activa.");

        menuContainer.innerHTML = `
            <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
                Login
            </button>
        `;

        // Bloquear acceso a páginas restringidas (excepto las siguientes)
        const publicPages = [
            "index.html",
            "historia.html",
            "personajes.html",
            "arte.html",
            "informacion.html",
            "niveles.html",
            "contact.html",
            "mejores-puntajes.html",
            //"mis-puntajes.html",
            //"mi-perfil.html"
        ]; // Aquí las páginas públicas
        
        const isPublicPage = publicPages.some((page) => currentPage.includes(page));

        if (!isPublicPage) {
            alert("Debes iniciar sesión para acceder a esta página.");
            window.location.href = "index.html"; // Redirigir al inicio
        }
    }
});

// Obtener el botón de submit
const btnExists = document.getElementById('submit');

if (btnExists) {
    const submit = document.getElementById('submit');

    // Agregar el evento de clic al botón
    submit.addEventListener("click", function (event) {
        event.preventDefault();

        // Obtener valores de los inputs
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Autenticar usuario con Firebase
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Usuario autenticado correctamente
                const user = userCredential.user;
                alert("Logging in...");
                window.location.href = "index.html"; // Redirigir al usuario
            })
            .catch((error) => {
                // Manejar errores
                const errorCode = error.code;
                const errorMessage = error.message;
                alert(`Error: ${errorMessage}`);
            });
    });
}


// Método para cargar los datos adicionales del usuario desde Firestore
async function loadUserStats(uid) {
    try {
      const userDocRef = doc(firestore, 'users', uid); // Crear una referencia al documento del usuario
      const userDoc = await getDoc(userDocRef); // Obtener el documento
  
      if (userDoc.exists()) {
        const userStats = userDoc.data(); // Obtener los datos del documento
        return userStats; // Devolver los datos del usuario
      } else {
        console.warn('El documento del usuario no existe en Firestore.');
        return null;
      }
    } catch (error) {
      console.error('Error al cargar los datos adicionales del usuario desde Firestore: ', error);
      return null;
    }
  }
  


function updateStatsTable(userStats) {
    // Verificar si la tabla existe en el DOM
    const tableExists = document.getElementById('mis-puntajes');
  
    if (tableExists && userStats) {
      document.getElementById('lvl_1_score').innerText = userStats.lvl_1_best_score || 'N/A';
      document.getElementById('lvl_1_time').innerText = userStats.lvl_1_best_time || 'N/A';
      document.getElementById('lvl_2_score').innerText = userStats.lvl_2_best_score || 'N/A';
      document.getElementById('lvl_2_time').innerText = userStats.lvl_2_best_time || 'N/A';
      document.getElementById('lvl_3_score').innerText = userStats.lvl_3_best_score || 'N/A';
      document.getElementById('lvl_3_time').innerText = userStats.lvl_3_best_time || 'N/A';
    }
  }
  
  async function getTopScores(level) {
    // Actualizar todos los puntajes desde la API
    await updateAllScoresFromAPI();
    
    try {
      const levelField = `lvl_${level}_best_score`;
      const q = query(
        collection(firestore, 'users'),
        orderBy(levelField, 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
  
      const topScores = [];
      querySnapshot.forEach((doc) => {
        topScores.push(doc.data());
      });
  
      return topScores;
    } catch (error) {
      console.error('Error al obtener los mejores puntajes desde Firestore: ', error);
      return [];
    }
  }
  

  function updateTopScoresTable(level, scores) {
    const tbody = document.querySelector('.table tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de actualizarla
  
    scores.forEach((score, index) => {
      const displayName = score.displayName || score.email; // Mostrar displayName o email
      const row = `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${displayName}</td> <!-- Mostrar el nombre del usuario -->
          <td>${score[`lvl_${level}_best_score`]}</td>
          <td>${score[`lvl_${level}_best_time`]}</td>
        </tr>
      `;
      tbody.innerHTML += row;
    });
  }
  

  // Obtener el botón de submit
const puntajeGlobal = document.getElementById('puntajeGlobal');

if (puntajeGlobal) {
    // Manejo del cambio de nivel
    const levelSelect = document.getElementById('level-select');
    if (levelSelect) {
        levelSelect.addEventListener('change', async (event) => {
        const level = event.target.value;
        const topScores = await getTopScores(level);
        updateTopScoresTable(level, topScores);
    });
  
    // Cargar los datos para el nivel 1 por defecto
    const topScores = await getTopScores(1);
    updateTopScoresTable(1, topScores);
    }
}
