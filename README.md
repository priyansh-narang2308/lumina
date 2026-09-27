# Lumina - Autonomous Commerce Media Compiler

Lumina is an autonomous commerce media compilation pipeline designed for the Cloudinary AI Hackathon 2026. The platform programmatically converts raw, informal merchant product photography into studio-grade, multi-channel commerce media assets using closed-loop multimodal verification, Cloudinary generative and photometric transformations, and Cloudinary Lucene-indexed discovery.

## Live Demonstration

- **Web Application**: https://lumina-cloudinary.vercel.app/

## Problem Statement and Motivation

### The Problem
Independent sellers, local artisans, and direct-to-consumer merchants generate high-quality physical goods but rarely possess professional studio photography setups. Their catalog imagery often originates from smartphone cameras under non-standardized conditions: harsh shadows, inconsistent color temperatures, distracting backgrounds, and mismatched aspect ratios. 

In e-commerce, media quality directly correlates with conversion rates and customer trust. Standard industry remedies, however, present critical trade-offs:
- **Manual Post-Production**: Professional studio photography and graphic design retouching cost between $15 and $50 per SKU, with turnaround times spanning days. This creates an insurmountable barrier for small-to-medium catalogs.
- **Unconstrained Generative AI**: Off-the-shelf diffusion models often hallucinate or modify core product features—distorting fabric textures, altering logos, or changing item geometry. This introduces high return rates and customer dissatisfaction.
- **Static Cropping and Resizing**: Traditional rule-based image processing either clips essential product features or creates awkward whitespace letterboxing.

### Motivation
Lumina was built to solve this dilemma by treating media ingestion as a deterministic compilation process. The objective was not to replace the product, but to compile its presentation: isolating the physical item, normalizing illumination, synthesizing contextual studio environments, generating multi-platform responsive variants, and enforcing automated quality control before publication.

---

## Key Architectural Decisions

### 1. Closed-Loop Dual Multimodal Audit Pipeline
- **Decision**: Implemented an automated pre-transformation audit and post-transformation verification cycle using Google Gemini 1.5 Pro.
- **Rationale**: Generative models cannot be trusted blindly in production commerce. By evaluating the raw image upfront, the system identifies precise technical defects (contrast, framing, clutter) and determines the exact transformation recipe required. The post-transformation audit verifies that the generated asset meets minimum commerce standards and that product integrity remains intact. Assets failing verification are routed to a human review queue rather than reaching the live catalog.

### 2. Edge-Level Image Processing via Cloudinary vs. GPU Microservices
- **Decision**: Delegated segmentation, background replacement, outpainting, and photometric enhancements directly to Cloudinary URL-based transformation primitives rather than hosting dedicated PyTorch/TensorFlow GPU inference workers.
- **Rationale**: Managing GPU infrastructure incurs high baseline costs, cold-start delays, and complex auto-scaling logic. Cloudinary offloads transformation execution to globally distributed edge nodes, applying hardware-accelerated algorithms on demand and caching derived variants at the CDN layer. This drastically simplifies the backend architecture while reducing compute overhead.

### 3. Media-Layer Structured Metadata and Lucene Search vs. Relational-Only Indexing
- **Decision**: Wrote quality scores, audit rationale, and product classifications directly into Cloudinary Structured Metadata (`cld-metadata`) and used the Cloudinary Search API (`cloudinary.search()`) as the primary discovery mechanism.
- **Rationale**: Decoupling catalog search from relational database queries eliminates database bottlenecks under search-heavy traffic. Storing audit attributes directly on the media record guarantees data locality: an asset carries its own compliance score, aspect ratios, and visual tags wherever it is served. The Lucene engine enables sub-100ms multi-facet filtering across visual quality metrics without cross-table SQL joins.

### 4. Asynchronous Pipeline Orchestration with Server-Sent Events (SSE)
- **Decision**: Built the ingestion pipeline on an event-driven architecture that communicates execution milestones to the client via Server-Sent Events (`/api/events`).
- **Rationale**: Generative background replacement and multimodal audits involve dynamic latencies between 2 and 6 seconds. A synchronous blocking HTTP request introduces timeout risks on serverless platforms. SSE delivers lightweight, unidirectional real-time progress updates (Ingestion, Primary Audit, Transformation, Secondary Audit, Catalog Publishing) without the polling overhead of REST or the stateful infrastructure demands of full-duplex WebSockets.

---

## System Architecture

