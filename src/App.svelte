<script lang="ts">
  import { onMount } from 'svelte'
  import SteeringWheel from './lib/SteeringWheel.svelte'
  import Vehicle from './lib/Vehicle.svelte'
  import Obstacle from './lib/Obstacle.svelte'
  import Dashboard from './lib/Dashboard.svelte'
  import HowToPlay from './lib/HowToPlay.svelte'
  import { playBackground, playFX } from './lib/audio'

  let showHowToPlay = $state(true)

  let vehicleLeft = $state(0)
  let isDetected = $state(false)
  let degrees = $state(0)
  let obstacles = $state<Array<{ timestamp: number; key: string }>>([])
  let detectCollisionTrigger = $state(0)

  let isLoading = $state(false)
  let isColliding = $state(false)
  let distance = $state(0)

  let livesRemaining = $state(0)
  let isGameOver = $state(false)
  let isInvincible = false

  let vehicleEl: HTMLDivElement | undefined = $state()
  let vehicleRect: DOMRect | undefined = $state()

  onMount(() => {
    vehicleLeft = window.innerWidth / 2
    livesRemaining = 4
  })

  $effect(() => {
    if (isDetected && !isGameOver) {
      const distanceInterval = setInterval(() => {
        distance += 1
      }, 100)

      const generationInterval = setInterval(() => {
        const now = Date.now()
        const batch = Array.from({ length: 4 }, () => ({
          timestamp: now,
          key: `${now}-${Math.random()}`,
        }))
        obstacles = [...obstacles, ...batch]
      }, 1000)

      const removalInterval = setInterval(() => {
        const now = Date.now()
        obstacles = obstacles.filter((o) => now - o.timestamp < 5000)
      }, 5000)

      return () => {
        clearInterval(distanceInterval)
        clearInterval(generationInterval)
        clearInterval(removalInterval)
      }
    }
  })

  $effect(() => {
    // muffle the music unless actively playing
    playBackground(!(isDetected && !isGameOver))
  })

  const handleHandResults = (result: any) => {
    isLoading = result.isLoading
    isDetected = result.isDetected
    degrees = result.degrees

    if (result.degrees && result.degrees !== 0) {
      detectCollisionTrigger = Math.random()
      const ret = vehicleLeft - result.degrees / 6
      if (ret >= 20 && ret <= window.innerWidth - 116) {
        vehicleLeft = ret
      }
    }
    vehicleRect = vehicleEl?.getBoundingClientRect()
  }

  const collisionHandler = () => {
    // after collision
    if (!isInvincible && !isGameOver) {
      isInvincible = true
      isColliding = true
      playFX()
      livesRemaining--
      if (livesRemaining <= 0) {
        // then game over
        isGameOver = true
      }
      setTimeout(() => {
        isInvincible = false
        isColliding = false
      }, 1500)
    }
  }

  const resetGame = () => {
    isInvincible = false
    livesRemaining = 4
    isColliding = false
    isGameOver = false
    distance = 0
    obstacles = []
    vehicleLeft = window.innerWidth / 2
  }
</script>

<main class="flex min-h-screen flex-col items-center justify-center p-24">
  {#if showHowToPlay}
    <HowToPlay onDismiss={() => (showHowToPlay = false)} />
  {/if}
  <div class="absolute left-3 top-3 z-30 flex flex-row items-start gap-5">
    <div class={`shrink-0 transition-all duration-500 ${isDetected ? 'w-36' : 'w-48'}`}>
      <SteeringWheel setHandResults={handleHandResults} />
    </div>
    <Dashboard info={{ distance, livesRemainingState: livesRemaining }} />
  </div>
  <div
    bind:this={vehicleEl}
    id="vehicle-container"
    class={isColliding ? 'wiggle' : ''}
    style="position: absolute; left: {vehicleLeft}px; transition: all; animation-duration: 10ms; margin-top: {isColliding ? '507px' : '500px'}"
  >
    <Vehicle {degrees} />
  </div>
  <div class="absolute z-10 h-screen w-screen overflow-hidden">
    {#each obstacles as b (b.key)}
      <Obstacle isMoving={isDetected} what={vehicleRect} soWhat={collisionHandler} when={detectCollisionTrigger} />
    {/each}
  </div>
  <div
    class={`pointer-events-none absolute z-30 h-screen w-screen flex items-center justify-center ${isColliding ? 'border-[20px] border-fuchsia-600' : ''}`}
  >
    {#if isLoading}
      <div class="text-2xl animate-[pulse_2.5s_ease-in-out_infinite] font-extrabold">L O A D I N G</div>
    {/if}
    {#if !isLoading && !isDetected && !isGameOver}
      <div class="text-2xl animate-[pulse_2.5s_ease-in-out_infinite] font-extrabold">P A U S E D</div>
    {/if}
    {#if isGameOver}
      <div class="flex flex-col items-center gap-6">
        <div class="text-2xl animate-[pulse_2.5s_ease-in-out_infinite] font-extrabold">GAME OVER</div>
        <button
          class="pointer-events-auto rounded-lg border-2 border-fuchsia-600 px-4 py-2 font-bold hover:bg-fuchsia-600"
          onclick={resetGame}
        >
          Play again
        </button>
      </div>
    {/if}
  </div>
</main>
