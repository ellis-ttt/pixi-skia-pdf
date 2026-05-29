import { loadCanvasKit } from "./canvaskit-load"
import type { CanvasKit, Surface } from "canvaskit-wasm"

export class SkiaRenderer {
	private ck: CanvasKit | null = null
	private surface: Surface | null = null
	private readonly canvasEl: HTMLCanvasElement
	private animFrameId: number | null = null
	private renderCallback: (() => void) | null = null
	private pixiCanvas: HTMLCanvasElement | null = null
	private _width: number
	private _height: number

	get width() {
		return this._width
	}

	get height() {
		return this._height
	}

	get canvas() {
		return this.canvasEl
	}

	constructor(container: HTMLElement, width: number, height: number) {
		this._width = width
		this._height = height
		this.canvasEl = document.createElement("canvas")
		this.canvasEl.width = width
		this.canvasEl.height = height
		this.canvasEl.style.display = "block"
		container.appendChild(this.canvasEl)
	}

	async init(): Promise<void> {
		this.ck = await loadCanvasKit()
		let surface = this.ck.MakeSWCanvasSurface(this.canvasEl)
		if (!surface) throw new Error("Failed to create CanvasKit surface")
		this.surface = surface
		this.startLoop()
	}

	onRender(fn: () => void): void {
		this.renderCallback = fn
	}

	setPixiCanvas(pixiCanvas: HTMLCanvasElement): void {
		this.pixiCanvas = pixiCanvas
	}

	private startLoop(): void {
		let loop = () => {
			this.renderCallback?.()
			this.surface?.flush()
			this.animFrameId = requestAnimationFrame(loop)
		}
		this.animFrameId = requestAnimationFrame(loop)
	}

	drawFrame(): void {
		let ck = this.ck
		let surface = this.surface
		let pixiCanvas = this.pixiCanvas
		if (!ck || !surface || !pixiCanvas) return

		let w = pixiCanvas.width
		let h = pixiCanvas.height
		if (w === 0 || h === 0) return

		let skImage = ck.MakeImageFromCanvasImageSource(pixiCanvas)
		if (skImage) {
			let canvas = surface.getCanvas()
			canvas.clear(ck.TRANSPARENT)
			canvas.drawImage(skImage, 0, 0)
			skImage.delete()
		}
	}

	resize(width: number, height: number): void {
		this._width = width
		this._height = height
		this.canvasEl.width = width
		this.canvasEl.height = height
		if (this.ck) {
			this.surface?.delete()
			this.surface = this.ck.MakeSWCanvasSurface(this.canvasEl)
		}
	}

	destroy(): void {
		if (this.animFrameId !== null) {
			cancelAnimationFrame(this.animFrameId)
			this.animFrameId = null
		}
		this.surface?.delete()
		this.surface = null
		this.canvasEl.remove()
	}
}
