import { fileURLToPath, URL } from "node:url"
import { defineConfig, searchForWorkspaceRoot } from "vite"
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"
import { join } from "node:path"
import { homedir } from "node:os"

export default defineConfig({
	plugins: [vue(), vueDevTools()],
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
		},
	},
	base: "/pixi-skia-pdf/",
	server: {
		host: "0.0.0.0",
		allowedHosts: true,
		cors: true,
		fs: {
			strict: false,
			allow: [
				searchForWorkspaceRoot(process.cwd()),
				join(homedir(), ".nvm"),
			],
		},
	},
})
