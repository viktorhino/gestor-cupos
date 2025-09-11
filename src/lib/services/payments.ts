import { createClient } from "@/lib/supabase/browser";
import { Payment, PaymentMethod } from "@/lib/types/database";

export class PaymentService {
  private supabase = createClient();
  async createPayment(paymentData: {
    job_id: string;
    monto: number;
    metodo: PaymentMethod;
    observacion?: string;
  }): Promise<Payment | null> {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .insert([
          {
            job_id: paymentData.job_id,
            monto: paymentData.monto,
            metodo: paymentData.metodo,
            observacion: paymentData.observacion || null,
          },
        ])
        .select()
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (err) {
      return null;
    }
  }

  async updatePayment(
    paymentId: string,
    paymentData: {
      monto: number;
      metodo: PaymentMethod;
      observacion?: string;
    }
  ): Promise<Payment | null> {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .update({
          monto: paymentData.monto,
          metodo: paymentData.metodo,
          observacion: paymentData.observacion || null,
        })
        .eq("id", paymentId)
        .select()
        .single();

      if (error) {
        return null;
      }

      return data;
    } catch (err) {
      return null;
    }
  }

  async getPaymentsByJobId(jobId: string): Promise<Payment[]> {
    try {
      const { data, error } = await this.supabase
        .from("payments")
        .select("*")
        .eq("job_id", jobId)
        .order("fecha", { ascending: false });

      if (error) {
        return [];
      }

      return data || [];
    } catch (err) {
      return [];
    }
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("payments")
        .delete()
        .eq("id", paymentId);

      if (error) {
        return false;
      }

      return true;
    } catch (err) {
      return false;
    }
  }
}

export const paymentService = new PaymentService();
