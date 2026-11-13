const API = "https://countries.dev";
const CAMPOS = "fields=name,capital,region,population,flags";

// Paso 5: Petición HTTP asíncrona con fetch
async function buscarPais(nombre) {
  const url = `${API}/name/${encodeURIComponent(nombre)}?${CAMPOS}`;
  const respuesta = await fetch(url);
  const json = await respuesta.json().catch(() => null);

  if (!respuesta.ok || (json && json.success === false)) {
    if (respuesta.status === 404) {
      throw new Error("No se encontró ningún país con ese nombre.");
    }
    const mensajeApi = json?.errors?.[0]?.message;
    throw new Error(mensajeApi || `Error del servidor (código ${respuesta.status}).`);
  }

  // Extrae el arreglo desde json.data (formato v5) o directo si viene como arreglo
  const paises = Array.isArray(json) ? json : json?.data;

  if (!paises || paises.length === 0) {
    throw new Error("No se encontró ningún país con ese nombre.");
  }

  return paises;
}

// Paso 6: Renderizar tarjetas en el DOM
function mostrarPaises(paises) {
  const contenedor = document.getElementById("resultados");
  contenedor.innerHTML = "";

  paises.forEach(pais => {
    const nombreComun = pais.name?.common || pais.name || "Sin nombre";
    const banderaUrl = pais.flags?.png || pais.flags?.svg || pais.flag || "";
    const capital = Array.isArray(pais.capital)
      ? (pais.capital[0] || "Sin capital")
      : (pais.capital || "Sin capital");
    const poblacion = typeof pais.population === "number"
      ? pais.population.toLocaleString("es-MX")
      : (pais.population || "No disponible");

    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";
    tarjeta.innerHTML = `
      <img src="${banderaUrl}" alt="Bandera de ${nombreComun}">
      <h3>${nombreComun}</h3>
      <p><b>Capital:</b> ${capital}</p>
      <p><b>Región:</b> ${pais.region || "Sin región"}</p>
      <p><b>Población:</b> ${poblacion}</p>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Paso 7: Conectar el formulario y manejar errores
const form = document.getElementById("formBuscar");
const mensaje = document.getElementById("mensaje");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nombre = document.getElementById("txtPais").value.trim();
  mensaje.textContent = "Cargando...";

  try {
    const paises = await buscarPais(nombre);
    mostrarPaises(paises);
    mensaje.textContent = `${paises.length} resultado(s)`;
  } catch (error) {
    document.getElementById("resultados").innerHTML = "";
    mensaje.textContent = error.message;
  }
});