<script lang="ts">
  import { toggleMusicMuted, isMusicMuted, onMuteChange } from './audio'

  let { onDismiss }: { onDismiss: () => void } = $props()

  let musicMuted = $state(isMusicMuted())

  // Stay in sync if mute is toggled elsewhere (e.g. the dashboard).
  $effect(() => onMuteChange((m) => (musicMuted = m)))
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
    <div class="flex flex-row items-center justify-center gap-3">
      <button
        class="rounded-lg border-2 border-fuchsia-600 px-6 py-2 font-bold hover:bg-fuchsia-600"
        onclick={onDismiss}
      >
        Let's drive
      </button>
      <button
        aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
        title={musicMuted ? 'Music is off' : 'Music is on'}
        class="rounded-lg border-2 border-stone-700 p-2 hover:bg-stone-800"
        onclick={() => (musicMuted = toggleMusicMuted())}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          {#if musicMuted}
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          {:else}
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          {/if}
        </svg>
      </button>
    </div>
  </div>
</div>
