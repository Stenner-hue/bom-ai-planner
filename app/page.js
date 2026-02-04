"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload Costing PDF and Shortage Excel. I can calculate cost, shortages, kit readiness, and order priority."
    }
  ]);

  const [input, setInput] = useState("");
  const [shortageData, setShortageData] = useState([]);
  const [totalCost, setTotalCost] = useState(null);

  /* ---------- EXCEL ---------- */
  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      const cleaned = raw.map((r) => ({
        description: r.Description || r.Part || "Unknown",
        shortage: Number(r.Shortage || r["Shortage Qty"] || 0),
        leadTime: Number(r["Lead Time"] || r["Lead Time (Days)"] || 0)
      }));

      setShortageData(cleaned);
      addAI(`✅ Shortage file loaded (${cleaned.length} rows).`);
    };

    reader.readAsBinaryString(file);
  }

  /* ---------- PDF ---------- */
  async function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const res = await fetch("/api/parse-costing", {
      method: "POST",
      body: file
    });

    const data = await res.json();
    setTotalCost(data.totalCost);

    addAI(`💰 Costing PDF analysed. Total cost £${data.totalCost}`);
  }

  /* ---------- CHAT ---------- */
  function addAI(text) {
    setMessages((m) => [...m, { role: "ai", content: text }]);
  }

  function handleAsk() {
    if (!input.trim()) return;

    const q = input.toLowerCase();
    setMessages((m) => [...m, { role: "user", content: input }]);

    /* A — Exact shortages */
    if (q.includes("shortage")) {
      const s = shortageData.filter((p) => p.shortage > 0);
      if (!s.length) {
        addAI("✅ No shortages detected.");
      } else {
        addAI(
          "📦 Shortages:\n" +
            s
              .map(
                (p) =>
                  `- ${p.description} – Qty ${p.shortage} – ${p.leadTime} days`
              )
              .join("\n")
        );
      }
    }

    /* B — Total cost */
    else if (q.includes("cost")) {
      addAI(
        totalCost
          ? `💰 Total estimated cost: £${totalCost}`
          : "⚠️ Upload costing PDF first."
      );
    }

    /* C — What to order first */
    else if (q.includes("order")) {
      const priority = shortageData
        .filter((p) => p.shortage > 0)
        .sort((a, b) => b.leadTime - a.leadTime);

      if (!priority.length) {
        addAI("✅ Nothing urgent to order.");
      } else {
        addAI(
          "🚨 Order priority:\n" +
            priority
              .slice(0, 5)
              .map(
                (p, i) =>
                  `${i + 1}. ${p.description} – ${p.leadTime} days – Qty ${p.shortage}`
              )
              .join("\n")
        );
      }
    }

    else {
      addAI(
        "🤖 Ask me about cost, shortages, kit date, or what to order first."
      );
    }

    setInput("");
  }

  /* ---------- UI ---------- */
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
