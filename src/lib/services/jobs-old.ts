import { createClient } from "@/lib/supabase/browser";
import {
  Job,
  JobWithDetails,
  JobFormData,
  JobItem,
} from "@/lib/types/database";

export class JobService {
  private supabase = createClient();

  async getJobs(): Promise<JobWithDetails[]> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        job_items(
          *,
          card_reference:card_references(*),
          flyer_type:flyer_types(*)
        ),
        payments(*)
      `
      )
      .order("fecha_recepcion", { ascending: false });

    if (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }

    return data || [];
  }

  async getJob(id: string): Promise<JobWithDetails | null> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        job_items(
          *,
          card_reference:card_references(*),
          flyer_type:flyer_types(*)
        ),
        payments(*)
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

  async createJob(jobData: {
    client_id: string;
    tipo: "tarjetas" | "volantes";
    nombre_trabajo?: string;
    notas?: string;
    imagen_url?: string;
    descuento?: number;
    // Campos consolidados
    card_reference_id?: string;
    flyer_type_id?: string;
    ocupacion_cupo: number;
    cantidad_millares: number;
    terminaciones_especiales?: any[];
    observaciones?: string;
  }): Promise<Job | null> {
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
          card_reference_id: jobData.card_reference_id,
          flyer_type_id: jobData.flyer_type_id,
          ocupacion_cupo: jobData.ocupacion_cupo,
          cantidad_millares: jobData.cantidad_millares,
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
  }

  async createJobItem(jobId: string, itemData: any): Promise<JobItem | null> {
    try {
      console.log("Creating job item for job ID:", jobId);
      console.log("Item data:", JSON.stringify(itemData, null, 2));

      // Filtrar valores null/undefined para evitar problemas con la BD
      const cleanItemData = Object.fromEntries(
        Object.entries(itemData).filter(
          ([_, value]) => value !== null && value !== undefined
        )
      );

      const { data, error } = await this.supabase
        .from("job_items")
        .insert([
          {
            job_id: jobId,
            ...cleanItemData,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating job item:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return null;
      }

      console.log("Job item created successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in createJobItem:", error);
      return null;
    }
  }

  async updateJobItem(itemId: string, itemData: any): Promise<JobItem | null> {
    try {
      console.log("Updating job item with ID:", itemId);
      console.log("Item data to update:", JSON.stringify(itemData, null, 2));

      const { data, error } = await this.supabase
        .from("job_items")
        .update(itemData)
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        console.error("Item ID:", itemId);
        console.error("Item Data:", JSON.stringify(itemData, null, 2));
        return null;
      }

      console.log("Job item updated successfully:", data);
      return data;
    } catch (err) {
      console.error("Exception updating job item:", err);
      console.error("Error type:", typeof err);
      console.error(
        "Error message:",
        err instanceof Error ? err.message : "Unknown error"
      );
      return null;
    }
  }

  async updateJob(
    jobId: string,
    jobData: {
      client_id?: string;
      nombre_trabajo?: string;
      notas?: string;
      imagen_url?: string;
      descuento?: number;
    }
  ): Promise<Job | null> {
    try {
      console.log("Updating job with ID:", jobId);
      console.log("Job data to update:", JSON.stringify(jobData, null, 2));

      const { data, error } = await this.supabase
        .from("jobs")
        .update(jobData)
        .eq("id", jobId)
        .select()
        .single();

      if (error) {
        console.error("Error updating job:", error);
        console.error("Error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return null;
      }

      console.log("Job updated successfully:", data);
      return data;
    } catch (error) {
      console.error("Exception in updateJob:", error);
      return null;
    }
  }

  async deleteJob(jobId: string): Promise<boolean> {
    const { error } = await this.supabase.from("jobs").delete().eq("id", jobId);

    if (error) {
      console.error("Error deleting job:", error);
      return false;
    }

    return true;
  }

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

  async getJobsByStatus(status: string): Promise<JobWithDetails[]> {
    const { data, error } = await this.supabase
      .from("jobs")
      .select(
        `
        *,
        client:clients(*),
        job_items(
          *,
          card_reference:card_references(*),
          flyer_type:flyer_types(*)
        ),
        payments(*)
      `
      )
      .eq("estado", status)
      .order("fecha_recepcion", { ascending: false });

    if (error) {
      console.error("Error fetching jobs by status:", error);
      return [];
    }

    return data || [];
  }
}

export const jobService = new JobService();
