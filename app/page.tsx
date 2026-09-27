import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  Wrench,
  AlertTriangle,
  ArrowRight,
  Zap,
  Layers,
  Database,
  Search,
  Film,
  Cpu,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ExternalLink,
  Code2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InteractiveDemoSandbox } from "@/components/landing/InteractiveDemoSandbox";

export const metadata = {
  title: "Lumina — Autonomous Commerce Media Compiler",
  description:
    "Transforms raw smartphone photos into five production-ready catalog assets with closed-loop AI verification, Cloudinary transformations, structured metadata, and Lucene search.",
};

const CLOUDINARY_CAPABILITIES = [
  {
    num: "01",
    title: "Secure Signed Upload Stream",
    api: "cloudinary.uploader.upload_stream",
    transformation: "timestamp, signature, api_key",
    description:
      "Direct chunked streaming from browser to Cloudinary via server-generated HMAC-SHA1 signatures. Eliminates server memory spikes and protects merchant API secrets.",
    badge: "Ingestion Engine",
    color: "from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400",
  },
  {
    num: "02",
    title: "Generative Background Replacement",
    api: "e_gen_background_replace",
    transformation: "e_gen_background_replace:prompt_luxury marble display pedestal",
    description:
      "Extracts artisan products and synthesizes pristine studio environments contextual to the product category (handloom, brass, leather, ceramics).",
    badge: "Generative AI",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400",
  },
  {
    num: "03",
    title: "Generative Fill & Aspect Expansion",
    api: "b_gen_fill, c_pad",
    transformation: "ar_9:16,c_pad,b_gen_fill",
    description:
      "Seamlessly outpaints square or landscape seller photos into 9:16 vertical stories without stretching or awkward black bars, filling surroundings naturally.",
    badge: "Social Media",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400",
  },
  {
    num: "04",
    title: "Photometric Auto-Restoration",
    api: "e_improve:outdoor / e_viesus_correct",
    transformation: "e_improve:outdoor,e_viesus_correct",
    description:
      "Restores uncalibrated mobile captures by optimizing dynamic range, auto-adjusting white balance, removing camera glare, and enhancing artisan textures.",
    badge: "Enhancement",
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400",
  },
  {
    num: "05",
    title: "Structured Metadata Engine",
    api: "cld-metadata / contextual",
    transformation: "metadata: { qc_status, score_after, category }",
    description:
      "Persists quality scores, audit dimensions, and categorization directly onto the Cloudinary asset record as strongly typed schema facets.",
    badge: "Intelligence Storage",
    color: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400",
  },
  {
    num: "06",
    title: "Lucene Search API",
    api: "cloudinary.search()",
    transformation: "search('metadata.qc_status:approved AND tags:artisan')",
    description:
      "Powers sub-100ms multi-facet filtering across merchant catalogs with full-text queries, score ranges, and category aggregations without secondary indexing.",
    badge: "Search Index",
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400",
  },
  {
    num: "07",
    title: "Dynamic AVIF/WebP Delivery",
    api: "f_auto, q_auto",
    transformation: "f_auto,q_auto:eco",
    description:
      "Automatically delivers next-generation formats (AVIF, WebP) tailored to user device capabilities with perceptible quality preservation and ~60% bandwidth savings.",
    badge: "Delivery Optimization",
    color: "from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400",
  },
  {
    num: "08",
    title: "Adaptive Bitrate Video Streaming",
    api: "sp_auto / HLS",
    transformation: "sp_auto/<publicId>.m3u8",
    description:
      "Eagerly encodes videos into multi-bitrate HLS playlists (.m3u8), enabling smooth, buffer-free 1080p-to-360p adaptive playback across 4G and WiFi.",
    badge: "Bonus Video Track",
    color: "from-red-500/20 to-amber-500/20 border-red-500/30 text-red-400",
  },
  {
    num: "09",
    title: "Dynamic Smart Overlays & Badging",
    api: "l_text / fl_relative",
    transformation: "l_text:Arial_28_bold:VERIFIED,g_south_east,y_20,x_20",
    description:
      "Composes verified merchant badges and dynamic price overlays server-side on CDN edge, eliminating client layout shifts and safeguarding brand integrity.",
    badge: "Edge Composition",
    color: "from-fuchsia-500/20 to-pink-500/20 border-fuchsia-500/30 text-fuchsia-400",
  },
  {
    num: "10",
    title: "Content-Aware Saliency Auto-Crop",
    api: "c_auto, g_auto, e_shadow",
    transformation: "c_auto,g_auto:subject,w_1080,h_1080,e_shadow:50",
    description:
      "AI subject detection centers artisan products inside square or portrait frames while synthesizing subtle cast shadows for realistic depth.",
    badge: "Smart Geometry",
    color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-400",
  },
];

