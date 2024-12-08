// URL de la API
const apiURL = 'https://orion-bd-default-rtdb.firebaseio.com/.json';

// Función para obtener datos de la API y renderizarlos
async function mostrarPersonajes() {
  const contenedor = document.getElementById('personajes-container');
  try {
    const respuesta = await fetch(apiURL);

    if (!respuesta.ok) {
      throw new Error(`Error: ${respuesta.status} ${respuesta.statusText}`);
    }

    const personajes = await respuesta.json();

    // Generar contenido dinámicamente
    let contenidoHTML = '';
    for (let i = 0; i < personajes.length; i++) {
      const personaje = personajes[i];
      contenidoHTML += `
        <div class="col-lg-4 col-md-6 col-sm-6 mix branding">
          <div class="portfolio__item">
            <div class="portfolio__item__video set-bg" style="background-image: url('${personaje.imagen}');">
            </div>
            <div class="portfolio__item__text">
              <h4>${personaje.nombre}</h4>
              <ul>
                <li>${personaje.descripcion}</li>
              </ul>
            </div>
          </div>
        </div>
      `;
    }

    // Agregar el contenido generado al contenedor
    contenedor.innerHTML = contenidoHTML;
  } catch (error) {
    contenedor.innerHTML = `<p>Error al cargar personajes: ${error.message}</p>`;
  }
}

// Llama a la función cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', mostrarPersonajes);
