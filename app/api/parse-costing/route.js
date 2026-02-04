export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * CIM50 Costing PDF Parser (ROBUST)
 * Strategy:
 * - Extract ALL decimal numbers after header
 * - Group as Qty | Cost | Line Total
 * - Sum ONLY Line Totals
 */
export async function POST(req) {
  try {
    const pdfParse = (await import("pdf-parse")).default;

    const arrayBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsed = await pdfParse(buffer);
    const text = parsed.text;

    // Split text AFTER header
    const headerIndex = text.indexOf("Line Total");
    if (headerIndex === -1) {
      return Response.json(
        { error: "Costing table header not found." },
        { status: 400 }
      );
    }

    const tableText = text.slice(headerIndex);

    // Extract ALL decimal numbers (e.g. 155.82, 1.00, 311.64)
    const numbers = tableText.match(/\d+\.\d{2}/g);

    if (!numbers || numbers.length < 3) {
      return Response.json(
        { error: "No costing values detected." },
        { status: 400 }
      );
    }

    let totalCost = 0;
    let linesCounted = 0;

    // Every 3rd number is Line Total: [Qty, Cost, LineTotal]
    for (let i = 2; i < numbers.length; i += 3) {
      const value = Number(numbers[i]);
      if (!isNaN(value)) {
        totalCost += value;
        linesCounted++;
      }
    }

    return Response.json({
      totalCost: totalCost.toFixed(2),
      linesCounted
    });
  } catch (error) {
    console.error("CIM50 PDF parse error:", error);
    return Response.json(
      { error: "Failed to parse CIM50 costing PDF" },
      { status: 500 }
    );
  }
}
