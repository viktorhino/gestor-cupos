// Script para verificar las tablas de Supabase
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://dabffkglfwdjfaanzpkm.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhYmZma2dsZndkamZhYW5...";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("🔍 Verificando tablas de Supabase...\n");

  try {
    // Verificar tabla jobs
    console.log("1. Verificando tabla jobs...");
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, estado")
      .limit(1);

    if (jobsError) {
      console.log("❌ Error en tabla jobs:", jobsError.message);
    } else {
      console.log("✅ Tabla jobs OK");
    }

    // Verificar tabla whatsapp_messages
    console.log("\n2. Verificando tabla whatsapp_messages...");
    const { data: messages, error: messagesError } = await supabase
      .from("whatsapp_messages")
      .select("id")
      .limit(1);

    if (messagesError) {
      console.log(
        "❌ Error en tabla whatsapp_messages:",
        messagesError.message
      );
      console.log("💡 La tabla no existe o no tiene políticas RLS correctas");
    } else {
      console.log("✅ Tabla whatsapp_messages OK");
    }

    // Verificar tabla message_templates
    console.log("\n3. Verificando tabla message_templates...");
    const { data: templates, error: templatesError } = await supabase
      .from("message_templates")
      .select("id")
      .limit(1);

    if (templatesError) {
      console.log(
        "❌ Error en tabla message_templates:",
        templatesError.message
      );
    } else {
      console.log("✅ Tabla message_templates OK");
    }
  } catch (error) {
    console.log("❌ Error general:", error.message);
  }
}

checkTables();
