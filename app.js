const STORAGE_KEY = "registros_salud_v1";

let currentStep = 1;
let currentId = null;
let records = [];

const el = (id) => document.getElementById(id);

// ================= INPUTS =================
const cedula = el("cedula");
const nombres = el("nombres");
const apellidos = el("apellidos");
const fechaNac = el("fechaNac");
const sexo = el("sexo");
const telefono = el("telefono");
const direccion = el("direccion");

// ================= TABLAS =================
const familiaresTableBody = el("familiaresTable").querySelector("tbody");
const condicionesTableBody = el("condicionesTable").querySelector("tbody");
const internamientosTableBody = el("internamientosTable").querySelector("tbody");

// ================= SELECT =================
const recordSelect = el("recordSelect");

// ================= UTIL =================
function uid() {
  return "R" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function emptyRecord() {
  return {
    id: uid(),
    persona: {
      cedula: "",
      nombres: "",
      apellidos: "",
      fechaNac: "",
      sexo: "",
      telefono: "",
      direccion: ""
    },
    familiares: [],
    condiciones: [],
    internamientos: []
  };
}

// ================= STORAGE =================
function loadStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    records = raw ? JSON.parse(raw) : [];
  } catch {
    records = [];
  }

  if (!Array.isArray(records) || records.length === 0) {
    records = [emptyRecord()];
    saveStorage();
  }
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records, null, 2));
}

// ================= RECORD =================
function setCurrentRecord(id) {
  currentId = id;
  const r = records.find(x => x.id === id);
  if (!r) return;

  cedula.value = r.persona.cedula;
  nombres.value = r.persona.nombres;
  apellidos.value = r.persona.apellidos;
  fechaNac.value = r.persona.fechaNac;
  sexo.value = r.persona.sexo;
  telefono.value = r.persona.telefono;
  direccion.value = r.persona.direccion;

  renderFamiliares();
  renderCondiciones();
  renderInternamientos();
}

function syncFromUI() {
  const r = records.find(x => x.id === currentId);
  if (!r) return;

  r.persona = {
    cedula: cedula.value.trim(),
    nombres: nombres.value.trim(),
    apellidos: apellidos.value.trim(),
    fechaNac: fechaNac.value,
    sexo: sexo.value,
    telefono: telefono.value.trim(),
    direccion: direccion.value.trim()
  };
}

function refreshSelect() {
  recordSelect.innerHTML = "";
  records.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = `${r.persona.nombres || "Registro"} ${r.persona.apellidos || ""}`;
    recordSelect.appendChild(opt);
  });
  recordSelect.value = currentId;
}

// ================= RENDER =================
function renderFamiliares() {
  const r = records.find(x => x.id === currentId);
  familiaresTableBody.innerHTML = "";
  r.familiares.forEach((f, i) => {
    familiaresTableBody.innerHTML += `
      <tr>
        <td>${f.nombre}</td>
        <td>${f.parentesco}</td>
        <td>${f.edad}</td>
        <td><button class="btn danger" onclick="delFam(${i})">Eliminar</button></td>
      </tr>`;
  });
}

function renderCondiciones() {
  const r = records.find(x => x.id === currentId);
  condicionesTableBody.innerHTML = "";
  r.condiciones.forEach((c, i) => {
    condicionesTableBody.innerHTML += `
      <tr>
        <td>${c.enfermedad}</td>
        <td>${c.tiempo}</td>
        <td><button class="btn danger" onclick="delCond(${i})">Eliminar</button></td>
      </tr>`;
  });
}

function renderInternamientos() {
  const r = records.find(x => x.id === currentId);
  internamientosTableBody.innerHTML = "";
  r.internamientos.forEach((i, x) => {
    internamientosTableBody.innerHTML += `
      <tr>
        <td>${i.fecha}</td>
        <td>${i.centro}</td>
        <td>${i.diagnostico}</td>
        <td><button class="btn danger" onclick="delInt(${x})">Eliminar</button></td>
      </tr>`;
  });
}

