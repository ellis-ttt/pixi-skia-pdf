import { globalIgnores } from "eslint/config"
import {
	defineConfigWithVueTs,
	vueTsConfigs,
} from "@vue/eslint-config-typescript"
import pluginVue from "eslint-plugin-vue"
import pluginOxlint from "eslint-plugin-oxlint"
import skipFormatting from "eslint-config-prettier/flat"

export default defineConfigWithVueTs(
	{
		name: "app/files-to-lint",
		files: ["**/*.{vue,ts,mts,tsx}"],
	},

	globalIgnores([
		"**/dist/**",
		"**/dist-ssr/**",
		"**/coverage/**",
		"**/docs/**",
		"skia/**/*",
		"**/skia/**",
	]),

	...pluginVue.configs["flat/essential"],
	vueTsConfigs.recommended,

	...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

	skipFormatting,

	{
		name: "app/vue-attributes",
		files: ["**/*.vue"],
		rules: {
			"vue/max-attributes-per-line": [
				"error",
				{
					singleline: { max: 1 },
					multiline: { max: 1 },
				},
			],

			"vue/first-attribute-linebreak": [
				"error",
				{
					singleline: "beside",
					multiline: "below",
				},
			],

			"vue/html-indent": [
				"error",
				"tab",
				{
					attribute: 1,
					closeBracket: 0,
				},
			],
		},
	},

	{
		name: "app/disable-prefer-const",
		files: ["**/*.{js,ts,vue}"],
		rules: {
			"prefer-const": "off",
		},
	},
)
