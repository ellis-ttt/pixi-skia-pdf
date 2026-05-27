<script setup lang="ts">
// description: This example demonstrates how to use a Container to group and manipulate multiple sprites
import { Application, Assets, Container, Sprite } from 'pixi.js';
import { onMounted, onUnmounted, useTemplateRef } from 'vue'

let pixiContainer = useTemplateRef('container')
let app: Application | null = null

onMounted(() => {
	makePixiApp().catch(err => console.error(err))
})

async function makePixiApp() {
	app = new Application()
	await app.init({ background: '#1099bb', resizeTo: window })
	pixiContainer.value?.appendChild(app.canvas)
	let container = new Container()
	app.stage.addChild(container)
	let texture = await Assets.load('https://pixijs.com/assets/bunny.png')

	for (let i = 0; i < 25; i++) {
		const bunny = new Sprite(texture)

		bunny.x = (i % 5) * 40
		bunny.y = Math.floor(i / 5) * 40
		container.addChild(bunny)
	}

	container.x = app.screen.width / 2
	container.y = app.screen.height / 2

	container.pivot.x = container.width / 2
	container.pivot.y = container.height / 2

	app.ticker.add((time) => {
		container.rotation -= 0.01 * time.deltaTime;
	});
}

onUnmounted(() => {
	app?.destroy(true, true)
	app = null
})
</script>

<template>
	<div ref="container">

	</div>
</template>

<style scoped>

</style>
