# Lumina - Autonomous Commerce Media Compiler

Lumina is an autonomous commerce media compiler built for the Cloudinary AI Hackathon 2026. It transforms unpolished smartphone photos into production-ready, multi-channel catalog assets utilizing a closed-loop AI verification system, extensive Cloudinary transformations, and Lucene-powered search.

## Live Demo

- **Demo URL:** https://lumina-cloudinary.vercel.app/

## Architecture Overview

The system architecture utilizes a dual-audit closed-loop pipeline to ensure no hallucinated or low-quality assets reach the production catalog.

```mermaid
graph TD
    A[Raw Image Upload] -->|Signed Stream| B(Cloudinary API)
    B --> C{Primary AI Audit}
    C -->|Score >= 85| D[Production Ready]
    C -->|Score < 50| E[Auto Reject]
    C -->|Score 50-84| F[Transformation Pipeline]

    F --> G[Generative Background Replace]
    G --> H[Content-Aware Saliency Crop]
    H --> I[Photometric Auto-Enhance]
    I --> J{Secondary AI Audit}

    J -->|Pass| D
    J -->|Fail| K[Flag for Manual Review]

    D --> L[Attach Structured Metadata]
    L --> M[Cloudinary Lucene Search Index]
    M --> N[Multi-channel Delivery AVIF/WebP/HLS]
```

## Cloudinary Integration

Cloudinary is the core infrastructure powering the ingestion, transformation, intelligence, and delivery phases of Lumina. We utilize 10 distinct Cloudinary capabilities:

1. **Secure Signed Upload Stream** (`cloudinary.uploader.upload_stream`): Direct chunked streaming from the browser to Cloudinary via server-generated HMAC-SHA1 signatures, protecting API secrets.
2. **Generative Background Replacement** (`e_gen_background_replace`): Extracts products and synthesizes pristine studio environments contextual to the product category.
3. **Generative Fill & Aspect Expansion** (`b_gen_fill`, `c_pad`): Outpaints images into 9:16 vertical formats without stretching.
4. **Photometric Auto-Restoration** (`e_improve:outdoor`, `e_viesus_correct`): Restores uncalibrated mobile captures by optimizing dynamic range and white balance.
5. **Content-Aware Auto-Crop** (`c_auto`, `g_auto`, `e_shadow`): AI subject detection centers products inside square/portrait frames with synthetic cast shadows.
6. **Dynamic Smart Overlays** (`l_text`, `fl_relative`): Composes verified badges server-side on the CDN edge.
7. **Structured Metadata Engine** (`cld-metadata`): Persists quality scores and categorization directly onto the Cloudinary asset record as strongly typed schema facets.
8. **Lucene Search API** (`cloudinary.search()`): Powers sub-100ms multi-facet filtering across catalogs with full-text queries and score ranges.
9. **Dynamic Format Delivery** (`f_auto`, `q_auto`): Automatically delivers next-generation formats (AVIF, WebP).
10. **Adaptive Video Streaming** (`sp_auto`): Encodes videos into multi-bitrate HLS playlists (.m3u8).

## Setup and Installation

### Prerequisites

- Node.js 18+
- A Cloudinary Account (Cloud Name, API Key, API Secret)
- A PostgreSQL Database (e.g., Neon, Supabase)
- Google AI Studio Gemini API Key

### Local Development

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
   Copy `.env.example` to `.env` and fill in your keys:

```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name
CLOUDINARY_ANALYZE_ENABLED=true
DATABASE_URL=your_postgres_url
DIRECT_URL=your_postgres_direct_url
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Generate Prisma Client and push schema:

```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage Instructions

1. Navigate to the **Ingestion Studio** via the home page.
2. Upload a raw product image using the drag-and-drop interface.
3. The system will automatically perform the first AI audit and execute the Cloudinary transformation pipeline.
4. Navigate to the **Catalog** to view the transformed variants (Square, Portrait, Landscape, Thumbnail) and search utilizing the Lucene integration.
5. Navigate to **Executive Analytics** to view the pass/fail rates and delta improvements.