// ================= SUMMARY =================
function renderCleanSummary() {
  const r = records.find(x => x.id === currentId);
  if (!r) return;

  el("cleanSummary").innerHTML = `
    <h3>Datos Personales</h3>
    <p><b>Cédula:</b> ${r.persona.cedula || "-"}</p>
    <p><b>Nombre:</b> ${r.persona.nombres} ${r.persona.apellidos}</p>
    <p><b>Fecha de Nacimiento:</b> ${r.persona.fechaNac || "-"}</p>
    <p><b>Sexo:</b> ${r.persona.sexo || "-"}</p>
    <p><b>Teléfono:</b> ${r.persona.telefono || "-"}</p>
    <p><b>Dirección:</b> ${r.persona.direccion || "-"}</p>

    <h3>Familiares</h3>
    <ul>${r.familiares.length ? r.familiares.map(f => `<li>${f.nombre} - ${f.parentesco} - ${f.edad}</li>`).join("") : "<li>No registrados</li>"}</ul>

    <h3>Condiciones</h3>
    <ul>${r.condiciones.map(c => `<li>${c.enfermedad} (${c.tiempo})</li>`).join("")}</ul>

    <h3>Internamientos</h3>
    <ul>${r.internamientos.length ? r.internamientos.map(i => `<li>${i.fecha} - ${i.centro} - ${i.diagnostico}</li>`).join("") : "<li>No registrados</li>"}</ul>
  `;
}

// ================= ADD =================
function addFamiliar() {
  records.find(x => x.id === currentId).familiares.push({
    nombre: el("famNombre").value,
    parentesco: el("famParentesco").value,
    edad: el("famEdad").value
  });
  renderFamiliares();
  saveStorage();
}

function addCondicion() {
  records.find(x => x.id === currentId).condiciones.push({
    enfermedad: el("condEnfermedad").value,
    tiempo: el("condTiempo").value
  });
  renderCondiciones();
  saveStorage();
}

function addInternamiento() {
  records.find(x => x.id === currentId).internamientos.push({
    fecha: el("intFecha").value,
    centro: el("intCentro").value,
    diagnostico: el("intDiag").value
  });
  renderInternamientos();
  saveStorage();
}

// ================= DELETE =================
function delFam(i){records.find(x=>x.id===currentId).familiares.splice(i,1);renderFamiliares();saveStorage();}
function delCond(i){records.find(x=>x.id===currentId).condiciones.splice(i,1);renderCondiciones();saveStorage();}
function delInt(i){records.find(x=>x.id===currentId).internamientos.splice(i,1);renderInternamientos();saveStorage();}

// ================= RECORD CRUD =================
function newRecord() {
  syncFromUI();
  saveStorage();
  const r = emptyRecord();
  records.push(r);
  currentId = r.id;
  refreshSelect();
  setCurrentRecord(currentId);
  showStep(1);
}

function deleteRecord() {
  if (records.length <= 1) {
    alert("Debe existir al menos un registro.");
    return;
  }
  if (!confirm("¿Eliminar este registro?")) return;
  records = records.filter(r => r.id !== currentId);
  currentId = records[0].id;
  saveStorage();
  refreshSelect();
  setCurrentRecord(currentId);
  showStep(1);
}

// ================= STEPS =================
function showStep(s){
  currentStep = s;
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
  el("page"+s).classList.add("active");
  if (s === 5) renderCleanSummary();
}

// ================= INIT =================
function init(){
  loadStorage();
  currentId = records[0].id;
  refreshSelect();
  setCurrentRecord(currentId);
  showStep(1);

  el("nextBtn").onclick = () => showStep(Math.min(5, currentStep + 1));
  el("prevBtn").onclick = () => showStep(Math.max(1, currentStep - 1));

  el("addFamiliarBtn").onclick = addFamiliar;
  el("addCondicionBtn").onclick = addCondicion;
  el("addInternamientoBtn").onclick = addInternamiento;

  el("saveBtn").onclick = () => { syncFromUI(); saveStorage(); alert("Guardado"); };
  el("newRecordBtn").onclick = newRecord;
  el("deleteRecordBtn").onclick = deleteRecord;

  recordSelect.onchange = () => { syncFromUI(); setCurrentRecord(recordSelect.value); };

  el("printBtn").onclick = () => window.print();
}

init();


