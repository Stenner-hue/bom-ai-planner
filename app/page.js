"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload Costing PDF and Shortage Excel. I can calculate shortages, lead times, cost, and order priority."
    }
  ]);

  const [input, setInput] = useState("");
  const [shortageData, setShortageData] = useState([]);

  // 🔑 IMPORTANT STATE
  const [pdfUploaded, setPdfUploaded] = useState(false);
  const [totalCost, setTotalCost] = useState(null);

  /* ==============================
     EXCEL UPLOAD
     ============================== */
  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const cleaned = raw.map((r) => {
        const required = Number(
          r["Qty Required"] || r.Required || r.Qty || 0
        );
        const freeStock = Number(
          r["Free Stock"] || r.Stock || 0
        );

        return {
          description:
            r.Description ||
            r.Part ||
            r["Stock Code"] ||
            "Unknown part",
          required,
          freeStock,
          shortage: Math.max(required - freeStock, 0),
          leadTime: Number(
            r["Lead Time"] || r["Lead Time (Days)"] || 0
          )
        };
      });

      setShortageData(cleaned);
      addAI(`✅ Shortage file loaded (${cleaned.length} rows).`);
    };

    reader.readAsBinaryString(file);
  }

  /* ==============================
     PDF UPLOAD — FIXED
     ============================== */
  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPdfUploaded(true); // 🔑 mark as uploaded

    try {
      const res = await fetch("/api/parse-costing", {
        method: "POST",
        body: file
      });

      const data = await res.json();

      if (data.totalCost) {
        setTotalCost(Number(data.totalCost));
        addAI(`💰 Costing PDF analysed. Total cost £${data.totalCost}`);
      } else {
        setTotalCost(null);
        addAI(
          "⚠️ Costing PDF uploaded, but no line totals were detected. Please check PDF format."
        );
      }
    } catch (err) {
      setTotalCost(null);
      addAI("❌ Failed to analyse costing PDF.");
    }
  }

  /* ==============================
     CHAT
     ============================== */
  function handleAsk() {
    if (!input.trim()) return;

    const q = input.toLowerCase();
    setMessages((prev) => [...prev, { role: "user", content: input }]);

    // SHORTAGES
    if (q.includes("shortage")) {
      const shortages = shortageData.filter((p) => p.shortage > 0);
      if (!shortages.length) {
        addAI("✅ No shortages detected.");
      } else {
        addAI(
          "📦 Shortages:\n" +
            shortages
              .map(
                (p) =>
                  `- ${p.description} | Short ${p.shortage} | Lead ${p.leadTime} days`
              )
              .join("\n")
        );
      }
    }

    // COST — FIXED LOGIC
    else if (q.includes("cost")) {
      if (!pdfUploaded) {
        addAI("⚠️ Upload costing PDF first.");
      } else if (totalCost === null) {
        addAI(
          "⚠️ Costing PDF uploaded, but cost could not be calculated."
        );
      } else {
        addAI(`💰 Total estimated cost: £${totalCost}`);
      }
    }

    // ORDER PRIORITY
    else if (q.includes("order")) {
      const priority = shortageData
        .filter((p) => p.shortage > 0)
        .sort((a, b) => b.leadTime - a.leadTime);

      if (!priority.length) {
        addAI("✅ No urgent orders required.");
      } else {
        addAI(
          "🚨 Order priority:\n" +
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
      addAI("🤖 Ask about cost, shortages, or what to order first.");
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
          <p className="text-sm font-medium">Costing PDF</p>
          <input type="file" accept=".pdf" onChange={handlePdfUpload} />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium">Shortage Excel</p>
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,.xlsb,.csv"
            onChange={handleExcelUpload}
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
              placeholder="Ask: shortages / cost / what to order first"
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
