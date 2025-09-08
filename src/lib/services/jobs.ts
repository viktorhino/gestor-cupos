import { createClient } from "@/lib/supabase/browser";
import { Job, JobWithDetails, JobFormData } from "@/lib/types/database";

export class JobService {
  private supabase = createClient();

  // Obtener todos los trabajos con detalles
  async getJobs(): Promise<JobWithDetails[]> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        card_reference:card_references!card_reference_id(*),
        flyer_type:flyer_types!flyer_type_id(*),
        payments:payments(*),
        deliveries:deliveries(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }

    return data || [];
  }

  // Obtener trabajo por ID
  async getJobById(id: string): Promise<JobWithDetails | null> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        card_reference:card_references!card_reference_id(*),
        flyer_type:flyer_types!flyer_type_id(*),
        payments:payments(*),
        deliveries:deliveries(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching job:", error);
      return null;
    }

    return data;
  }

  // Crear nuevo trabajo (consolidado)
  async createJob(jobData: JobFormData): Promise<Job | null> {
    try {
      const { data, error } = await this.supabase
        .from("jobs")
        .insert([
          {
            client_id: jobData.client_id,
            tipo: jobData.tipo,
            nombre_trabajo: jobData.nombre_trabajo,
            estado: "recibido",
            notas: jobData.notas,
            imagen_url: jobData.imagen_url,
            descuento: jobData.descuento || 0,
            // Campos consolidados
            card_reference_id: jobData.card_reference_id || null,
            flyer_type_id: jobData.flyer_type_id || null,
            ocupacion_cupo: jobData.ocupacion_cupo,
            cantidad_millares: jobData.cantidad_millares,
            es_1x2: jobData.es_1x2 || false,
            terminaciones_especiales: jobData.terminaciones_especiales || [],
            observaciones: jobData.observaciones,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating job:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Exception in createJob:", error);
      return null;
    }
  }

  // Actualizar trabajo
  async updateJob(
    jobId: string,
    jobData: Partial<JobFormData>
  ): Promise<Job | null> {
    try {
      console.log("Updating job with ID:", jobId);
      console.log("Job data to update:", jobData);

      // Filtrar campos undefined para evitar errores en Supabase
      const updateData: any = {};

      if (jobData.client_id !== undefined)
        updateData.client_id = jobData.client_id;
      if (jobData.nombre_trabajo !== undefined)
        updateData.nombre_trabajo = jobData.nombre_trabajo;
      if (jobData.notas !== undefined) updateData.notas = jobData.notas;
      if (jobData.imagen_url !== undefined)
        updateData.imagen_url = jobData.imagen_url;
      if (jobData.descuento !== undefined)
        updateData.descuento = jobData.descuento;
      if (jobData.card_reference_id !== undefined)
        updateData.card_reference_id = jobData.card_reference_id;
      if (jobData.flyer_type_id !== undefined)
        updateData.flyer_type_id = jobData.flyer_type_id;
      if (jobData.ocupacion_cupo !== undefined)
        updateData.ocupacion_cupo = jobData.ocupacion_cupo;
      if (jobData.cantidad_millares !== undefined)
        updateData.cantidad_millares = jobData.cantidad_millares;
      if (jobData.es_1x2 !== undefined) updateData.es_1x2 = jobData.es_1x2;
      if (jobData.terminaciones_especiales !== undefined)
        updateData.terminaciones_especiales = jobData.terminaciones_especiales;
      if (jobData.observaciones !== undefined)
        updateData.observaciones = jobData.observaciones;

      console.log("Filtered update data:", updateData);

      const { data, error } = await this.supabase
        .from("jobs")
        .update(updateData)
        .eq("id", jobId)
        .select()
        .single();

      if (error) {
        console.error("Error updating job:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));
        console.error(
          "Update data that failed:",
          JSON.stringify(updateData, null, 2)
        );
        console.error("Job ID:", jobId);
        return null;
      }

      console.log("Job updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in updateJob:", error);
      return null;
    }
  }

  // Actualizar estado del trabajo
  async updateJobStatus(id: string, status: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("jobs")
      .update({ estado: status })
      .eq("id", id);

    if (error) {
      console.error("Error updating job status:", error);
      return false;
    }

    return true;
  }

  // Eliminar trabajo
  async deleteJob(jobId: string): Promise<boolean> {
    const { error } = await this.supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      return false;
    }

    return true;
  }

  // Crear pago para un trabajo
  async createPayment(
    jobId: string,
    paymentData: {
      monto: number;
      metodo: string;
      observacion?: string;
      imagen_url?: string;
    }
  ): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .insert([
          {
            job_id: jobId,
            monto: paymentData.monto,
            metodo: paymentData.metodo,
            observacion: paymentData.observacion,
            imagen_url: paymentData.imagen_url,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating payment:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error("Exception in createPayment:", error);
      return null;
    }
  }

  // Obtener pagos de un trabajo
  async getJobPayments(jobId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .select("*")
        .eq("job_id", jobId)
        .order("fecha", { ascending: false });

      if (error) {
        console.error("Error fetching job payments:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Exception in getJobPayments:", error);
      return [];
    }
  }

  // Eliminar pago
  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (error) {
        console.error("Error deleting payment:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Exception in deletePayment:", error);
      return false;
    }
  }

  // Obtener trabajos por estado
  async getJobsByStatus(status: string): Promise<JobWithDetails[]> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        card_reference:card_references(*),
        flyer_type:flyer_types(*),
        payments:payments(*),
        deliveries:deliveries(*)
      `
      )
      .eq("estado", status)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs by status:", error);
      return [];
    }

    return data || [];
  }

  // Obtener trabajos por cliente
  async getJobsByClient(clientId: string): Promise<JobWithDetails[]> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        card_reference:card_references(*),
        flyer_type:flyer_types(*),
        payments:payments(*),
        deliveries:deliveries(*)
      `
      )
      .eq("client_id", clientId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching jobs by client:", error);
      return [];
    }

    return data || [];
  }
}

