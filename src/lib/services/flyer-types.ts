import { createClient } from "@/lib/supabase/browser";
import { FlyerType } from "@/lib/types/database";

export class FlyerTypeService {
  private supabase = createClient();

  async getFlyerTypes(): Promise<FlyerType[]> {
    const { data, error } = await this.supabase
      .from("flyer_types")
      .select("*")
      .order("tamaño", { ascending: true });

    if (error) {
      console.error("Error fetching flyer types:", error);
      return [];
    }

    return data || [];
  }

  async getFlyerType(id: string): Promise<FlyerType | null> {
    const { data, error } = await this.supabase
      .from("flyer_types")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching flyer type:", error);
      return null;
    }

    return data;
  }

  async createFlyerType(
    flyerType: Omit<FlyerType, "id" | "created_at">
  ): Promise<FlyerType | null> {
    const { data, error } = await this.supabase
      .from("flyer_types")
      .insert([flyerType])
      .select()
      .single();

    if (error) {
      console.error("Error creating flyer type:", error);
      return null;
    }

    return data;
  }

  async updateFlyerType(
    id: string,
    updates: Partial<FlyerType>
  ): Promise<FlyerType | null> {
    const { data, error } = await this.supabase
      .from("flyer_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating flyer type:", error);
      return null;
    }

    return data;
  }

  async deleteFlyerType(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("flyer_types")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting flyer type:", error);
      return false;
    }

    return true;
  }
}

export const flyerTypeService = new FlyerTypeService();
