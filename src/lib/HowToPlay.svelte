<script lang="ts">
  let { onDismiss }: { onDismiss: () => void } = $props()
</script>

<!-- Intro modal: explains the controls; shown until dismissed. -->
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
  <div class="mx-4 max-w-md rounded-lg border-2 border-fuchsia-600 bg-black p-6 text-center">
    <h1 class="pb-4 text-2xl font-extrabold">GHOST WHEEL</h1>
    <ol class="flex flex-col gap-3 pb-6 text-left text-sm">
      <li>1. Allow camera access — your hands are the controller.</li>
      <li>2. Hold <span class="font-bold">both hands</span> up to the webcam, like gripping a steering wheel.</li>
      <li>3. Tilt your hands to steer the truck.</li>
      <li>4. Dodge the falling trees. You have 4 lives.</li>
      <li>5. Drop your hands any time to pause.</li>
    </ol>
    <button
      class="rounded-lg border-2 border-fuchsia-600 px-6 py-2 font-bold hover:bg-fuchsia-600"
      onclick={onDismiss}
    >
      Let's drive
    </button>
  </div>
</div>
