import {
  JobWithDetails,
  WhatsAppMessage,
  MessageTemplate,
} from "@/lib/types/database";
import { calculatePaymentStatus } from "./jobs";
import { createClient } from "@/lib/supabase/browser";

// Cache para plantillas de mensajes
let messageTemplatesCache: Record<string, string> = {};
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cache para datos de referencia
let specialFinishesCache: any[] = [];
let cardReferencesCache: any[] = [];
let flyerTypesCache: any[] = [];
let referenceCacheTimestamp: number = 0;

/**
 * Obtiene los datos de referencia necesarios para generar mensajes
 */
async function getReferenceData() {
  const now = Date.now();

  // Verificar si el cache es válido
  if (
    specialFinishesCache.length > 0 &&
    now - referenceCacheTimestamp < CACHE_DURATION
  ) {
    return {
      specialFinishes: specialFinishesCache,
      cardReferences: cardReferencesCache,
      flyerTypes: flyerTypesCache,
    };
  }

  try {
    const supabase = createClient();
    const [specialFinishesResult, cardReferencesResult, flyerTypesResult] =
      await Promise.all([
        supabase.from("card_special_finishes").select("*"),
        supabase.from("card_references").select("*"),
        supabase.from("flyer_types").select("*"),
      ]);

    specialFinishesCache = specialFinishesResult.data || [];
    cardReferencesCache = cardReferencesResult.data || [];
    flyerTypesCache = flyerTypesResult.data || [];
    referenceCacheTimestamp = now;

    return {
      specialFinishes: specialFinishesCache,
      cardReferences: cardReferencesCache,
      flyerTypes: flyerTypesCache,
    };
  } catch (error) {
    console.error("Error fetching reference data:", error);
    return {
      specialFinishes: [],
      cardReferences: [],
      flyerTypes: [],
    };
  }
}

/**
 * Obtiene las plantillas de mensajes desde la base de datos
 */
async function getMessageTemplates(): Promise<Record<string, string>> {
  const now = Date.now();

  // Verificar si el cache es válido
  if (messageTemplatesCache && now - cacheTimestamp < CACHE_DURATION) {
    return messageTemplatesCache;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("message_templates")
      .select("name, template_content")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching message templates:", error);
      return getDefaultTemplates();
    }

    // Convertir array a objeto
    const templates: Record<string, string> = {};
    data?.forEach((template) => {
      templates[template.name] = template.template_content;
    });

    // Actualizar cache
    messageTemplatesCache = templates;
    cacheTimestamp = now;

    return templates;
  } catch (error) {
    console.error("Error fetching message templates:", error);
    return getDefaultTemplates();
  }
}

/**
 * Plantillas por defecto como fallback
 */
