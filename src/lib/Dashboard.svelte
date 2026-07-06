<script lang="ts">
  import { toggleMusicMuted, toggleMusicTrack } from './audio'

  let { info }: { info: any } = $props()

  let musicMuted = $state(false)

  const nextTrack = () => {
    toggleMusicTrack()
  }
</script>

<div class="flex flex-col items-start gap-1">
  <div>{`Distance: ${info.distance}`}</div>
  <div>{`Lives: ${info.livesRemainingState}`}</div>
  <div class="flex flex-row gap-2 pt-1">
    <button
      aria-label={musicMuted ? 'Unmute music' : 'Mute music'}
      class="rounded-lg border-2 border-stone-800 p-1 hover:bg-stone-800"
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
    <button
      aria-label="Next music track"
      title="Switch background music"
      class="rounded-lg border-2 border-stone-800 p-1 hover:bg-stone-800"
      onclick={nextTrack}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="5 4 15 12 5 20 5 4" />
        <line x1="19" y1="5" x2="19" y2="19" />
      </svg>
    </button>
  </div>
</div>
