import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function generateConsecutive(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");

  return `T&V-${year}${month}${day}-${random}`;
}

export function calculateCardPrice(
  basePrice: number,
  specialFinishes: Array<{ price: number; quantity: number }>,
  occupation: number,
  quantity: number
): number {
  const specialFinishTotal = specialFinishes.reduce(
    (sum, finish) => sum + finish.price * finish.quantity,
    0
  );

  return (basePrice + specialFinishTotal) * occupation * quantity;
}

export function calculateFlyerPrice(
  basePrice: number,
  occupation: number,
  quantity: number
): number {
  return basePrice * occupation * quantity;
}

export function validateCardCompatibility(
  items: Array<{ group: string; occupation: number }>
): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Verificar que no se mezclen tarjetas y volantes
  const hasCards = items.some(
    (item) => item.group === "brillo" || item.group === "mate_reserva"
  );
  const hasFlyers = items.some(
    (item) =>
      item.group === "media_carta" ||
      item.group === "cuarto_carta" ||
      item.group === "mini_volante"
  );

  if (hasCards && hasFlyers) {
    errors.push("No se pueden mezclar tarjetas y volantes en el mismo cupo");
  }

  // Verificar reglas de compatibilidad para tarjetas
  if (hasCards) {
    const brilloItems = items.filter((item) => item.group === "brillo");
    const mateReservaItems = items.filter(
      (item) => item.group === "mate_reserva"
    );

    if (brilloItems.length > 0 && mateReservaItems.length > 0) {
      const totalPieces = items.reduce((sum, item) => sum + item.occupation, 0);
      if (totalPieces > 30 || totalPieces % 3 !== 0) {
        errors.push(
          "Los cupos mixtos de brillo + mate-reserva deben ser múltiplos de 3 hasta 30 piezas"
        );
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
