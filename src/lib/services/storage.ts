import { createClient } from "@/lib/supabase/browser";

export class StorageService {
  private supabase = createClient();

  /**
   * Sube una imagen al bucket de Supabase
   * @param file - Archivo de imagen
   * @param jobId - ID del trabajo (para organizar las carpetas)
   * @returns URL pública de la imagen o null si hay error
   */
  async uploadWorkImage(file: File, jobId: string): Promise<string | null> {
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${jobId}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // No incluir 'work-images/' porque ya se especifica en .from()

      console.log("Uploading file:", { fileName, filePath });

      // Subir archivo al bucket (sin verificar autenticación)
      const { data, error } = await this.supabase.storage
        .from("work-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading image:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
        });
        return null;
      }

      console.log("File uploaded successfully:", data);
      console.log("Using path for getPublicUrl:", data.path);

      // Obtener URL pública usando el path de la respuesta del upload
      const urlData = this.supabase.storage
        .from("work-images")
        .getPublicUrl(data.path);

      console.log("getPublicUrl response:", urlData);
      console.log("Generated public URL:", urlData.publicUrl);

      // Si getPublicUrl falla, construir la URL manualmente
      if (!urlData.publicUrl) {
        console.log("getPublicUrl failed, constructing URL manually");
        const supabaseUrl = this.supabase.supabaseUrl;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/work-images/${data.path}`;
        console.log("Manual public URL:", publicUrl);
        return publicUrl;
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadWorkImage:", error);
      return null;
    }
  }

  /**
   * Elimina una imagen del bucket
   * @param imageUrl - URL completa de la imagen
   * @returns true si se eliminó correctamente
   */
  async deleteWorkImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const filePath = fileName; // No incluir 'work-images/' porque ya se especifica en .from()

      const { error } = await this.supabase.storage
        .from("work-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deleteWorkImage:", error);
      return false;
    }
  }

  /**
   * Sube una imagen de soporte de pago al bucket de Supabase
   * @param file - Archivo de imagen
   * @param paymentId - ID del pago (para organizar las carpetas)
   * @returns URL pública de la imagen o null si hay error
   */
  async uploadPaymentImage(
    file: File,
    paymentId: string
  ): Promise<string | null> {
    try {
      // Generar nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${paymentId}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // No incluir 'payment-images/' porque ya se especifica en .from()

      console.log("Uploading payment image:", {
        fileName,
        filePath,
      });

      // Subir archivo al bucket
      const { data, error } = await this.supabase.storage
        .from("payment-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Error uploading payment image:", error);
        console.error("Error details:", {
          message: error.message,
          statusCode: error.statusCode,
          error: error.error,
        });
        return null;
      }

      console.log("Payment image uploaded successfully:", data);

      // Obtener URL pública
      const urlData = this.supabase.storage
        .from("payment-images")
        .getPublicUrl(data.path);

      console.log("getPublicUrl response:", urlData);

      // Si getPublicUrl falla, construir la URL manualmente
      if (!urlData.publicUrl) {
        console.log("getPublicUrl failed, constructing URL manually");
        const supabaseUrl = this.supabase.supabaseUrl;
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/payment-images/${data.path}`;
        console.log("Manual public URL:", publicUrl);
        return publicUrl;
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error in uploadPaymentImage:", error);
      return null;
    }
  }

  /**
   * Elimina una imagen de soporte de pago del bucket
   * @param imageUrl - URL completa de la imagen
   * @returns true si se eliminó correctamente
   */
  async deletePaymentImage(imageUrl: string): Promise<boolean> {
    try {
      // Extraer el path del archivo de la URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/");
      const fileName = pathParts[pathParts.length - 1];
      const filePath = fileName; // No incluir 'payment-images/' porque ya se especifica en .from()

      const { error } = await this.supabase.storage
        .from("payment-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting payment image:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error in deletePaymentImage:", error);
      return false;
    }
  }

  /**
   * Convierte un archivo a base64 para preview temporal
   * @param file - Archivo de imagen
   * @returns Promise<string> - Base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const storageService = new StorageService();
