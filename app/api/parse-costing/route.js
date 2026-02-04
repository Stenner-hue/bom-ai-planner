export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import pdf from "pdf-parse";

export async function POST(req) {
  try {
    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdf(buffer);
    const lines = parsed.text.split("\n");

    let totalCost = 0;

    for (const line of lines) {
      const match = line.match(/£?\s?(\d+\.\d{2})$/);
      if (match) {
        totalCost += Number(match[1]);
      }
    }

    return Response.json({
      totalCost: totalCost.toFixed(2)
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to parse costing PDF" },
      { status: 500 }
    );
  }
}
