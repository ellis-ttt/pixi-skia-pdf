#!/usr/bin/env node

import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "node:fs"
import path from "node:path"
import ignore from "ignore"

const INDENT_SIZE = 1
const TARGET_EXTENSIONS = [".html", ".vue", ".svelte", ".jsx", ".tsx"]

let targetPath = process.argv[2]

if (!targetPath) {
	process.exit(1)
}

const ig = ignore()

const loadIgnoreFile = fileName => {
	const filePath = path.join(process.cwd(), fileName)
	if (existsSync(filePath)) {
		ig.add(readFileSync(filePath, "utf8"))
	}
}

loadIgnoreFile(".gitignore")
loadIgnoreFile(".prettierignore")

ig.add(["node_modules", ".git", ".nuxt", ".next", "dist"])

function formatClassAttributes(source) {
	let classRegex = /(class|:class)=(['"])([^"]*?)\2/g

	return source.replace(
		classRegex,
		(match, attrName, quote, classString, offset) => {
			let classes = classString.trim().split(/\s+/).filter(Boolean)

			if (classes.length <= 1) {
				return match
			}

			let linesBefore = source.substring(0, offset).split("\n")
			let currentLine = linesBefore[linesBefore.length - 1]
			let baseIndent = currentLine.match(/^\s*/)[0]

			let classIndent = baseIndent + "\t".repeat(INDENT_SIZE)

			let formattedClasses = classes
				.map(cls => `${classIndent}${cls}`)
				.join("\n")

			return `${attrName}=${quote}\n${formattedClasses}\n${baseIndent}${quote}`
		},
	)
}

function processFile(filePath) {
	if (!TARGET_EXTENSIONS.includes(path.extname(filePath))) {
		return
	}

	let originalContent = readFileSync(filePath, "utf8")
	let formattedContent = formatClassAttributes(originalContent)

	if (originalContent !== formattedContent) {
		writeFileSync(filePath, formattedContent, "utf8")
	}
}

function walk(dir) {
	let files = readdirSync(dir)

	for (let file of files) {
		let fullPath = path.join(dir, file)

		let relativePath = path.relative(process.cwd(), fullPath)

		if (ig.ignores(relativePath)) {
			continue
		}

		const stats = statSync(fullPath)

		if (stats.isDirectory()) {
			if (!ig.ignores(relativePath + path.sep)) {
				walk(fullPath)
			}
		} else {
			processFile(fullPath)
		}
	}
}

let stats = statSync(targetPath)

if (stats.isDirectory()) {
	walk(targetPath)
} else {
	let relativePath = path.relative(process.cwd(), targetPath)
	if (!ig.ignores(relativePath)) {
		processFile(targetPath)
	}
}
