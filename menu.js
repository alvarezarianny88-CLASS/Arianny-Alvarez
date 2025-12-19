// ================================
// ESTRUCTURA DE DATOS (JSON)
// ================================
const data = {
  menu: [
    {
      id: 1,
      nombre: "Inicio",
      icono: "fa-home",
      contenido: `
        <h2 class="titulo-principal">Bienvenidos</h2>

        <div class="cards-inicio">
          <div class="card">
            <h3>Inicio</h3>
            <p>
              Somos una empresa dedicada al desarrollo de soluciones digitales modernas,
              enfocadas en la calidad, la innovación y la satisfacción del cliente.
            </p>
          </div>

          <div class="card">
            <h3>Sobre Nosotros</h3>
            <p>
              Nuestro equipo está conformado por profesionales apasionados por la tecnología
              y el diseño, comprometidos con ofrecer productos funcionales y eficientes.
            </p>
          </div>

          <div class="card">
            <h3>Misión</h3>
            <p>
              Brindar soluciones digitales que impulsen el crecimiento de nuestros clientes
              mediante el uso de tecnologías actuales y buenas prácticas.
            </p>
          </div>

          <div class="card">
            <h3>Visión</h3>
            <p>
              Ser una empresa reconocida por la excelencia en servicios tecnológicos
              y la innovación constante.
            </p>
          </div>
        </div>
      `
    },
    {
      id: 2,
      nombre: "Servicios",
      icono: "fa-gear",
      submenus: [
        {
          id: 21,
          nombre: "Desarrollo Web",
          icono: "fa-code",
          contenido: `
            <h2>Desarrollo Web</h2>
            <p>
              Diseñamos y desarrollamos sitios web modernos, responsivos y optimizados
              para brindar la mejor experiencia al usuario.
            </p>
            <ul>
              <li>Sitios web institucionales</li>
              <li>Aplicaciones web dinámicas</li>
              <li>Optimización para dispositivos móviles</li>
              <li>Mantenimiento y actualización</li>
            </ul>
          `
        },
        {
          id: 22,
          nombre: "Diseño Gráfico",
          icono: "fa-paint-brush",
          contenido: `
            <h2>Diseño Gráfico</h2>
            <p>
              Creamos soluciones visuales que fortalecen la identidad de tu marca.
            </p>
            <ul>
              <li>Diseño de logotipos</li>
              <li>Identidad visual corporativa</li>
              <li>Publicidad digital e impresa</li>
              <li>Contenido para redes sociales</li>
            </ul>
          `
        }
      ]
    },
    {
      id: 3,
      nombre: "Contacto",
      icono: "fa-envelope",
      contenido: `
        <h2>Contacto</h2>
        <p>Estamos disponibles para atenderte:</p>
        <ul>
          <li><strong>Teléfono:</strong> 829-919-3350</li>
          <li><strong>Email:</strong> contacto@empresa.com</li>
          <li><strong>Horario:</strong> Lunes a Viernes, 8:00 a.m. – 5:00 p.m.</li>
        </ul>
      `
    }
  ]
};

// ================================
// RENDER DEL MENÚ (DINÁMICO)
// ================================
function crearMenu(items, contenedor) {
  const ul = document.createElement("ul");

  items.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = "#";
    a.innerHTML = `<i class="fa ${item.icono}"></i> ${item.nombre}`;

    a.onclick = e => {
      e.preventDefault();
      if (item.contenido) {
        document.getElementById("contenido").innerHTML = item.contenido;
      }
    };

    li.appendChild(a);

    if (item.submenus) {
      crearMenu(item.submenus, li);
    }

    ul.appendChild(li);
  });

  contenedor.appendChild(ul);
}

function renderMenu() {
  const nav = document.getElementById("menu");
  nav.innerHTML = "";
  crearMenu(data.menu, nav);
}

// ================================
// INICIO DE LA APP
// ================================
renderMenu();

// ================================
// ADMINISTRADOR DE MENÚ
// ================================

function adminAgregar() {
  const id = Number(document.getElementById("admin-id").value);
  const nombre = document.getElementById("admin-nombre").value;
  const icono = document.getElementById("admin-icono").value || "fa-circle";
  const padre = Number(document.getElementById("admin-padre").value);
  const contenido = document.getElementById("admin-contenido").value;

  if (!id || !nombre) {
    alert("ID y Nombre son obligatorios");
    return;
  }

  if (buscarPorId(id, data.menu)) {
    alert("Ese ID ya existe");
    return;
  }

  const nuevo = { id, nombre, icono, contenido };

  if (padre) {
    const padreItem = buscarPorId(padre, data.menu);
    if (!padreItem) {
      alert("ID Padre no existe");
      return;
    }
    padreItem.submenus = padreItem.submenus || [];
    padreItem.submenus.push(nuevo);
  } else {
    data.menu.push(nuevo);
  }

  renderMenu();
  alert("Opción agregada correctamente");
}

function adminEditar() {
  const id = Number(document.getElementById("admin-id").value);
  const item = buscarPorId(id, data.menu);

  if (!item) {
    alert("No existe una opción con ese ID");
    return;
  }

  const nombre = document.getElementById("admin-nombre").value;
  const icono = document.getElementById("admin-icono").value;
  const contenido = document.getElementById("admin-contenido").value;

  if (nombre) item.nombre = nombre;
  if (icono) item.icono = icono;
  if (contenido) item.contenido = contenido;

  renderMenu();
  alert("Opción editada correctamente");
}

function adminEliminar() {
  const id = Number(document.getElementById("admin-id").value);
  if (!id) {
    alert("Indica el ID a eliminar");
    return;
  }

  eliminarRecursivo(id, data.menu);
  renderMenu();
  alert("Opción eliminada");
}

// ===== utilidades =====

function buscarPorId(id, items) {
  for (let item of items) {
    if (item.id === id) return item;
    if (item.submenus) {
      const r = buscarPorId(id, item.submenus);
      if (r) return r;
    }
  }
  return null;
}

function eliminarRecursivo(id, items) {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) {
      items.splice(i, 1);
      return true;
    }
    if (items[i].submenus && eliminarRecursivo(id, items[i].submenus)) {
      return true;
    }
  }
  return false;
}










