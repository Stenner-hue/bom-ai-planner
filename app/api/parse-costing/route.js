import pdf from "pdf-parse";

export async function POST(req) {
  const data = await req.arrayBuffer();
  const buffer = Buffer.from(data);

  const parsed = await pdf(buffer);

  const lines = parsed.text.split("\n");

  let totalCost = 0;

  lines.forEach((line) => {
    const match = line.match(/£?\s?(\d+\.\d{2})$/);
    if (match) {
      totalCost += Number(match[1]);
    }
  });

  return Response.json({
    totalCost: totalCost.toFixed(2)
  });
}
