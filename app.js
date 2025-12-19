const form = document.getElementById("contactForm");
const qrSection = document.getElementById("qrSection");
const qrContainer = document.getElementById("qrcode");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const telefono = document.getElementById("telefono").value.trim();
  const email = document.getElementById("email").value.trim();
  const empresa = document.getElementById("empresa").value.trim();

  // Formato vCard (estándar para contactos)
  const vCard = `
BEGIN:VCARD
VERSION:3.0
N:${apellido};${nombre}
FN:${nombre} ${apellido}
ORG:${empresa}
TEL;TYPE=CELL:${telefono}
EMAIL:${email}
END:VCARD
`.trim();

  // Limpiar QR anterior
  qrContainer.innerHTML = "";

  // Generar QR
  new QRCode(qrContainer, {
    text: vCard,
    width: 220,
    height: 220
  });

  qrSection.style.display = "block";
});
