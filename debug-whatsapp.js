// Script de diagnóstico para WhatsApp
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://dabffkglfwdjfaanzpkm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhYmZma2dsZndkamZhYW5...";

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugWhatsApp() {
  console.log("🔍 Diagnóstico de WhatsApp...\n");

  try {
    // 1. Verificar tabla whatsapp_messages
    console.log("1. Verificando tabla whatsapp_messages...");
    const { data: messages, error: messagesError } = await supabase
      .from("whatsapp_messages")
      .select("*")
      .limit(1);

    if (messagesError) {
      console.log("❌ Error en whatsapp_messages:", messagesError);
      console.log("   Código:", messagesError.code);
      console.log("   Mensaje:", messagesError.message);
      console.log("   Detalles:", messagesError.details);
    } else {
      console.log("✅ whatsapp_messages OK");
      console.log("   Datos encontrados:", messages.length);
    }

    // 2. Verificar tabla message_templates
    console.log("\n2. Verificando tabla message_templates...");
    const { data: templates, error: templatesError } = await supabase
      .from("message_templates")
      .select("*")
      .limit(1);

    if (templatesError) {
      console.log("❌ Error en message_templates:", templatesError);
      console.log("   Código:", templatesError.code);
      console.log("   Mensaje:", templatesError.message);
      console.log("   Detalles:", templatesError.details);
    } else {
      console.log("✅ message_templates OK");
      console.log("   Datos encontrados:", templates.length);
    }

    // 3. Intentar insertar un mensaje de prueba
    console.log("\n3. Probando inserción de mensaje...");
    const { data: insertData, error: insertError } = await supabase
      .from("whatsapp_messages")
      .insert({
        job_id: "00000000-0000-0000-0000-000000000000", // UUID de prueba
        estado_trigger: "recibido",
        template_name: "mensaje_recibido",
        message_content: "Mensaje de prueba",
        is_copied: false,
      })
      .select()
      .single();

    if (insertError) {
      console.log("❌ Error al insertar mensaje:", insertError);
      console.log("   Código:", insertError.code);
      console.log("   Mensaje:", insertError.message);
      console.log("   Detalles:", insertError.details);
    } else {
      console.log("✅ Inserción exitosa");
      console.log("   ID del mensaje:", insertData.id);
    }
  } catch (error) {
    console.log("❌ Error general:", error);
  }
}

debugWhatsApp();
