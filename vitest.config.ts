import { defineConfig } from "vite";

export default defineConfig({
  test: {
    silent: true,
    coverage: {
      provider: "v8",
      include: ["src/actions"],
    },
  },
});
