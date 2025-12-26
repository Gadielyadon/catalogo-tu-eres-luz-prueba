let productos = [];
let categoriaActual = "Todas";

/* =========================
   GOOGLE SHEETS CONFIG
   ========================= */
const sheetID = "1cPigbYhDhnZ1yrgs4-BNPlR-8JIj3YoM";
const sheetName = "productos"; // CAMBIAR si tu hoja tiene otro nombre

const url = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

fetch(url)
  .then(res => res.text())
  .then(text => {
      const json = JSON.parse(text.substring(47).slice(0, -2));
      const cols = json.table.cols.map(c => c.label.toLowerCase());
      const rows = json.table.rows;

      productos = rows.slice(1).map(row => {
          let obj = {};
          row.c.forEach((cell, i) => {
              obj[cols[i]] = cell ? cell.v : "";
          });
          return obj;
      });

      cargarCategorias();
      mostrarProductos(productos);
  })
  .catch(err => console.error("Error cargando Google Sheets:", err));

/* =========================
   BUSCADOR
   ========================= */
const buscador = document.getElementById("buscador");
buscador.addEventListener("input", filtrar);

/* =========================
   CATEGORÍAS
   ========================= */
function cargarCategorias() {
    const categorias = ["Todas", ...new Set(productos.map(p => p.categoria))];
    const contenedor = document.getElementById("categorias");
    contenedor.innerHTML = "";

    categorias.forEach(cat => {
        const btn = document.createElement("button");
        btn.textContent = cat;
        if (cat === "Todas") btn.classList.add("activa");

        btn.onclick = () => {
            categoriaActual = cat;
            document.querySelectorAll(".categorias button")
                .forEach(b => b.classList.remove("activa"));
            btn.classList.add("activa");
            filtrar();
        };

        contenedor.appendChild(btn);
    });
}

/* =========================
   FILTRADO
   ========================= */
function filtrar() {
    const texto = buscador.value.toLowerCase();

    const filtrados = productos.filter(p => {
        const coincideTexto =
            p.nombre.toLowerCase().includes(texto) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(texto));

        const coincideCategoria =
            categoriaActual === "Todas" || p.categoria === categoriaActual;

        return coincideTexto && coincideCategoria;
    });

    mostrarProductos(filtrados);
}

/* =========================
   MOSTRAR PRODUCTOS
   ========================= */
function mostrarProductos(lista) {
    const contenedor = document.getElementById("productos");
    contenedor.innerHTML = "";

    lista.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${p.imagen}" alt="${p.nombre}">
            <div class="info">
                <h3>${p.nombre}</h3>
                <p>${p.descripcion || ""}</p>

                ${
                    p.stock && Number(p.stock) > 0
                        ? `<div class="stock">Stock: ${p.stock}</div>`
                        : `<div class="sin-stock">Consultar stock</div>`
                }

                <a 
                  class="btn-whatsapp" 
                  href="https://wa.me/543834267691?text=Hola,%20quiero%20consultar%20por%20el%20producto:%20${encodeURIComponent(p.nombre)}"
                  target="_blank">
                  Consultar por WhatsApp
                </a>
            </div>
        `;

        contenedor.appendChild(card);
    });
}
