
import { sseBus } from "@/lib/sse";
import { prisma } from "@/lib/prisma";
import { generateAssetFamily } from "@/lib/asset-family";
import { AuditResult, VerificationResult, AssetFamilyUrls } from "@/types/audit";
import { computeVerificationMetrics, generateQualitySummary } from "@/lib/scoring-engine";

export type MockScenario = "saree" | "brass" | "leather" | "watermark" | "ceramic";

export interface MockPipelineOptions {
  publicId?: string;
  scenario?: MockScenario;
  speedMultiplier?: number; // 1 = normal (approx 5s demo), 2 = fast, 0.5 = cinematic
}

export interface MockPipelineResult {
  assetId: string;
  publicId: string;
  scenario: MockScenario;
  status: "approved" | "rejected";
  decision: "PASS" | "REPAIR" | "REJECT";
  audit1: AuditResult;
  verification?: VerificationResult;
  familyUrls?: AssetFamilyUrls;
  rejectionReason?: string;
  durationMs: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runMockPipeline(
  options: MockPipelineOptions = {}
): Promise<MockPipelineResult> {
  const startTime = Date.now();
  const scenario = options.scenario || "saree";
  const speed = options.speedMultiplier || 1;
  const delay = (ms: number) => sleep(Math.max(50, Math.round(ms / speed)));

  const publicId =
    options.publicId || "main-sample";
  const assetId = `mock_asset_${scenario}_${Date.now()}`;

  console.log(`[Mock Pipeline] 🎬 Starting simulated compilation for: ${scenario} (${publicId})`);

  sseBus.emit(assetId, {
    assetId,
    step: "upload",
    status: "complete",
    progress: 10,
    message: "Artisan smartphone capture registered in Lumina compiler.",
    data: { publicId, scenario },
  });

  await delay(400);

  let initialAudit: AuditResult;
  let verifiedAudit: AuditResult;
  let transformChain = "";

  switch (scenario) {
    case "saree":
      initialAudit = {
        scores: { product_visibility: 72, background_quality: 24, lighting_quality: 42, composition: 54, brand_safety: 90 },
        overall_score: 44,
        commerce_ready: false,
        decision: "REPAIR",
        detected_issues: ["Cluttered bedsheet background", "Uneven camera flash glare", "Loose vertical margins"],
        has_watermark: false,
        has_text_overlay: false,
        semantics: {
          product_category: "Handwoven Silk Saree",
          dominant_colors: ["#C0392B", "#F1C40F", "#78281F"],
          seo_description: "Authentic Crimson Banarasi Silk Saree with Traditional Gold Zari Weave",
        },
      };
      verifiedAudit = {
        scores: { product_visibility: 95, background_quality: 94, lighting_quality: 90, composition: 92, brand_safety: 98 },
        overall_score: 93,
        commerce_ready: true,
        decision: "PASS",
        detected_issues: [],
        has_watermark: false,
        has_text_overlay: false,
        semantics: initialAudit.semantics,
      };
      transformChain = "e_improve:50/e_sharpen:80/e_gen_background_replace:prompt_clean_minimalist_boutique_display/c_pad,b_gen_fill";
      break;

    case "brass":
      initialAudit = {
        scores: { product_visibility: 78, background_quality: 35, lighting_quality: 48, composition: 65, brand_safety: 95 },
        overall_score: 52,
        commerce_ready: false,
        decision: "REPAIR",
        detected_issues: ["Dark workshop background", "Harsh directional shadow", "Metallic reflections"],
        has_watermark: false,
        has_text_overlay: false,
        semantics: {
          product_category: "Brass Handicraft Idol",
          dominant_colors: ["#D4AF37", "#8C6D23", "#2C1D08"],
          seo_description: "Handcrafted Antique Brass Deity Sculpture with Intricate Filigree Details",
        },
      };
      verifiedAudit = {
        scores: { product_visibility: 96, background_quality: 92, lighting_quality: 92, composition: 94, brand_safety: 100 },
        overall_score: 94,
        commerce_ready: true,
        decision: "PASS",
        detected_issues: [],
        has_watermark: false,
        has_text_overlay: false,
        semantics: initialAudit.semantics,
      };
      transformChain = "e_improve:60/e_gen_background_replace:prompt_warm_scandinavian_wooden_table/c_pad,b_gen_fill";
      break;

    case "watermark":
      initialAudit = {
        scores: { product_visibility: 85, background_quality: 80, lighting_quality: 75, composition: 80, brand_safety: 10 },
        overall_score: 55,
        commerce_ready: false,
        decision: "REJECT",
        detected_issues: ["Third-party stock watermark detected: 'Getty Images' watermark in bottom right"],
        has_watermark: true,
        has_text_overlay: true,
        semantics: {
          product_category: "Jewelry Item",
          dominant_colors: ["#E5E7EB", "#F59E0B"],
          seo_description: "Copyrighted stock photo detected",
        },
      };
      verifiedAudit = initialAudit;
      break;

    case "leather":
    default:
      initialAudit = {
        scores: { product_visibility: 92, background_quality: 86, lighting_quality: 88, composition: 89, brand_safety: 98 },
        overall_score: 90,
        commerce_ready: true,
        decision: "PASS",
        detected_issues: [],
        has_watermark: false,
        has_text_overlay: false,
        semantics: {
          product_category: "Full-Grain Leather Bag",
          dominant_colors: ["#78350F", "#B45309", "#FEF3C7"],
          seo_description: "Handcrafted Full-Grain Vegetable Tanned Artisan Leather Satchel",
        },
      };
      verifiedAudit = initialAudit;
      break;
  }

  sseBus.emit(assetId, {
    assetId,
    step: "audit_1",
    status: "started",
    progress: 20,
    message: "AI Vision evaluating product visibility, lighting, and background quality...",
  });

  await delay(900);

  sseBus.emit(assetId, {
    assetId,
    step: "audit_1",
    status: "complete",
    progress: 35,
    message: `Audit #1 complete. Baseline Score: ${initialAudit.overall_score}/100`,
    data: { audit: initialAudit },
  });

  sseBus.emit(assetId, {
    assetId,
    step: "decision",
    status: "started",
    progress: 40,
    message: "Evaluating marketplace compliance gate and copyright policy...",
  });

  await delay(600);

  if (initialAudit.decision === "REJECT") {
    const reason =
      "Listing rejected by automated compliance policy: Watermark or copyrighted material detected. Please upload original raw photography.";

    sseBus.emit(assetId, {
      assetId,
      step: "decision",
      status: "failed",
      progress: 100,
      message: reason,
      data: { rejectionReason: reason },
    });

    return {
      assetId,
      publicId,
      scenario,
      status: "rejected",
      decision: "REJECT",
      audit1: initialAudit,
      rejectionReason: reason,
      durationMs: Date.now() - startTime,
    };
  }

  if (initialAudit.decision === "PASS") {
    const familyUrls = generateAssetFamily(publicId, "", initialAudit.semantics, initialAudit.overall_score);

    sseBus.emit(assetId, {
      assetId,
      step: "compile",
      status: "complete",
      progress: 90,
      message: "Asset exceeds marketplace quality threshold without repairs needed.",
      data: { familyUrls },
    });

    sseBus.emit(assetId, {
      assetId,
      step: "complete",
      status: "complete",
      progress: 100,
      message: `Verified commerce ready! Score: ${initialAudit.overall_score}/100`,
      data: { familyUrls, score: initialAudit.overall_score },
    });

    return {
      assetId,
      publicId,
      scenario,
      status: "approved",
      decision: "PASS",
      audit1: initialAudit,
      familyUrls,
      durationMs: Date.now() - startTime,
    };
  }

  sseBus.emit(assetId, {
    assetId,
    step: "transform",
    status: "started",
    progress: 50,
    message: `Synthesizing contextual studio background for [${initialAudit.semantics.product_category}] and enhancing clarity...`,
  });

  await delay(1600);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "drntwxfcc";
  const repairedImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/${transformChain}/f_auto,q_auto/${publicId}`;

  sseBus.emit(assetId, {
    assetId,
    step: "transform",
    status: "complete",
    progress: 68,
    message: "Generative studio background and optical sharpening applied.",
    data: { repairedImageUrl },
  });

  sseBus.emit(assetId, {
    assetId,
    step: "audit_2",
    status: "started",
    progress: 72,
    message: "Executing secondary AI audit against transformed CDN asset...",
  });

  await delay(1000);

  const metrics = computeVerificationMetrics(initialAudit, verifiedAudit, 70);
  const summary = generateQualitySummary(metrics);

  const verification: VerificationResult = {
    ...metrics,
    passedGate: true,
    approvalStatus: "approved",
  };

  sseBus.emit(assetId, {
    assetId,
    step: "audit_2",
    status: "complete",
    progress: 88,
    message: `Quality Gate Passed: Score improved from ${metrics.scoreBefore} to ${metrics.scoreAfter} (+${metrics.scoreDelta} pts)`,
    data: { verification, summary },
  });

  sseBus.emit(assetId, {
    assetId,
    step: "compile",
    status: "started",
    progress: 90,
    message: "Generating 5-variant omnichannel asset family...",
  });

  await delay(700);

  const familyUrls = generateAssetFamily(
    publicId,
    transformChain,
    initialAudit.semantics,
    verifiedAudit.overall_score
  );

  sseBus.emit(assetId, {
    assetId,
    step: "compile",
    status: "complete",
    progress: 96,
    message: "Omnichannel asset family generated.",
    data: { familyUrls },
  });

  await delay(300);
  const totalDuration = Date.now() - startTime;

  sseBus.emit(assetId, {
    assetId,
    step: "complete",
    status: "complete",
    progress: 100,
    message: `All 5 production-ready catalog assets compiled and verified in ${(totalDuration / 1000).toFixed(1)}s!`,
    data: {
      assetId,
      familyUrls,
      verification,
      repairedHeroUrl: familyUrls.hero,
    },
  });

  // try {
  //   const demoArtisan = await prisma.user.findFirst();
  //   if (demoArtisan) {
  //     await prisma.asset.upsert({
  //       where: { publicId },
  //       update: {
  //         scoreBefore: initialAudit.overall_score,
  //         scoreAfter: verifiedAudit.overall_score,
  //         scoreDelta: metrics.scoreDelta,
  //         status: "approved",
  //         heroUrl: familyUrls.hero,
  //         marketplaceUrl: familyUrls.marketplace,
  //         bannerUrl: familyUrls.banner,
  //         lifestyleUrl: familyUrls.lifestyle,
  //         socialUrl: familyUrls.social,
  //       },
  //       create: {
  //         publicId,
  //         secureUrl: repairedImageUrl,
  //         userId: demoArtisan.id,
  //         scoreBefore: initialAudit.overall_score,
  //         scoreAfter: verifiedAudit.overall_score,
  //         scoreDelta: metrics.scoreDelta,
  //         status: "approved",
  //         decision: "REPAIR",
  //         productCategory: initialAudit.semantics.product_category,
  //         seoDescription: initialAudit.semantics.seo_description,
  //         dominantColors: initialAudit.semantics.dominant_colors,
  //         heroUrl: familyUrls.hero,
  //         marketplaceUrl: familyUrls.marketplace,
  //         bannerUrl: familyUrls.banner,
  //         lifestyleUrl: familyUrls.lifestyle,
  //         socialUrl: familyUrls.social,
  //       },
  //     });
  //   }
  // } catch {
  // 
  // }

  return {
    assetId,
    publicId,
    scenario,
    status: "approved",
    decision: "REPAIR",
    audit1: initialAudit,
    verification,
    familyUrls,
    durationMs: totalDuration,
  };
}
