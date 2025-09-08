// Script de prueba para verificar la funcionalidad de WhatsApp
const {
  generateMessageContent,
  shouldGenerateMessage,
  getTemplateName,
} = require("./src/lib/services/whatsapp-messages");

// Datos de prueba
const jobTest = {
  id: "test-123",
  consecutivo: 1,
  client: {
    nombre: "Cliente Prueba",
    whatsapp: "+573001234567",
  },
  tipo: "tarjetas",
  nombre_trabajo: "Tarjetas de Prueba",
  card_reference: {
    terminacion: "Brillo",
    tamaño: "8.5x5.5",
  },
  cantidad_millares: 2,
  es_1x2: false,
  terminaciones_especiales: [{ nombre: "Barniz UV" }],
  observaciones: "Sin observaciones especiales",
  imagen_url: "https://ejemplo.com/imagen.jpg",
  descuento: 0,
};

async function runTest() {
  console.log("=== PRUEBA DE FUNCIONALIDAD WHATSAPP ===\n");

  // Probar generación de mensaje para estado "recibido"
  console.log('1. Probando mensaje para estado "recibido":');
  try {
    const mensajeRecibido = await generateMessageContent(jobTest, "recibido");
    console.log("✅ Mensaje generado correctamente:");
    console.log(mensajeRecibido);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("\n" + "=".repeat(50) + "\n");

  // Probar generación de mensaje para estado "montado"
  console.log('2. Probando mensaje para estado "montado":');
  try {
    const mensajeMontado = await generateMessageContent(jobTest, "montado");
    console.log("✅ Mensaje generado correctamente:");
    console.log(mensajeMontado);
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

console.log("\n" + "=".repeat(50) + "\n");

// Probar verificación de estados que generan mensajes
console.log("3. Probando verificación de estados:");
const estados = [
  "recibido",
  "procesando",
  "montado",
  "delegado",
  "impreso",
  "empacado",
  "entregado",
];
estados.forEach((estado) => {
  const debeGenerar = shouldGenerateMessage(estado);
  console.log(
    `Estado "${estado}": ${
      debeGenerar ? "✅ Genera mensaje" : "❌ No genera mensaje"
    }`
  );
});

console.log("\n" + "=".repeat(50) + "\n");

// Probar nombres de plantillas
console.log("4. Probando nombres de plantillas:");
estados.forEach((estado) => {
  const nombrePlantilla = getTemplateName(estado);
  console.log(`Estado "${estado}" → Plantilla: "${nombrePlantilla}"`);
});

  console.log("\n=== PRUEBA COMPLETADA ===");
}

// Ejecutar la prueba
runTest().catch(console.error);
