import { Montserrat } from "next/font/google";

export const montserrat = Montserrat({
  weight: [ "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Arial", "sans-serif"],
});