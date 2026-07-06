<script lang="ts">
  import { InferenceEngine, CVImage } from 'inferencejs'
  import { onMount } from 'svelte'

  // The "invisible steering wheel": watches the webcam, detects your two
  // hands with a Roboflow model running in the browser, and reports how much
  // the line between them is tilted. Hold both hands up like you're gripping
  // a wheel; tilt them like turning it. The parent receives that tilt (in
  // degrees) via the setHandResults callback and moves the truck with it.
  //
  // Data flow, once per inference (~15-30x per second):
  //   webcam frame -> hand model -> two hand boxes -> tilt angle -> parent
  let { setHandResults }: { setHandResults: (result: any) => void } = $props()

  // Public Roboflow Universe hand detector with TF.js weights (mAP ~99).
  // Override via env if you train your own model.
  const MODEL_NAME = import.meta.env.VITE_ROBOFLOW_MODEL ?? 'egohands-public'
  const MODEL_VERSION = Number(import.meta.env.VITE_ROBOFLOW_MODEL_VERSION ?? 9)
  const PUBLISHABLE_KEY = import.meta.env.VITE_ROBOFLOW_PUBLISHABLE_KEY ?? ''

  let videoEl: HTMLVideoElement
  let canvasEl: HTMLCanvasElement

  onMount(() => {
    let stopped = false
    const engine = new InferenceEngine()
    let workerId: string | null = null

    const run = async () => {
      // Parent shows "LOADING" until the camera + model are ready.
      setHandResults({ isLoading: true })

      if (!PUBLISHABLE_KEY) {
        console.error('VITE_ROBOFLOW_PUBLISHABLE_KEY is not set')
        setHandResults({ isLoading: false, isDetected: false, tilt: 0, degrees: 0 })
        return
      }

      // 1. Start the webcam and wait for the first frame.
      await initVideo(videoEl)
      // 2. Download the hand-detection model and start it in a web worker
      //    (first visit fetches a few MB of weights; cached after that).
      workerId = await engine.startWorker(MODEL_NAME, MODEL_VERSION, PUBLISHABLE_KEY)
      setHandResults({ isLoading: false })

      // 3. Detection loop: infer as fast as the model allows (~15-30fps on
      //    WebGL). Each pass turns the current frame into hand boxes, then a
      //    steering angle, and draws the boxes over the video.
      while (!stopped) {
        const image = new CVImage(videoEl)
        const predictions = (await engine.infer(workerId, image)) as any[]
        processDetections(predictions)
        drawOverlay(predictions)
      }
    }
    run()

    // Component unmount: stop the loop and free the model worker.
    return () => {
      stopped = true
      if (workerId) engine.stopWorker(workerId)
    }
  })

  // Ask for camera access and pipe the stream into the <video> element.
  async function initVideo(videoElement: HTMLVideoElement) {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    })
    videoElement.srcObject = stream
    await new Promise<void>((resolve) => {
      videoElement.addEventListener(
        'loadeddata',
        () => {
          videoElement.play()
          resolve()
        },
        { once: true },
      )
    })
  }

  // Turn raw model output (bounding boxes) into the steering signal.
  // With two hands in frame, tilt is the slope of the line between the two
  // hand-box centers — hands level = 0°, right hand lower = positive angle,
  // just like the rim of a real steering wheel.
  function processDetections(predictions: any[]) {
    // Keep the two most confident hand detections; ignore anything else.
    const hands = (predictions ?? [])
      .filter((p) => p.bbox)
      .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
      .slice(0, 2)

    if (hands.length === 2) {
      // Normalize pixel coords to 0..1 so the tilt scale is
      // resolution-independent, then order the hands left/right.
      const [a, b] = hands
        .map((h) => ({ x: h.bbox.x / videoEl.videoWidth, y: h.bbox.y / videoEl.videoHeight }))
        .sort((p, q) => p.x - q.x)

      // Slope of the line between the hands -> angle in degrees.
      const tilt = (b.y - a.y) / (b.x - a.x)
      const degrees = (Math.atan(tilt) * 180) / Math.PI

      setHandResults({
        isDetected: true,
        tilt,
        degrees,
      })
    } else {
      // Fewer than two hands = no grip on the wheel; the game pauses.
      setHandResults({
        isDetected: false,
        tilt: 0,
        degrees: 0,
      })
    }
  }

  // Draw the detected hand boxes on the canvas that sits over the video,
  // so you can see what the model sees.
  function drawOverlay(predictions: any[]) {
    if (!canvasEl) return
    canvasEl.width = videoEl.videoWidth
    canvasEl.height = videoEl.videoHeight
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height)
    ctx.lineWidth = 3
    for (const p of predictions ?? []) {
      if (!p.bbox) continue
      ctx.strokeStyle = p.color ?? '#00FFCE'
      // Model boxes are center-based; canvas rects are corner-based.
      ctx.strokeRect(p.bbox.x - p.bbox.width / 2, p.bbox.y - p.bbox.height / 2, p.bbox.width, p.bbox.height)
    }
  }
</script>

<!-- Webcam preview with the detection boxes overlaid; both are CSS-mirrored
     so it feels like a selfie cam. -->
<div class="relative">
  <!-- svelte-ignore a11y_media_has_caption -->
  <video class="-scale-x-100 border-2 border-stone-800 rounded-lg" bind:this={videoEl}></video>
  <canvas class="-scale-x-100 absolute inset-0 h-full w-full" bind:this={canvasEl}></canvas>
</div>
