import localFont from "next/font/local";

// Fuentes alojadas en el propio sitio (paquetes Fontsource): sin peticiones a
// servicios de terceros en cada visita y sin depender de su disponibilidad.

export const onest = localFont({
  src: [
    { path: "../../node_modules/@fontsource-variable/onest/files/onest-latin-wght-normal.woff2", weight: "100 900" },
  ],
  variable: "--font-onest",
  display: "swap",
});

export const bigShoulders = localFont({
  src: [
    { path: "../../node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-700-normal.woff2", weight: "700" },
    { path: "../../node_modules/@fontsource/big-shoulders-display/files/big-shoulders-display-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--font-big-shoulders",
  display: "swap",
});
