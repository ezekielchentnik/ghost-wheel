<script lang="ts">
  // Falling taco pickup: touch it with the truck to gain a life.
  let {
    isMoving = false,
    what,
    soWhat,
    when,
  }: {
    isMoving?: boolean
    what: DOMRect | undefined
    soWhat: () => void
    when: number
  } = $props()

  const x = Math.random() * (window.innerWidth - 80)
  const y = -Math.random() * 100 - 100

  let el: HTMLDivElement | undefined = $state()
  // Only collectible once — the parent removes it, but collision checks can
  // fire again before the removal renders.
  let collected = false

  $effect(() => {
    void when // re-run collision check whenever the trigger changes
    detectCollision()
  })

  function detectCollision() {
    if (!el || !what || collected) return
    const taco = el.getBoundingClientRect()
    // No hitbox shrink: picking up a taco should feel generous.
    const didCollide =
      taco.left < what.right &&
      taco.right > what.left &&
      taco.bottom > what.top &&
      taco.top < what.bottom
    if (didCollide) {
      collected = true
      soWhat()
    }
  }
</script>

<div
  bind:this={el}
  class="obstacle-shadow"
  style="position: absolute; left: {x}px; top: {y}px; animation: moveDown 10s linear forwards; animation-play-state: {isMoving ? 'running' : 'paused'}"
>
  <img src="/taco.png" width="48" height="48" alt="" />
</div>
