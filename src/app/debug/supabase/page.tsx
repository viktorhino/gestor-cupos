"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function SupabaseDebugPage() {
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    // Llamada simple: debería devolver session null, pero si hay conexión no falla
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setStatus("ok");
        setMsg(
          "SDK OK. Se pudo contactar a Supabase (session actual: " +
            (data.session ? "existe" : "null") +
            ")."
        );
      })
      .catch((e) => {
        console.error(e);
        setStatus("error");
        setMsg("Error conectando al SDK. Revisa tus env vars y la URL/KEY.");
      });
  }, []);

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-bold mb-2">Supabase Debug</h1>
      <p className="text-sm text-gray-500 mb-6">/debug/supabase</p>
      <div
        className={`rounded-lg border p-4 ${
          status === "ok"
            ? "border-green-500"
            : status === "error"
            ? "border-red-500"
            : "border-gray-300"
        }`}
      >
        <p>{msg || "Probando conexión..."}</p>
      </div>
    </div>
  );
}
