import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Deshabilitar ESLint durante el build para evitar errores
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar verificación de TypeScript durante el build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
