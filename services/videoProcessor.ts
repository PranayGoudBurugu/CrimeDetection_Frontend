import { ThreatDetection } from '../types';
import * as Mp4Muxer from 'mp4-muxer';

const getSeverityColor = (severity: string): string => {
    switch (severity?.toUpperCase()) {
        case 'CRITICAL': return '#ef4444';
        case 'HIGH': return '#f97316';
        case 'MEDIUM': return '#eab308';
        case 'LOW': return '#22c55e';
        default: return '#22d3ee';
    }
};

export const generateAnnotatedVideo = async (
    videoFile: File,
    segments: ThreatDetection[],
    incidentSummary: string,
    onProgress: (msg: string) => void
): Promise<{ blob: Blob, extension: string }> => {
    return new Promise(async (resolve, reject) => {
        try {
            onProgress('Initializing Fast Recorder...');

            // 1. Setup Video Source
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = URL.createObjectURL(videoFile);
            video.muted = true;
            video.playsInline = true;
            video.style.display = 'none';
            document.body.appendChild(video);

            await new Promise(r => { video.onloadedmetadata = r; });

            const width = video.videoWidth & ~1;
            const height = video.videoHeight & ~1;
            const duration = video.duration;

            // 2. Setup Canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true })!;

            // 3. Setup Muxer & Encoder
            const muxer = new Mp4Muxer.Muxer({
                target: new Mp4Muxer.ArrayBufferTarget(),
                video: {
                    codec: 'avc',
                    width,
                    height
                },
                fastStart: 'in-memory',
                firstTimestampBehavior: 'offset',
            });

            const videoEncoder = new VideoEncoder({
                output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
                error: (e) => console.error(e)
            });

            videoEncoder.configure({
                codec: 'avc1.42001f',
                width,
                height,
                bitrate: 4_000_000,
                framerate: 30,
            });

            // 4. Playback Capture Loop
            onProgress('Processing frames (High Quality)...');

            video.defaultPlaybackRate = 2.5;
            video.playbackRate = 2.5;

            let frameCount = 0;

            const process = async (now: number, metadata: any) => {
                if (video.ended) return;

                const currentTime = metadata.mediaTime;

                // Draw Frame
                ctx.drawImage(video, 0, 0, width, height);

                // Draw Threat Overlay
                const activeSegment = segments.find(
                    s => currentTime >= s.startTime && currentTime < s.endTime
                );

                if (activeSegment) {
                    const barHeight = height * 0.22;
                    const barY = height - barHeight;
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                    ctx.fillRect(0, barY, width, barHeight);

                    // Severity indicator bar at top of overlay
                    const severityColor = getSeverityColor(activeSegment.severity);
                    ctx.fillStyle = severityColor;
                    ctx.fillRect(0, barY, width, 3);

                    // Threat type
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    ctx.font = `bold ${Math.floor(height * 0.045)}px Arial`;
                    ctx.fillText(`⚠ ${activeSegment.threatType}`, width * 0.05, barY + barHeight * 0.3);

                    // Alert category
                    ctx.fillStyle = severityColor;
                    ctx.font = `bold ${Math.floor(height * 0.03)}px Arial`;
                    ctx.fillText(`[${activeSegment.alertCategory}]`, width * 0.05, barY + barHeight * 0.6);

                    // Severity badge
                    ctx.fillStyle = severityColor;
                    ctx.textAlign = 'right';
                    ctx.font = `bold ${Math.floor(height * 0.035)}px Arial`;
                    ctx.fillText(`${activeSegment.severity} SEVERITY`, width * 0.95, barY + barHeight * 0.45);
                }

                // Encode Frame
                const bitmap = await createImageBitmap(canvas);
                const frame = new VideoFrame(bitmap, { timestamp: currentTime * 1_000_000 });
                videoEncoder.encode(frame, { keyFrame: frameCount % 60 === 0 });
                frame.close();
                bitmap.close();

                frameCount++;
                if (frameCount % 30 === 0) {
                    const pct = (currentTime / duration) * 100;
                    onProgress(`Processing: ${Math.floor(pct)}%`);
                }

                if (!video.ended && !video.paused) {
                    (video as any).requestVideoFrameCallback(process);
                }
            };

            // Start processing
            (video as any).requestVideoFrameCallback(process);
            await video.play();

            // Wait for video end
            await new Promise<void>((resolve) => {
                video.onended = () => resolve();
                const check = setInterval(() => {
                    if (video.ended) {
                        clearInterval(check);
                        resolve();
                    }
                }, 500);
            });

            // 5. End Card - Incident Report
            onProgress('Adding Incident Report...');
            const endCardDuration = 5;
            const endCardFrames = endCardDuration * 30;

            ctx.fillStyle = '#080c14';
            ctx.fillRect(0, 0, width, height);
            ctx.fillStyle = '#22d3ee';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.floor(height * 0.08)}px Arial`;
            ctx.fillText('Incident Report', width / 2, height * 0.2);
            ctx.fillStyle = '#94a3b8';
            ctx.font = `${Math.floor(height * 0.035)}px Arial`;

            const words = incidentSummary.split(' ');
            let line = '';
            let y = height * 0.4;
            const maxWidth = width * 0.8;
            const lineHeight = height * 0.05;

            for (let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, width / 2, y);
                    line = words[n] + ' ';
                    y += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, width / 2, y);

            const startTs = duration * 1_000_000;
            const endCardBitmap = await createImageBitmap(canvas);
            for (let j = 0; j < endCardFrames; j++) {
                const timestamp = startTs + (j / 30) * 1_000_000;
                const frame = new VideoFrame(endCardBitmap, { timestamp });
                videoEncoder.encode(frame, { keyFrame: j === 0 });
                frame.close();
            }
            endCardBitmap.close();

            await videoEncoder.flush();
            muxer.finalize();

            const { buffer } = muxer.target;
            const blob = new Blob([buffer], { type: 'video/mp4' });

            // Cleanup
            document.body.removeChild(video);
            URL.revokeObjectURL(video.src);

            resolve({ blob, extension: 'mp4' });

        } catch (e: any) {
            console.error(e);
            reject(new Error("Fast generation failed: " + e.message));
        }
    });
};
