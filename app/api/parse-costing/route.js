export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CIM50 Costing PDF Parser
 * - Sums ONLY "Line Total" column
 * - Ignores Qty and Cost Price
 * - Safe for large BOM PDFs
 */
export async function POST(req) {
  try {
    // Dynamic import avoids build-time execution
    const pdfParse = (await import("pdf-parse")).default;

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdfParse(buffer);
    const lines = parsed.text.split("\n");

    let totalCost = 0;
    let countedLines = 0;

    for (const line of lines) {
      /**
       * We look for 3 decimal numbers at end of line:
       * Qty  CostPrice  LineTotal
       * We capture ONLY the LAST one (Line Total)
       */
      const match = line.match(
        /(\d+\.\d{2})\s*$/
      );

      if (match) {
        const value = Number(match[1]);
        if (!isNaN(value)) {
          totalCost += value;
          countedLines++;
        }
      }
    }

    // Safety: ensure something was actually summed
    if (countedLines === 0) {
      return Response.json(
        {
          error:
            "No line totals detected. PDF format may differ from CIM50 standard."
        },
        { status: 400 }
      );
    }

    return Response.json({
      totalCost: totalCost.toFixed(2),
      linesCounted: countedLines
    });
  } catch (error) {
    console.error("CIM50 PDF parse error:", error);

    return Response.json(
      { error: "Failed to parse CIM50 costing PDF" },
      { status: 500 }
    );
  }
}
