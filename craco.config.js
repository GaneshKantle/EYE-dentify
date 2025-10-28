import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};

export default config;
