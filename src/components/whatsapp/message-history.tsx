"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquare,
  MessageSquareMore,
  Clock,
  CheckCircle,
  Copy,
} from "lucide-react";
import { WhatsAppMessage } from "@/lib/types/database";
import { whatsappService } from "@/lib/services/whatsapp-service";
import { generateWhatsAppLink } from "@/lib/services/whatsapp-messages";
import { toast } from "sonner";

interface MessageHistoryProps {
  jobId: string;
  clientWhatsapp: string;
  trigger?: React.ReactNode;
}

export function MessageHistory({
  jobId,
  clientWhatsapp,
  trigger,
}: MessageHistoryProps) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, jobId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const jobMessages = await whatsappService.getJobMessages(jobId);
      setMessages(jobMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast.error("Error al cargar historial de mensajes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = async (message: WhatsAppMessage) => {
    try {
      await navigator.clipboard.writeText(message.message_content);
      toast.success("Mensaje copiado al portapapeles");
    } catch (error) {
      console.error("Error copying message:", error);
      toast.error("Error al copiar mensaje");
    }
  };

  const handleOpenWhatsApp = (message: WhatsAppMessage) => {
    const whatsappLink = generateWhatsAppLink(
      clientWhatsapp,
      message.message_content
    );
    window.open(whatsappLink, "_blank");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (message: WhatsAppMessage) => {
    if (message.is_copied) {
      return (
        <Badge variant="secondary" className="text-red-600 bg-red-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Copiado
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-orange-600 border-orange-200">
        <Clock className="h-3 w-3 mr-1" />
        Pendiente
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" title="Ver historial de mensajes">
            <MessageSquareMore className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareMore className="h-5 w-5" />
            Historial de Mensajes WhatsApp
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">Cargando mensajes...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">
                No hay mensajes registrados
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{message.estado_trigger}</Badge>
                      {getStatusBadge(message)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(message.sent_at)}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap font-sans">
                      {message.message_content}
                    </pre>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyMessage(message)}
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenWhatsApp(message)}
                      className="text-green-600 border-green-200 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
