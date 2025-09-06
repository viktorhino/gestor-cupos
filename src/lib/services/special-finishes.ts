import { createClient } from "@/lib/supabase/browser";
import { TABLES } from "@/lib/supabase/config";

const supabase = createClient();

export interface SpecialFinish {
  id: string;
  nombre: string;
  precio_unit_por_millar: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const specialFinishService = {
  async getSpecialFinishes(): Promise<SpecialFinish[]> {
    try {
      const { data, error } = await supabase
        .from(TABLES.CARD_SPECIAL_FINISHES)
        .select("*")
        .order("nombre");

      if (error) {
        console.error("Error fetching special finishes:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in getSpecialFinishes:", error);
      throw error;
    }
  },
};