function getDefaultTemplates(): Record<string, string> {
  return {
    recibido: `Hola {{tratamiento}}, cordial saludo. Recibimos su trabajo {{nombre_trabajo}} para producir con las siguientes especificaciones: 
- {{tipo_trabajo}} {{caracteristicas}}
- {{millares}}
- {{terminaciones_especiales}}
- {{observaciones}}{{imagen_trabajo}}

A través de este medio le estaremos informando los avances que vayamos teniendo con su trabajo. Gracias por confiar en nosotros`,

    montado: `Hola {{tratamiento}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.`,

    delegado: `Hola {{tratamiento}}. 
Un saludito rápido para contarle que su trabajo {{nombre_trabajo}} ya está montado y acaba de entrar a la cola de producción. Le seguiremos informando. Saludos.`,

    impreso: `Hola {{tratamiento}}. 
Sólo para avisarle que su trabajo {{nombre_trabajo}} ya está impreso. SÓLO FALTAN LAS TERMINACIONES y estamos en eso así que apenas esté listo por completo le avisaremos.`,

    empacado: `Hola de nuevo {{tratamiento}}. 
Buenísimas noticias!!. Ya su trabajo {{nombre_trabajo}} está listo para que lo recoja o envíe por él. 
Recuerde que nuestro horario es de 8:30am a 12:30m y de 1:30pm a 5:30pm (lo sábados sólo hasta las 2:00pm).

Por aquí lo esperamos!!. 

PD: sólo a manera de información, actualmente el saldo pendiente por este trabajo es de {{saldo_pendiente}}.`,

    entregado: `Cordial saludo, {{tratamiento}}. 
Su trabajo {{nombre_trabajo}} fue entregado con éxito.
Para nosotros siempre será un placer servirle.`,
  };
}

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
export async function generateMessageContent(
  job: JobWithDetails,
  estado: string
): Promise<string> {
  const templates = await getMessageTemplates();
  const template = templates[estado];
  if (!template) {
    throw new Error(`No hay plantilla definida para el estado: ${estado}`);
  }

  // Obtener datos de referencia
  const { specialFinishes, cardReferences, flyerTypes } =
    await getReferenceData();

  // Debug logs
  console.log("Job data:", {
    tipo: job.tipo,
    card_reference_id: job.card_reference_id,
    card_reference: job.card_reference,
    flyer_type_id: job.flyer_type_id,
    flyer_type: job.flyer_type,
    terminaciones_especiales: job.terminaciones_especiales,
  });

  // Obtener datos del cliente
  const tratamiento =
    job.client?.tratamiento || job.client?.empresa || "Cliente";
  const whatsapp = job.client?.whatsapp || "";

  // Obtener datos del trabajo
  const nombreTrabajo = job.nombre_trabajo || `Trabajo #${job.consecutivo}`;
  const tipoTrabajo = job.tipo === "tarjetas" ? "Tarjetas" : "Volantes";

  // Generar información de caracteristicas (terminación/tamaño-tintas)
  let caracteristicas = "No especificado";

  console.log("Debugging características:", {
    tipo: job.tipo,
    card_reference: job.card_reference,
    card_reference_id: job.card_reference_id,
    flyer_type: job.flyer_type,
    flyer_type_id: job.flyer_type_id,
  });

  // Expandir el objeto card_reference para ver su contenido
  if (job.card_reference) {
    console.log(
      "🔍 card_reference expandido:",
      JSON.stringify(job.card_reference, null, 2)
    );
    console.log("🔍 card_reference.nombre:", job.card_reference.nombre);
    console.log("🔍 card_reference.grupo:", job.card_reference.grupo);
  } else {
    console.log("❌ card_reference es null o undefined");
  }

  if (job.tipo === "tarjetas") {
    if (job.card_reference) {
      // Usar las columnas que SÍ existen en la tabla
      const nombre = job.card_reference.nombre || "No especificado";
      const grupo = job.card_reference.grupo || "No especificado";
      caracteristicas = `${nombre} - ${grupo}`;
      console.log("Características desde card_reference:", caracteristicas);
    } else if (job.card_reference_id) {
      // Fallback: buscar en el array de cardReferences
      const cardRef = cardReferences.find(
        (cr) => cr.id === job.card_reference_id
      );
      if (cardRef) {
        const nombre = cardRef.nombre || "No especificado";
        const grupo = cardRef.grupo || "No especificado";
        caracteristicas = `${nombre} - ${grupo}`;
        console.log("Características desde fallback:", caracteristicas);
      } else {
        console.log(
          "Card reference no encontrado en fallback para ID:",
          job.card_reference_id
        );
      }
    }
  } else if (job.tipo === "volantes") {
    if (job.flyer_type) {
      const tamaño = job.flyer_type.tamaño || "No especificado";
      const modo = job.flyer_type.modo || "No especificado";
      caracteristicas = `${tamaño} - ${modo}`;
      console.log("Características desde flyer_type:", caracteristicas);
    } else if (job.flyer_type_id) {
      // Fallback: buscar en el array de flyerTypes
      const flyerType = flyerTypes.find((ft) => ft.id === job.flyer_type_id);
      if (flyerType) {
        const tamaño = flyerType.tamaño || "No especificado";
        const modo = flyerType.modo || "No especificado";
        caracteristicas = `${tamaño} - ${modo}`;
        console.log("Características desde fallback flyer:", caracteristicas);
      } else {
        console.log(
          "Flyer type no encontrado en fallback para ID:",
          job.flyer_type_id
        );
      }
    }
  }

  console.log("Características finales:", caracteristicas);

  // Generar información de millares
  let millares = `${job.cantidad_millares} millares`;
  if (job.es_1x2) {
    millares += " (1x2)";
  }

  // Generar terminaciones especiales
  let terminacionesEspeciales = "Ninguna";
  if (
    job.terminaciones_especiales &&
    Array.isArray(job.terminaciones_especiales) &&
    job.terminaciones_especiales.length > 0
  ) {
    console.log(
      "Processing terminaciones especiales:",
      job.terminaciones_especiales
    );
    console.log("Available special finishes:", specialFinishes);

    const terminacionesValidas = job.terminaciones_especiales
      .filter((t) => t && t.tipo)
      .map((t) => {
        const specialFinish = specialFinishes.find((sf) => sf.id === t.tipo);
        console.log(`Looking for tipo ${t.tipo}, found:`, specialFinish);
        return specialFinish ? specialFinish.nombre : t.tipo;
      })
      .filter((nombre) => nombre);

    console.log("Terminaciones validas:", terminacionesValidas);

    if (terminacionesValidas.length > 0) {
      terminacionesEspeciales = terminacionesValidas
        .map((nombre) => `- ${nombre}`)
        .join("\n");
    }
  }

  // Generar observaciones
  const observaciones = job.observaciones || "No hay";

  // Generar imagen del trabajo
  let imagenTrabajo = "\n📎 Sin imagen adjunta";
  if (job.imagen_url) {
    // Si es base64, mostrar mensaje genérico
    if (job.imagen_url.startsWith("data:image/")) {
      imagenTrabajo = "\n📎 Imagen adjunta (ver en el sistema)";
    } else {
      // Si es URL, mostrarla
      imagenTrabajo = `\n📎 Imagen del trabajo: ${job.imagen_url}`;
    }
  }

  // Calcular saldo pendiente para estado empacado
  let saldoPendiente = "";
  if (estado === "empacado") {
    const paymentStatus = calculatePaymentStatus(job);
    saldoPendiente = `$${paymentStatus.remainingBalance.toLocaleString()}`;
  }

  // Reemplazar variables en la plantilla
  let content = template
    .replace(/\{\{tratamiento\}\}/g, tratamiento)
    .replace(/\{\{nombre_trabajo\}\}/g, nombreTrabajo)
    .replace(/\{\{tipo_trabajo\}\}/g, tipoTrabajo)
    .replace(/\{\{caracteristicas\}\}/g, caracteristicas)
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
    montado: "montado",
    delegado: "delegado",
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