// Función auxiliar para calcular el estado de pago
export const calculatePaymentStatus = (
  job: JobWithDetails
): {
  totalPaid: number;
  remainingBalance: number;
  paymentStatus: "pending" | "partial" | "paid";
} => {
  const totalPaid = (job.payments || []).reduce(
    (sum, payment) => sum + payment.monto,
    0
  );

  // Calcular valor del trabajo basado en el tipo
  let jobValue = 0;

  if (job.tipo === "tarjetas" && job.card_reference) {
    const cupos = job.ocupacion_cupo || 1;
    const millares = job.cantidad_millares || 1;
    const es_1x2 = job.es_1x2 || false;
    const millaresParaPrecio = es_1x2 ? millares / 2 : millares;
    jobValue =
      job.card_reference.precio_base_por_millar * millaresParaPrecio * cupos;
  } else if (job.tipo === "volantes" && job.flyer_type) {
    const cupos = job.ocupacion_cupo || 1;
    const millares = job.cantidad_millares || 1;
    const es_1x2 = job.es_1x2 || false;
    const millaresParaPrecio = es_1x2 ? millares / 2 : millares;
    jobValue =
      job.flyer_type.precio_base_por_millar * millaresParaPrecio * cupos;
  }

  // Agregar terminaciones especiales
  if (
    job.terminaciones_especiales &&
    Array.isArray(job.terminaciones_especiales)
  ) {
    job.terminaciones_especiales.forEach((terminacion: any) => {
      if (terminacion.precio) {
        jobValue += terminacion.precio * (job.cantidad_millares || 1);
      }
    });
  }

  // Aplicar descuento
  const descuento = job.descuento || 0;
  jobValue = Math.max(0, jobValue - descuento);

  const remainingBalance = jobValue - totalPaid;

  let paymentStatus: "pending" | "partial" | "paid" = "pending";
  if (jobValue > 0) {
    if (totalPaid >= jobValue) {
      paymentStatus = "paid";
    } else if (totalPaid > 0) {
      paymentStatus = "partial";
    }
  }

  return {
    totalPaid,
    remainingBalance,
    paymentStatus,
  };
};

export const jobService = new JobService();
