const form = document.getElementById("salesForm");
const mesInput = document.getElementById("mes");
const montoInput = document.getElementById("monto");

const ctx = document.getElementById("ventasChart").getContext("2d");

// Data proporcionada por la aplicación
let meses = [];
let ventas = [];

// Crear gráfico vacío
const ventasChart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: meses,
    datasets: [{
      label: "Ventas por Mes",
      data: ventas,
      backgroundColor: pastelColors
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Al enviar el formulario
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const mes = mesInput.value;
  const monto = Number(montoInput.value);

  if (!mes || monto <= 0) return;

  // Si el mes ya existe, se acumula
  const index = meses.indexOf(mes);
  if (index !== -1) {
    ventas[index] += monto;
  } else {
    meses.push(mes);
    ventas.push(monto);
  }

  // Actualizar gráfico incrustado
  ventasChart.update();

  // Limpiar formulario
  form.reset();
});
const pastelColors = [
  "#fbcfe8", // rosa
  "#ddd6fe", // lila
  "#bfdbfe", // azul
  "#bbf7d0", // verde
  "#fde68a", // amarillo
  "#fecaca", // rojo suave
  "#e9d5ff", // violeta
  "#cffafe", // cyan
  "#fed7aa", // naranja
  "#e0e7ff", // azul claro
  "#f5d0fe", // magenta
  "#d1fae5"  // verde agua
];