```mermaid
graph TD
    A[Raw Merchant Capture] -->|Signed Stream Upload| B(Cloudinary Ingestion)
    B --> C[Gemini 1.5 Pro: Primary Audit]
    C -->|Score >= 85| D[Bypass Transforms: Ready]
    C -->|Score < 50| E[Automated Rejection]
    C -->|Score 50-84| F[Cloudinary Transformation Pipeline]

    subgraph Transformation Pipeline
        F --> G[e_gen_background_replace: Studio Synthesis]
        G --> H[c_pad, b_gen_fill: Aspect Ratio Outpainting]
        H --> I[c_auto, g_auto: Content-Aware Saliency Crop]
        I --> J[e_improve, e_viesus_correct: Photometric Calibration]
    end

    J --> K[Gemini 1.5 Pro: Verification Audit]
    K -->|Pass: Delta Verified| D
    K -->|Fail: Defect Persists| L[Quarantine / Manual Review]

    D --> M[Attach Structured Metadata cld-metadata]
    M --> N[Cloudinary Lucene Index Engine]
    N --> O[Multi-Channel CDN Delivery: AVIF / WebP / HLS]
```

---

## Cloudinary Implementation Details

Lumina utilizes 10 core Cloudinary primitives across ingestion, generation, optimization, and search:

1. **Signed Direct Upload Stream** (`cloudinary.uploader.upload_stream`): Handles authenticated, chunked media streaming directly to Cloudinary storage using server-generated HMAC-SHA1 signatures, preventing API secret exposure to the client.
2. **Generative Background Replacement** (`e_gen_background_replace`): Uses semantic segmentation to isolate the foreground product and synthesizes clean, contextual studio backgrounds based on product categories.
3. **Generative Fill and Expansion** (`c_pad, b_gen_fill`): Outpaints square or vertical images into standardized aspect ratios (such as 9:16 social formats or 16:9 banners) without distortion or stretching.
4. **Photometric Restoration** (`e_improve:outdoor`, `e_viesus_correct`): Calibrates white balance, dynamic range, and tonal balance to correct uncalibrated mobile camera sensors.
5. **Content-Aware Saliency Cropping** (`c_auto, g_auto`): Automatically identifies the primary subject bounding box, producing square and portrait crops that keep the merchandise centered.
6. **Programmatic Edge Badging** (`l_text`, `fl_relative`): Dynamically renders compliance and quality badges onto preview assets at the CDN layer.
7. **Structured Metadata Schema** (`cld-metadata`): Stores strongly typed attributes (e.g., initial quality score, final quality score, verified status, product category) directly within Cloudinary asset records.
8. **Lucene Search Integration** (`cloudinary.search()`): Executes low-latency queries against metadata fields, enabling multi-attribute filtering (e.g., quality scores, tags, dimensions) across the catalog.
9. **Automatic Format and Quality Optimization** (`f_auto, q_auto`): Negotiates content delivery formats (AVIF, WebP) and compression rates dynamically based on client device and network conditions.
10. **Adaptive Video Streaming** (`sp_auto`): Compiles product presentation clips into multi-bitrate HLS streaming profiles (`.m3u8`) for seamless playback across variable bandwidths.

---

## Technology Stack

- **Framework**: Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript
- **Media Engine**: Cloudinary Node.js SDK & Generative AI Transformation API
- **Vision and Auditing**: Google Gemini 1.5 Pro via Google Generative AI SDK
- **Database & ORM**: PostgreSQL via Neon Serverless, Prisma ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel Edge Network

---

## Setup and Installation

### Prerequisites

- Node.js 18 or later
- Cloudinary Account (Cloud Name, API Key, API Secret)
- Google AI Studio API Key (Gemini 1.5 Pro)
- PostgreSQL Database Connection String

### Installation

1. Clone the repository:

```bash
git clone https://github.com/priyansh-narang2308/pixels-to-products-cloudinary-ai-hackathon-2026-narcos.git
cd pixels-to-products-cloudinary-ai-hackathon-2026-narcos
```

2. Install dependencies:

```bash
npm install
```

3. Configure Environment Variables:

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
CLOUDINARY_ANALYZE_ENABLED=true

DATABASE_URL=your_postgresql_database_url
DIRECT_URL=your_postgresql_direct_url

GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Initialize the database schema:

```bash
npx prisma generate
npx prisma db push
```

5. Run the local development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## Operational Workflow

1. **Ingest**: Upload raw product photography via the Ingestion Studio.
2. **Pre-Audit**: The system evaluates image clarity, illumination balance, and background composition via Gemini 1.5 Pro.
3. **Transform**: If score is between 50 and 84, the Cloudinary generative pipeline synthesizes a clean studio environment, out-paints bounds, and calibrates lighting.
4. **Verify**: A post-transform multimodal audit evaluates the finished asset to ensure fidelity and compliance.
5. **Catalog & Search**: Approved media is indexed in Cloudinary with structured metadata facets, accessible via Lucene-backed full-text search.
6. **Analytics**: The Executive Analytics dashboard tracks system throughput, quality score deltas, and transformation yield rates.
