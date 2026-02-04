"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload Costing Excel and Shortage Excel. I calculate cost, shortages, lead times, and order priority."
    }
  ]);

  const [input, setInput] = useState("");

  const [shortageData, setShortageData] = useState([]);
  const [costingLoaded, setCostingLoaded] = useState(false);
  const [totalCost, setTotalCost] = useState(null);
  const [costLines, setCostLines] = useState(0);

  /* ==============================
     COSTING EXCEL (FIXED)
     ============================== */
  function handleCostingExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      let sum = 0;
      let lines = 0;

      rows.forEach((r) => {
        const reference = String(r.Reference || "").trim();
        const desc = String(r.Description || "").toLowerCase();
        const lineTotal = Number(r["Line Total"] || 0);

        // 🔴 CRITICAL RULES
        if (reference.startsWith("Z")) return; // sub-assembly
        if (desc.includes("dummy")) return;
        if (lineTotal <= 0) return;

        sum += lineTotal;
        lines++;
      });

      setTotalCost(sum.toFixed(2));
      setCostLines(lines);
      setCostingLoaded(true);

      addAI(
        `💰 Costing file loaded.\nTotal cost £${sum.toFixed(
          2
        )}\nCosted component lines: ${lines}`
      );
    };

    reader.readAsBinaryString(file);
  }

  /* ==============================
     SHORTAGE EXCEL (EXPLAINED)
     ============================== */
  function handleShortageExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const cleaned = raw.map((r) => {
        const required = Number(
          r["Qty Required"] || r.Required || 0
        );
        const freeStock = Number(
          r["Free Stock"] || r.Stock || 0
        );

        return {
          description:
            r.Description ||
            r.Part ||
            r["Stock Code"] ||
            "Unknown",
          required,
          freeStock,
          shortage: Math.max(required - freeStock, 0),
          leadTime: Number(
            r["Lead Time"] || r["Lead Time (Days)"] || 0
          )
        };
      });

      setShortageData(cleaned);

      addAI(
        `✅ Shortage file loaded.\nRows analysed: ${cleaned.length}`
      );
    };

    reader.readAsBinaryString(file);
  }

  /* ==============================
     CHAT
     ============================== */
  function handleAsk() {
    if (!input.trim()) return;
    const q = input.toLowerCase();

    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // COST
    if (q.includes("cost")) {
      if (!costingLoaded) {
        addAI("⚠️ Upload costing Excel first.");
      } else {
        addAI(
          `💰 Total estimated cost: £${totalCost}\nComponent lines costed: ${costLines}`
        );
      }
    }

    // SHORTAGES
    else if (q.includes("shortage")) {
      const shortages = shortageData.filter((p) => p.shortage > 0);

      if (shortages.length === 0) {
        addAI(
          "✅ No material shortages for this BOM.\nAll required components are available or covered by stock."
        );
      } else {
        addAI(
          "📦 Material shortages:\n" +
            shortages
              .map(
                (p) =>
                  `- ${p.description} | Short ${p.shortage} | Lead ${p.leadTime} days`
              )
              .join("\n")
        );
      }
    }

    // ORDER PRIORITY
    else if (q.includes("order")) {
      const priority = shortageData
        .filter((p) => p.shortage > 0)
        .sort((a, b) => b.leadTime - a.leadTime);

      if (priority.length === 0) {
        addAI("✅ No urgent procurement actions required.");
      } else {
        addAI(
          "🚨 Order priority (longest lead first):\n" +
            priority
              .map(
                (p, i) =>
                  `${i + 1}. ${p.description} | Short ${p.shortage} | Lead ${p.leadTime} days`
              )
              .join("\n")
        );
      }
    }

    else {
      addAI(
        "🤖 Ask about cost, shortages, or what to order first."
      );
    }

    setInput("");
  }

  function addAI(text) {
    setMessages((prev) => [...prev, { role: "ai", content: text }]);
  }

  /* ==============================
     UI
     ============================== */
  return (
    <div className="flex h-screen">
      <aside className="w-72 bg-gray-900 p-6 space-y-6 border-r border-gray-800">
        <h2 className="text-xl font-semibold">BOM AI</h2>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium">Costing Excel</p>
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,.xlsb,.csv"
            onChange={handleCostingExcelUpload}
          />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium">Shortage Excel</p>
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,.xlsb,.csv"
            onChange={handleShortageExcelUpload}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">
            AI Production & Costing Assistant
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-sm whitespace-pre-line ${
                  m.role === "user"
                    ? "bg-blue-600"
                    : "bg-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
        </div>

        <footer className="p-6 border-t border-gray-800">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              className="flex-1 bg-gray-800 rounded-xl px-4 py-3"
              placeholder="Ask: cost / shortages / what to order first"
            />
            <button
              onClick={handleAsk}
              className="bg-blue-600 px-6 rounded-xl"
            >
              Ask
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
