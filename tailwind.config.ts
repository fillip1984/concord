import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

import tailwindcssForms from "@tailwindcss/forms";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [tailwindcssForms],
} satisfies Config;
