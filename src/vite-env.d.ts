/// <reference types="svelte" />
/// <reference types="vite/client" />

// inferencejs ships type definitions its package.json "exports" doesn't expose;
// minimal declarations for the API surface we use.
declare module 'inferencejs' {
    export class CVImage {
        constructor(image: HTMLVideoElement | HTMLImageElement | ImageBitmap);
    }
    export interface RFObjectDetectionPrediction {
        class?: string;
        confidence?: number;
        bbox?: { x: number; y: number; width: number; height: number };
        color?: string;
    }
    export class InferenceEngine {
        constructor(url?: string);
        startWorker(modelName: string, modelVersion: number, publishableKey: string, options?: unknown[]): Promise<string>;
        stopWorker(workerId: string): Promise<boolean>;
        infer(workerId: string, img: ImageBitmap | CVImage, options?: unknown[] | null): Promise<RFObjectDetectionPrediction[]>;
    }
}
