<script setup lang="ts">
import { Application, Assets, Container, Sprite } from "pixi.js-legacy"
import { onMounted, onUnmounted, useTemplateRef } from "vue"
import { SkiaRenderer } from "./skia-renderer"

const containerRef = useTemplateRef<HTMLElement>("container")
let app: Application | null = null
let renderer: SkiaRenderer | null = null

onMounted(() => {
	init().catch(err => console.error(err))
})

async function init() {
	const w = window.innerWidth
	const h = window.innerHeight

	const pixi = new Application({
		background: "#1099bb",
		width: w,
		height: h,
		forceCanvas: true,
	})
	pixi.ticker.stop()
	app = pixi

	const view = pixi.view as HTMLCanvasElement

	const scene = new Container()
	pixi.stage.addChild(scene)

	Assets.load("https://pixijs.com/assets/bunny.png").then(texture => {
		for (let i = 0; i < 25; i++) {
			const bunny = new Sprite(texture)
			bunny.x = (i % 5) * 40
			bunny.y = Math.floor(i / 5) * 40
			scene.addChild(bunny)
		}

		scene.x = pixi.screen.width / 2
		scene.y = pixi.screen.height / 2
		scene.pivot.x = scene.width / 2
		scene.pivot.y = scene.height / 2
	})

	const el = containerRef.value
	if (!el) return

	const skia = new SkiaRenderer(el, w, h)
	await skia.init()
	skia.setPixiCanvas(view)
	renderer = skia

	skia.onRender(() => {
		scene.rotation -= 0.01
		pixi.renderer.render(pixi.stage)
		skia.drawFrame()
	})

	window.addEventListener("resize", onResize)
}

function onResize() {
	const w = window.innerWidth
	const h = window.innerHeight
	app?.renderer.resize(w, h)
	renderer?.resize(w, h)
}

onUnmounted(() => {
	window.removeEventListener("resize", onResize)
	renderer?.destroy()
	renderer = null
	app?.destroy(true, true)
	app = null
})
</script>

<template>
	<div ref="container"></div>
</template>

<style scoped>

</style>
