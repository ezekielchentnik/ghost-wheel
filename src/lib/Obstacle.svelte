<script lang="ts">
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

  const TREES = [{ src: '/tree-1.png', width: 64, height: 96 }]
  const tree = TREES[Math.floor(Math.random() * TREES.length)]
  const x = Math.random() * (window.innerWidth - 80)
  const y = -Math.random() * 100 - 100

  let el: HTMLDivElement | undefined = $state()

  $effect(() => {
    void when // re-run collision check whenever the trigger changes
    detectCollision()
  })

  function detectCollision() {
    if (!el || !what) return
    const obstacle = el.getBoundingClientRect()
    // shrink the hitbox by 25% per side so near-misses feel fair
    const padX = obstacle.width * 0.25
    const padY = obstacle.height * 0.25
    const didCollide =
      obstacle.left + padX < what.right &&
      obstacle.right - padX > what.left &&
      obstacle.bottom - padY > what.top &&
      obstacle.top + padY < what.bottom
    if (didCollide) {
      soWhat()
    }
  }
</script>

<div
  bind:this={el}
  class="obstacle-shadow"
  style="position: absolute; left: {x}px; top: {y}px; animation: moveDown 10s linear forwards; animation-play-state: {isMoving ? 'running' : 'paused'}"
>
  <img src={tree.src} width={tree.width} height={tree.height} alt="" />
</div>
