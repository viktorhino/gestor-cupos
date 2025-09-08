import {
  JobWithDetails,
  WhatsAppMessage,
  MessageTemplate,
} from "@/lib/types/database";
import { calculatePaymentStatus } from "./jobs";

// Plantillas de mensajes por defecto
export const MESSAGE_TEMPLATES: Record<string, string> = {
  recibido: `Hola {{nombre}}, cordial saludo. Recibimos su trabajo {{nombre_trabajo}} para producir con las siguientes especificaciones: 
- {{tipo_trabajo}} {{terminacion_tamaño_tintas}}
- {{millares}}
- {{terminaciones_especiales}}
- {{observaciones}}
Adjuntamos imagen de lo que recibimos para que por favor nos valide que esté correcta {{imagen_trabajo}}

A través de este medio le estaremos informando los avances que vayamos teniendo con su trabajo. Gracias por confiar en nosotros`,

  montado: `Hola {{nombre}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.`,

  delegado: `Hola {{nombre}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.`,

  impreso: `Hola {{nombre}}. 
Sólo para avisarle que su trabajo {{nombre_trabajo}} ya está impreso. SÓLO FALTAN LAS TERMINACIONES y estamos en eso así que apenas esté listo por completo le avisaremos.`,

  empacado: `Hola de nuevo {{nombre}}. 
Buenísimas noticias!!. Ya su trabajo {{nombre_trabajo}} está listo para que lo recoja o envíe por él. 
Recuerde que nuestro horario es de 8:30am a 12:30m y de 1:30pm a 5:30pm (lo sábados sólo hasta las 2:00pm).

Por aquí lo esperamos!!. 

PD: sólo a manera de información, actualmente el saldo pendiente por este trabajo es de {{saldo_pendiente}}.`,

  entregado: `Cordial saludo, {{nombre}}. 
Su trabajo {{nombre_trabajo}} fue entregado con éxito.
Para nosotros siempre será un placer servirle.`,
};

// Estados que generan mensajes
export const MESSAGE_TRIGGER_STATES: string[] = [
  "recibido",
  "montado",
  "delegado",
  "impreso",
  "empacado",
  "entregado",
];

/**
 * Genera el contenido de un mensaje basado en el trabajo y el estado
 */
export function generateMessageContent(
  job: JobWithDetails,
  estado: string
): string {
  const template = MESSAGE_TEMPLATES[estado];
  if (!template) {
    throw new Error(`No hay plantilla definida para el estado: ${estado}`);
  }

  // Obtener datos del cliente
  const nombre = job.client?.empresa || "Cliente";
  const whatsapp = job.client?.whatsapp || "";

  // Obtener datos del trabajo
  const nombreTrabajo = job.nombre_trabajo || `Trabajo #${job.consecutivo}`;
  const tipoTrabajo = job.tipo === "tarjetas" ? "Tarjetas" : "Volantes";

  // Generar información de terminación/tamaño-tintas
  let terminacionTamañoTintas = "";
  if (job.tipo === "tarjetas" && job.card_reference) {
    terminacionTamañoTintas = `${job.card_reference.terminacion} - ${job.card_reference.tamaño}`;
  } else if (job.tipo === "volantes" && job.flyer_type) {
    terminacionTamañoTintas = `${job.flyer_type.tamaño} - ${job.flyer_type.modo}`;
  }

  // Generar información de millares
  let millares = `${job.cantidad_millares} millares`;
  if (job.es_1x2) {
    millares += " (1x2)";
  }

  // Generar terminaciones especiales
  let terminacionesEspeciales = "";
  if (job.terminaciones_especiales && job.terminaciones_especiales.length > 0) {
    terminacionesEspeciales = job.terminaciones_especiales
      .map((t) => `- ${t.nombre}`)
      .join("\n");
  } else {
    terminacionesEspeciales = "Ninguna";
  }

  // Generar observaciones
  const observaciones = job.observaciones || "Ninguna";

  // Generar imagen del trabajo
  const imagenTrabajo = job.imagen_url
    ? `[Imagen adjunta: ${job.imagen_url}]`
    : "[Sin imagen adjunta]";

  // Calcular saldo pendiente para estado empacado
  let saldoPendiente = "";
  if (estado === "empacado") {
    const paymentStatus = calculatePaymentStatus(job);
    saldoPendiente = `$${paymentStatus.remainingBalance.toLocaleString()}`;
  }

  // Reemplazar variables en la plantilla
  let content = template
    .replace(/\{\{nombre\}\}/g, nombre)
    .replace(/\{\{nombre_trabajo\}\}/g, nombreTrabajo)
    .replace(/\{\{tipo_trabajo\}\}/g, tipoTrabajo)
    .replace(/\{\{terminacion_tamaño_tintas\}\}/g, terminacionTamañoTintas)
    .replace(/\{\{millares\}\}/g, millares)
    .replace(/\{\{terminaciones_especiales\}\}/g, terminacionesEspeciales)
    .replace(/\{\{observaciones\}\}/g, observaciones)
    .replace(/\{\{imagen_trabajo\}\}/g, imagenTrabajo)
    .replace(/\{\{saldo_pendiente\}\}/g, saldoPendiente);

  return content;
}

/**
 * Verifica si un estado debe generar un mensaje
 */
export function shouldGenerateMessage(estado: string): boolean {
  return MESSAGE_TRIGGER_STATES.includes(estado);
}

/**
 * Obtiene el nombre de la plantilla para un estado
 */
export function getTemplateName(estado: string): string {
  const templateNames: Record<string, string> = {
    recibido: "recibido",
    montado: "montado_delegado",
    delegado: "montado_delegado",
    impreso: "impreso",
    empacado: "empacado",
    entregado: "entregado",
  };

  return templateNames[estado] || estado;
}

/**
 * Formatea un número de WhatsApp para enlace directo
 */
export function formatWhatsAppLink(whatsapp: string): string {
  // Remover caracteres no numéricos
  const cleanNumber = whatsapp.replace(/\D/g, "");

  // Si no tiene código de país, agregar +57 (Colombia)
  if (cleanNumber.length === 10) {
    return `+57${cleanNumber}`;
  }

  // Si ya tiene código de país
  if (cleanNumber.length === 12 && cleanNumber.startsWith("57")) {
    return `+${cleanNumber}`;
  }

  // Si ya tiene el +, devolverlo tal como está
  if (whatsapp.startsWith("+")) {
    return whatsapp;
  }

  // Agregar + si no lo tiene
  return `+${cleanNumber}`;
}

/**
 * Genera enlace de WhatsApp con mensaje predefinido
 */
export function generateWhatsAppLink(
  whatsapp: string,
  message: string
): string {
  const formattedNumber = formatWhatsAppLink(whatsapp);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedNumber.replace(
    "+",
    ""
  )}?text=${encodedMessage}`;
}
