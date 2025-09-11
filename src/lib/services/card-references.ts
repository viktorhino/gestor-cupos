import { createClient } from "@/lib/supabase/browser";
import { CardReference } from "@/lib/types/database";

export class CardReferenceService {
  private supabase = createClient();

  async getCardReferences(): Promise<CardReference[]> {
    const { data, error } = await this.supabase
      .from("card_references")
      .select("*")
      .order("nombre");

    if (error) {
      console.error("Error fetching card references:", error);
      return [];
    }

    return data || [];
  }

  async getCardReference(id: string): Promise<CardReference | null> {
    const { data, error } = await this.supabase
      .from("card_references")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching card reference:", error);
      return null;
    }

    return data;
  }

  async createCardReference(
    cardRef: Omit<CardReference, "id" | "created_at">
  ): Promise<CardReference | null> {
    const { data, error } = await this.supabase
      .from("card_references")
      .insert([cardRef])
      .select()
      .single();

    if (error) {
      console.error("Error creating card reference:", error);
      return null;
    }

    return data;
  }

  async updateCardReference(
    id: string,
    updates: Partial<CardReference>
  ): Promise<CardReference | null> {
    const { data, error } = await this.supabase
      .from("card_references")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating card reference:", error);
      return null;
    }

    return data;
  }

  async deleteCardReference(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from("card_references")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting card reference:", error);
      return false;
    }

    return true;
  }
}

export const cardReferenceService = new CardReferenceService();






