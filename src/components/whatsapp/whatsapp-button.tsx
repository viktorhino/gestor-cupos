"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, Copy } from "lucide-react";
import { WhatsAppMessage } from "@/lib/types/database";
import { whatsappService } from "@/lib/services/whatsapp-service";
import { generateWhatsAppLink } from "@/lib/services/whatsapp-messages";
import { toast } from "sonner";

interface WhatsAppButtonProps {
  jobId: string;
  clientWhatsapp: string;
  onMessageCopied?: (messageId: string) => void;
  className?: string;
}

export function WhatsAppButton({
  jobId,
  clientWhatsapp,
  onMessageCopied,
  className = "",
}: WhatsAppButtonProps) {
  const [pendingMessage, setPendingMessage] = useState<WhatsAppMessage | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Cargar mensaje pendiente al montar el componente
  useEffect(() => {
    loadPendingMessage();
  }, [jobId]);

  const loadPendingMessage = async () => {
    try {
      const message = await whatsappService.getLastPendingMessage(jobId);
      setPendingMessage(message);
      setIsCopied(false);
    } catch (error) {
      console.error("Error loading pending message:", error);
    }
  };

  const handleCopyMessage = async () => {
    if (!pendingMessage) return;

    setIsLoading(true);

    try {
      // Copiar al portapapeles
      await navigator.clipboard.writeText(pendingMessage.message_content);

      // Marcar como copiado en la base de datos
      const success = await whatsappService.markAsCopied(pendingMessage.id);

      if (success) {
        setIsCopied(true);
        toast.success("Mensaje copiado al portapapeles");

        // Notificar al componente padre
        onMessageCopied?.(pendingMessage.id);

        // Recargar el mensaje pendiente
        await loadPendingMessage();
      } else {
        toast.error("Error al marcar mensaje como copiado");
      }
    } catch (error) {
      console.error("Error copying message:", error);
      toast.error("Error al copiar mensaje");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!pendingMessage) return;

    const whatsappLink = generateWhatsAppLink(
      clientWhatsapp,
      pendingMessage.message_content
    );

    window.open(whatsappLink, "_blank");
  };

  // Determinar el estado del botón
  const getButtonState = () => {
    if (!pendingMessage) {
      return {
        variant: "outline" as const,
        icon: MessageSquare,
        disabled: true,
        className: "text-gray-400",
        title: "No hay mensajes pendientes",
      };
    }

    if (isCopied) {
      return {
        variant: "outline" as const,
        icon: CheckCircle,
        disabled: false,
        className: "text-red-500 border-red-500",
        title: "Mensaje copiado",
      };
    }

    return {
      variant: "default" as const,
      icon: Copy,
      disabled: false,
      className:
        "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
      title: "Copiar mensaje al portapapeles",
    };
  };

  const buttonState = getButtonState();
  const IconComponent = buttonState.icon;

  return (
    <div className={`flex gap-1 ${className}`}>
      <Button
        variant={buttonState.variant}
        size="sm"
        onClick={handleCopyMessage}
        disabled={buttonState.disabled || isLoading}
        className={`${buttonState.className} transition-colors`}
        title={buttonState.title}
      >
        <IconComponent className="h-4 w-4" />
      </Button>

      {pendingMessage && !isCopied && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleOpenWhatsApp}
          className="text-green-600 border-green-200 hover:bg-green-50"
          title="Abrir WhatsApp con mensaje predefinido"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
