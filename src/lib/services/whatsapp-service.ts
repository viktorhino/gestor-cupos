import { createClient } from "@/lib/supabase/browser";
import {
  WhatsAppMessage,
  MessageTemplate,
  JobWithWhatsApp,
} from "@/lib/types/database";
import {
  generateMessageContent,
  shouldGenerateMessage,
  getTemplateName,
} from "./whatsapp-messages";

export class WhatsAppService {
  private supabase = createClient();

  /**
   * Crea un nuevo mensaje WhatsApp en la base de datos
   */
  async createMessage(
    jobId: string,
    estado: string,
    messageContent: string,
    sentBy?: string
  ): Promise<WhatsAppMessage | null> {
    try {
      const templateName = getTemplateName(estado);

      const { data, error } = await this.supabase
        .from("whatsapp_messages")
        .insert({
          job_id: jobId,
          estado_trigger: estado,
          template_name: templateName,
          message_content: messageContent,
          sent_by: sentBy,
          is_copied: false,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating WhatsApp message:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error creating WhatsApp message:", error);
      return null;
    }
  }

  /**
   * Marca un mensaje como copiado al portapapeles
   */
  async markAsCopied(messageId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("whatsapp_messages")
        .update({
          is_copied: true,
          copied_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) {
        console.error("Error marking message as copied:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking message as copied:", error);
      return false;
    }
  }

  /**
   * Obtiene el historial de mensajes de un trabajo
   */
  async getJobMessages(jobId: string): Promise<WhatsAppMessage[]> {
    try {
      const { data, error } = await this.supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching job messages:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching job messages:", error);
      return [];
    }
  }

  /**
   * Obtiene el último mensaje pendiente de copia para un trabajo
   */
  async getLastPendingMessage(jobId: string): Promise<WhatsAppMessage | null> {
    try {
      const { data, error } = await this.supabase
        .from("whatsapp_messages")
        .select("*")
        .eq("job_id", jobId)
        .eq("is_copied", false)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // No hay mensajes pendientes
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching last pending message:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching last pending message:", error);
      return null;
    }
  }

  /**
   * Obtiene todas las plantillas de mensajes
   */
  async getMessageTemplates(): Promise<MessageTemplate[]> {
    try {
      const { data, error } = await this.supabase
        .from("message_templates")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching message templates:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching message templates:", error);
      return [];
    }
  }

  /**
   * Procesa un cambio de estado y genera mensaje si es necesario
   */
  async processStateChange(
    job: JobWithWhatsApp,
    newEstado: string,
    sentBy?: string
  ): Promise<WhatsAppMessage | null> {
    // Verificar si el nuevo estado debe generar un mensaje
    if (!shouldGenerateMessage(newEstado)) {
      return null;
    }

    // Generar el contenido del mensaje
    const messageContent = await generateMessageContent(job, newEstado);

    // Crear el mensaje en la base de datos
    const message = await this.createMessage(
      job.id,
      newEstado,
      messageContent,
      sentBy
    );

    return message;
  }

  /**
   * Obtiene trabajos con sus mensajes WhatsApp
   */
  async getJobsWithMessages(): Promise<JobWithWhatsApp[]> {
    try {
      const { data, error } = await this.supabase
        .from("jobs")
        .select(
          `
          *,
          client:clients(*),
          card_reference:card_references(*),
          flyer_type:flyer_types(*),
          payments:payments(*),
          deliveries:deliveries(*),
          whatsapp_messages:whatsapp_messages(*)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching jobs with messages:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching jobs with messages:", error);
      return [];
    }
  }

  /**
   * Obtiene estadísticas de mensajes
   */
  async getMessageStats(): Promise<{
    totalMessages: number;
    pendingMessages: number;
    copiedMessages: number;
  }> {
    try {
      const { data: totalData, error: totalError } = await this.supabase
        .from("whatsapp_messages")
        .select("id", { count: "exact" });

      const { data: pendingData, error: pendingError } = await this.supabase
        .from("whatsapp_messages")
        .select("id", { count: "exact" })
        .eq("is_copied", false);

      const { data: copiedData, error: copiedError } = await this.supabase
        .from("whatsapp_messages")
        .select("id", { count: "exact" })
        .eq("is_copied", true);

      if (totalError || pendingError || copiedError) {
        console.error("Error fetching message stats:", {
          totalError,
          pendingError,
          copiedError,
        });
        return { totalMessages: 0, pendingMessages: 0, copiedMessages: 0 };
      }

      return {
        totalMessages: totalData?.length || 0,
        pendingMessages: pendingData?.length || 0,
        copiedMessages: copiedData?.length || 0,
      };
    } catch (error) {
      console.error("Error fetching message stats:", error);
      return { totalMessages: 0, pendingMessages: 0, copiedMessages: 0 };
    }
  }
}

// Instancia singleton del servicio
export const whatsappService = new WhatsAppService();