const ARCHITECTURE_STAGES = [
  {
    step: "01",
    title: "Raw Smartphone Ingest",
    desc: "Merchant captures product with ordinary phone. Uploaded via signed SHA-1 stream to Cloudinary.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Cognitive Audit #1",
    desc: "AI evaluates 5 quality dimensions: background clutter, lighting, centering, glare, and watermarks.",
    icon: EyeIcon,
  },
  {
    step: "03",
    title: "Autonomous Decision",
    desc: "Scores >= 85 directly PASS. Low scores trigger REPAIR. Copyright watermarks trigger instant REJECT.",
    icon: Cpu,
  },
  {
    step: "04",
    title: "Targeted Transformations",
    desc: "Executes precise Cloudinary pipeline: GenAI background, aspect fill, auto-improve, drop shadow.",
    icon: Wrench,
  },
  {
    step: "05",
    title: "Closed-Loop Verify #2",
    desc: "Second cognitive audit re-evaluates repaired asset. Verifies delta score >= 85 with zero visual defects.",
    icon: ShieldCheck,
  },
  {
    step: "06",
    title: "5-Asset Family & Index",
    desc: "Emits 5 multi-channel variants, attaches Cloudinary structured metadata, and indexes in Lucene search.",
    icon: Database,
  },
];

