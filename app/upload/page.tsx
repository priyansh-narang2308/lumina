"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  RefreshCw,
  Play,
  Layers,
} from "lucide-react";
import {
  SecureUploader,
  type UploadResultPayload,
} from "@/components/upload/SecureUploader";
import { PipelineStatus } from "@/components/pipeline/PipelineStatus";
import { BeforeAfter } from "@/components/assets/BeforeAfter";
import { ScoreGauge } from "@/components/assets/ScoreGauge";
import { AssetFamily } from "@/components/assets/AssetFamily";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AssetFamilyUrls } from "@/types/audit";

const DEMO_PRESETS = [
  {
    id: "saree",
    title: "Handwoven Saree",
    issue: "Cluttered bedsheet & camera glare",
    initialScore: 44,
    expectedScore: 93,
    badge: "Auto-Repair (Background + Lighting)",
  },
  {
    id: "brass",
    title: "Antique Brass Deity",
    issue: "Dark workshop & harsh shadow",
    initialScore: 52,
    expectedScore: 94,
    badge: "Auto-Repair (Studio Pedestal)",
  },
  {
    id: "leather",
    title: "Artisan Leather Bag",
    issue: "Clean lighting & plain backdrop",
    initialScore: 90,
    expectedScore: 90,
    badge: "Direct Pass (Pristine Quality)",
  },
  {
    id: "watermark",
    title: "Copyrighted Stock Photo",
    issue: "Stock watermark detected",
    initialScore: 55,
    expectedScore: 0,
    badge: "Strict Safety Gate Rejection",
  },
];

export default function UploadStudioPage() {
  const [activeAssetId, setActiveAssetId] = React.useState<string | null>(null);
  const [eventsUrl, setEventsUrl] = React.useState<string | null>(null);
  const [compiling, setCompiling] = React.useState<boolean>(false);
  const [completedResult, setCompletedResult] = React.useState<Record<
    string,
    unknown
  > | null>(null);
  const [rawUpload, setRawUpload] = React.useState<UploadResultPayload | null>(
    null,
  );

  const handleTriggerLivePipeline = async (upload: UploadResultPayload) => {
    setCompiling(true);
    setCompletedResult(null);
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          publicId: upload.publicId,
          secureUrl: upload.secureUrl,
          format: upload.format,
          bytes: upload.bytes,
          width: upload.width,
          height: upload.height,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveAssetId(data.assetId);
        setEventsUrl(data.eventsUrl);
      }
    } catch (err) {
      console.error("Failed to start live pipeline:", err);
    }
  };

  const handleTriggerPreset = async (scenario: string) => {
    setCompiling(true);
    setCompletedResult(null);
    try {
      const res = await fetch("/api/pipeline/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario, speedMultiplier: 1.2 }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveAssetId(data.assetId);
        setEventsUrl(data.eventsUrl);
      }
    } catch (err) {
      console.error("Failed to start preset demo:", err);
    }
  };

  const handleReset = () => {
    setActiveAssetId(null);
    setEventsUrl(null);
    setCompiling(false);
    setCompletedResult(null);
    setRawUpload(null);
  };

  const familyUrls = completedResult?.familyUrls as AssetFamilyUrls | undefined;
  const verification = completedResult?.verification as
    | Record<string, unknown>
    | undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase">
              Autonomous Ingestion Studio
            </span>
            <span className="text-xs text-muted-foreground">
              • Track 1: AI Media Pipelines
            </span>
          </div>
          <h1 className="mt-1.5 font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Commerce Media Compiler Studio
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Upload raw smartphone photos of artisanal products or launch 1-click
            benchmarks to watch Lumina audit, repair, verify, and compile 5
            omnichannel catalog assets.
          </p>
        </div>

        {compiling && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="gap-2"
          >
            <RefreshCw className="size-3.5" />
            <span>New Ingestion</span>
          </Button>
        )}
      </div>

      {!compiling && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Option A: Upload Raw Artisan Photography
              </h2>

              <SecureUploader
                onUploadSuccess={(result) => {
                  setRawUpload(result);
                  handleTriggerLivePipeline(result);
                }}
              />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Option B: 1-Click Demo Benchmarks
                </h2>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Zero Network Quota
                </Badge>
              </div>

              <div className="space-y-2.5">
                {DEMO_PRESETS.map((preset) => (
                  <Card
                    key={preset.id}
                    onClick={() => handleTriggerPreset(preset.id)}
                    className="cursor-pointer border-border/70 bg-card/60 p-3.5 transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                            {preset.title}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Score: {preset.initialScore} →{" "}
                            {preset.expectedScore || "Reject"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {preset.issue}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium hidden sm:inline-flex"
                        >
                          {preset.badge}
                        </Badge>
                        <Button
                          size="icon-xs"
                          variant="ghost"
                          className="rounded-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                        >
                          <Play className="size-3 fill-current" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {compiling && activeAssetId && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <PipelineStatus
            assetId={activeAssetId}
            initialEventsUrl={eventsUrl || undefined}
            onComplete={(data) => {
              console.log("[Studio] Compilation completed:", data);
              setCompletedResult(data);
            }}
          />

          {completedResult && familyUrls && (
            <div className="space-y-10 pt-6 border-t border-border/60 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <Sparkles className="size-3.5" />
                    <span>Autonomous Compilation Complete</span>
                  </div>
                  <h2 className="mt-2 font-heading text-xl sm:text-2xl font-bold text-foreground">
                    Verified Commerce Catalog Assets
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <Link href="/assets">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Layers className="size-3.5" />
                      <span>View in Catalog</span>
                    </Button>
                  </Link>
                  <Button size="sm" onClick={handleReset} className="gap-2">
                    <Sparkles className="size-3.5" />
                    <span>Compile Another Image</span>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Before vs After Comparison
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      Drag handle to inspect
                    </span>
                  </div>
                  <BeforeAfter
                    beforeUrl={
                      rawUpload?.secureUrl ||
                      "https://res.cloudinary.com/drntwxfcc/image/upload/main-sample.jpg"
                    }
                    afterUrl={familyUrls.hero}
                    beforeScore={
                      typeof verification?.scoreBefore === "number"
                        ? verification.scoreBefore
                        : 44
                    }
                    afterScore={
                      typeof verification?.scoreAfter === "number"
                        ? verification.scoreAfter
                        : 93
                    }
                  />
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Audit & Quality Gate
                  </h3>
                  <ScoreGauge
                    scoreBefore={
                      typeof verification?.scoreBefore === "number"
                        ? verification.scoreBefore
                        : 44
                    }
                    scoreAfter={
                      typeof verification?.scoreAfter === "number"
                        ? verification.scoreAfter
                        : 93
                    }
                  />
                </div>
              </div>

              <AssetFamily familyUrls={familyUrls} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
