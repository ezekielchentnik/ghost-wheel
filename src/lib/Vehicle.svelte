<script lang="ts">
  let { degrees }: { degrees: number } = $props()
</script>

<div class="vehicle-shadow">
  <!-- sprite faces up, so steering tilt is the only rotation -->
  <img
    src="/vehicle.png"
    width="96"
    height="96"
    alt=""
    style="transform: rotate({-degrees / 3}deg); transition: all; animation-duration: 10ms"
  />
</div>
