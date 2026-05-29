import type { CanvasKit, CanvasKitInitOptions } from "canvaskit-wasm"

type CanvasKitInitFn = (opts: CanvasKitInitOptions) => Promise<CanvasKit>

declare global {
	interface Window {
		CanvasKitInit?: CanvasKitInitFn
	}
}

let instance: CanvasKit | undefined
let scriptPromise: Promise<CanvasKitInitFn> | undefined

function loadScript(url: string): Promise<CanvasKitInitFn> {
	if (scriptPromise) return scriptPromise
	scriptPromise = new Promise((resolve, reject) => {
		if (window.CanvasKitInit) {
			resolve(window.CanvasKitInit)
			return
		}
		let s = document.createElement("script")
		s.src = url
		s.async = true
		s.onload = () => {
			if (window.CanvasKitInit) resolve(window.CanvasKitInit)
			else
				reject(
					new Error(
						"CanvasKitInit not found on window after script load",
					),
				)
		}
		s.onerror = () =>
			reject(new Error(`Failed to load CanvasKit script: ${url}`))
		document.head.appendChild(s)
	})
	return scriptPromise
}

export async function loadCanvasKit(): Promise<CanvasKit> {
	if (instance) return instance
	let base = `${import.meta.env.BASE_URL}canvaskit/`
	let CanvasKitInit = await loadScript(`${base}canvaskit.js`)
	let ck = await CanvasKitInit({
		locateFile: (file: string) => `${base}${file}`,
	})
	instance = ck
	return ck
}
