import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const pagina = (nome: string) =>
  fileURLToPath(new URL(`./${nome}.html`, import.meta.url));

export default defineConfig({
  server: { port: 5173 },
  build: {
    rollupOptions: {
      input: {
        index: pagina("index"),
        acervo: pagina("acervo"),
        admin: pagina("admin"),
        cadastro: pagina("cadastro"),
        conta: pagina("conta"),
        emprestimos: pagina("emprestimos"),
        historico: pagina("historico"),
      },
    },
  },
});
