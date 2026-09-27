import { NextRequest, NextResponse } from "next/server";
import { runMockPipeline, MockScenario } from "@/lib/pipeline-mock";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { scenario = "saree", speedMultiplier = 1, isSync = false } = body;

    // Let runMockPipeline use its internal fallback for publicId
    const assetId = `mock_asset_${scenario}_${Date.now()}`;

    if (isSync) {
      const result = await runMockPipeline({
        scenario: scenario as MockScenario,
        speedMultiplier,
      });
      return NextResponse.json({ success: true, result });
    }

    runMockPipeline({
      scenario: scenario as MockScenario,
      speedMultiplier,
    }).catch((err) => {
      console.error("[Mock Pipeline Error]:", err);
    });

    return NextResponse.json({
      success: true,
      assetId,
      scenario,
      status: "processing",
      eventsUrl: `/api/events?assetId=${assetId}`,
    });
  } catch (err: unknown) {
    console.error("[API /api/pipeline/mock Error]:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