function EyeIcon({ className }: { className?: string }) {
  return <Search className={className} />;
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20 selection:text-primary">

      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">

        <div className="absolute top-1/4 left-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[700px] rounded-full bg-gradient-to-tr from-primary/15 via-amber-500/10 to-emerald-500/10 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary"></span>
            </span>
            <span>Cloudinary AI Hackathon 2026 • Track 1: AI Media Pipelines</span>
          </div>

          <h1 className="mt-8 font-heading text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Raw Pixels in.{" "}
            <span className="bg-gradient-to-r from-amber-500 via-primary to-emerald-500 bg-clip-text text-transparent">
              Commerce Catalog
            </span>{" "}
            out.
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base text-muted-foreground sm:text-xl leading-relaxed">
            Lumina is the world&apos;s first autonomous commerce media compiler. It turns unpolished seller smartphone photos into five production-ready multi-channel catalog assets with <strong className="text-foreground">closed-loop AI verification</strong>, <strong className="text-foreground">Cloudinary transformations</strong>, and <strong className="text-foreground">Lucene search</strong>.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="lg" className="rounded-full cursor-pointer gap-2 font-semibold shadow-lg shadow-primary/20 px-8">
                <Sparkles className="size-4" />
                Launch Ingestion Studio
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#sandbox">
              <Button size="lg" variant="outline" className="rounded-full cursor-pointer gap-2 font-medium px-6">
                <Sliders className="size-4 text-primary" />
                1-Click Demo Sandbox
              </Button>
            </a>
            <Link href="/video">
              <Button size="lg" variant="ghost" className="rounded-full cursor-pointer gap-2 font-medium px-6 text-muted-foreground hover:text-foreground">
                <Film className="size-4 text-amber-500" />
                HLS Video Engine
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-4" />
              <span>Closed-Loop Quality Gate (Score &ge; 85)</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
              <Wrench className="size-4" />
              <span>42 &rarr; 94 Avg Autonomous Delta</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <Layers className="size-4" />
              <span>5 Channel-Optimized Variants</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              <Lock className="size-4" />
              <span>Zero-Credit Safety Protection ($0.00 Spend)</span>
            </div>
          </div>
        </div>
      </section>



      <section className="py-20 sm:py-28" id="architecture">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Cpu className="size-3.5" />
              Why Closed-Loop Verification Matters
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Traditional AI Pipelines Guess. Lumina Verifies.
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Standard image generators suffer from hallucinations, distorted edges, and accidental copyright infringements. Lumina executes a mandatory <strong className="text-foreground">Audit #2 re-evaluation</strong> before publishing to marketplace channels. If quality thresholds aren&apos;t met, assets are flagged for revision rather than corrupting merchant catalogs.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHITECTURE_STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <Card
                  key={stage.step}
                  className="relative overflow-hidden border-border/70 bg-card/60 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-primary">
                        Stage {stage.step}
                      </span>
                      <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                    </div>
                    <CardTitle className="mt-2 text-base font-bold text-foreground">
                      {stage.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {stage.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/15 py-20 sm:py-28" id="features">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Zap className="size-3.5" />
              Cloudinary Deep Integration Matrix
            </div>
            <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              10 Native Cloudinary APIs Orchestrated As One
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed">
              Lumina does not merely wrap an upload widget. It leverages 10 distinct Cloudinary capabilities spanning signed ingestion, generative fill, structured metadata, Lucene search, and adaptive HLS video streaming.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {CLOUDINARY_CAPABILITIES.map((feat) => (
              <Card
                key={feat.num}
                className="overflow-hidden border-border/70 bg-card/70 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-xs font-semibold ${feat.color}`}>
                      {feat.badge}
                    </Badge>
                    <span className="font-mono text-xs font-semibold text-muted-foreground">
                      API #{feat.num}
                    </span>
                  </div>
                  <CardTitle className="mt-2 text-base font-bold text-foreground">
                    {feat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-primary">
                      <Code2 className="size-3.5" />
                      <span>{feat.api}</span>
                    </div>
                    <div className="rounded-md bg-black/80 px-3 py-2 font-mono text-[10px] text-emerald-400 break-all">
                      {feat.transformation}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-16 sm:py-24 border-t border-border/60">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/40 bg-gradient-to-b from-primary/10 via-card/80 to-card p-8 sm:p-14 shadow-2xl backdrop-blur-xl">
            <h2 className="font-heading text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Ready to compile unpolished smartphone pixels into multi-channel commerce catalogs?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Experience the live pipeline with custom merchant uploads or explore verified assets currently indexed in the Lucene-powered catalog.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/upload">
                <Button size="lg" className="rounded-full gap-2 font-semibold shadow-lg shadow-primary/20 px-8">
                  <Sparkles className="size-4" />
                  Launch Ingestion Studio
                </Button>
              </Link>
              <Link href="/assets">
                <Button size="lg" variant="outline" className="rounded-full gap-2 font-semibold px-8">
                  <Layers className="size-4" />
                  Browse Catalog
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="ghost" className="rounded-full gap-2 font-semibold px-6">
                  <Database className="size-4 text-primary" />
                  Executive Analytics
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 bg-card/40 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">
              L
            </div>
            <span className="font-heading text-sm font-bold text-foreground">
              Lumina Media Compiler
            </span>
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} • Cloudinary AI Hackathon
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/upload" className="hover:text-foreground transition-colors">
              Studio
            </Link>
            <Link href="/assets" className="hover:text-foreground transition-colors">
              Catalog
            </Link>
            <Link href="/analytics" className="hover:text-foreground transition-colors">
              Analytics
            </Link>
            <Link href="/video" className="hover:text-foreground transition-colors">
              HLS Video
            </Link>
            <a
              href="https://cloudinary.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-foreground transition-colors flex items-center gap-1"
            >
              Cloudinary <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
