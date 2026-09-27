/* eslint-disable react-hooks/refs */
"use client";

import * as React from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Film,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ProductVideoPlayerProps {
  publicId: string;

  hlsUrl?: string;

  mp4Url?: string;

  title?: string;

  category?: string;

  cloudName?: string;
  className?: string;
}

function buildVideoUrls(
  publicId: string,
  cloudName: string,
): { hlsUrl: string; mp4Url: string; posterUrl: string } {
  const base = `https://res.cloudinary.com/${cloudName}/video/upload`;

  const hlsUrl = `${base}/sp_auto/${publicId}.m3u8`;

  const mp4Url = `${base}/f_auto,q_auto/${publicId}.mp4`;

  const posterUrl = `${base}/so_auto,f_auto,q_auto,w_1280/${publicId}.jpg`;

  return { hlsUrl, mp4Url, posterUrl };
}

export function ProductVideoPlayer({
  publicId,
  hlsUrl,
  mp4Url,
  title = "Artisan Product Showcase",
  category = "Video Media",
  cloudName,
  className = "",
}: ProductVideoPlayerProps) {
  const resolvedCloudName = publicId.startsWith("samples/") 
    ? "demo" 
    : (cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drntwxfcc");
  const urls = buildVideoUrls(publicId, resolvedCloudName);
  const finalHlsUrl = hlsUrl || urls.hlsUrl;
  const finalMp4Url = mp4Url || urls.mp4Url;

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMuted, setIsMuted] = React.useState(true);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hlsActive, setHlsActive] = React.useState(false);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: import("hls.js").default | null = null;

    async function initHls() {
      if (!video) return;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = finalHlsUrl;
        setHlsActive(true);
        return;
      }

      try {
        const Hls = (await import("hls.js")).default;
        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });
          hls.loadSource(finalHlsUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setHlsActive(true);
            setIsLoading(false);
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              console.warn(
                "[ProductVideoPlayer] HLS fatal error, falling back to MP4:",
                data.type,
              );
              video.src = finalMp4Url;
              setHlsActive(false);
            }
          });
          return;
        }
      } catch {}

      video.src = finalMp4Url;
      setHlsActive(false);
    }

    initHls();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [finalHlsUrl, finalMp4Url]);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    video.currentTime = pct * video.duration;
  };

  const goFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <Card
      className={`border-border/70 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Film className="size-4 text-primary" />
            Adaptive Video Streaming Player
          </CardTitle>
          <div className="flex items-center gap-2">
            {hlsActive && (
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold"
              >
                HLS Adaptive
              </Badge>
            )}
            <Badge
              variant="outline"
              className="border-primary/30 bg-primary/10 text-primary text-[10px]"
            >
              Cloudinary CDN
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {title} • {category} — Adaptive bitrate via{" "}
          <code className="text-[10px] bg-muted/60 rounded px-1 py-0.5">
            sp_auto
          </code>{" "}
          streaming profile
        </p>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative group bg-black aspect-video">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={urls.posterUrl}
            muted={isMuted}
            playsInline
            preload="metadata"
          >
            <source src={finalMp4Url} type="video/mp4" />
            Your browser does not support the video element.
          </video>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <Loader2 className="size-10 text-white animate-spin" />
            </div>
          )}

          <div
            className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={togglePlay}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20">
              {isPlaying ? (
                <Pause className="size-7 text-white" />
              ) : (
                <Play className="size-7 text-white ml-1" />
              )}
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div
              className="w-full h-1.5 rounded-full bg-white/20 cursor-pointer mb-2.5 group/bar"
              onClick={handleSeek}
            >
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  className="text-white hover:text-primary transition-colors"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="size-4" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </button>
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-primary transition-colors"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="size-4" />
                  ) : (
                    <Volume2 className="size-4" />
                  )}
                </button>
                <span className="text-[11px] text-white/80 font-mono tabular-nums">
                  {formatTime(videoRef.current?.currentTime ?? 0)} /{" "}
                  {formatTime(duration)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hlsActive && (
                  <span className="text-[9px] text-emerald-400 font-semibold uppercase tracking-wider">
                    ● HLS Live
                  </span>
                )}
                <button
                  onClick={goFullscreen}
                  className="text-white hover:text-primary transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="size-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t border-border/40 bg-muted/10">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="size-3 text-primary" />
              <strong className="text-foreground">Streaming:</strong>{" "}
              {hlsActive ? "HLS (.m3u8)" : "MP4 Direct"}
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground">Profile:</strong> sp_auto
              (Full HD)
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground">CDN:</strong>{" "}
              res.cloudinary.com/{resolvedCloudName}
            </span>
            <span>•</span>
            <span>
              <strong className="text-foreground">Format:</strong> f_auto,q_auto
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
