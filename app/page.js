"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload your Costing PDF and Shortage Excel. I’ll analyse cost, shortages, lead times, and kit-date risk."
    }
  ]);

  const [input, setInput] = useState("");
  const [shortageData, setShortageData] = useState([]);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  /* ---------- FILE UPLOAD HANDLERS ---------- */

  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target.result, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        // Normalise data
        const cleaned = raw.map((row) => ({
          description:
            row.Description ||
            row.DESCRIPTION ||
            row.Part ||
            "Unknown",
          required: Number(row.Required || row.Qty || row["Qty Required"] || 0),
          freeStock: Number(row["Free Stock"] || row.Stock || 0),
          shortage: Number(row.Shortage || row["Shortage Qty"] || 0),
          leadTime: Number(row["Lead Time"] || row["Lead Time (Days)"] || 0)
        }));

        setShortageData(cleaned);

        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `✅ Shortage file loaded (${cleaned.length} rows).`
          }
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content:
              "❌ I couldn’t read that Excel file. Please check the format."
          }
        ]);
      }
    };

    reader.readAsBinaryString(file);
  }

  function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPdfLoaded(true);
    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        content: `📄 Costing PDF loaded (${file.name}).`
      }
    ]);
  }

  /* ---------- CHAT LOGIC ---------- */

  function handleAsk() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const aiMessage = {
      role: "ai",
      content: answerQuestion(input)
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  }

  function answerQuestion(question) {
    const q = question.toLowerCase();

    if (q.includes("cost")) {
      if (!pdfLoaded) {
        return "⚠️ Please upload a costing PDF first.";
      }
      return "💰 I’ll calculate total and assembly-level costs from the costing PDF.";
    }

    if (q.includes("shortage")) {
      if (shortageData.length === 0) {
        return "⚠️ Please upload a shortage Excel file first.";
      }

      const shortages = shortageData.filter((p) => p.shortage > 0);

      if (shortages.length === 0) {
        return "✅ No shortages detected. All required parts are available.";
      }

      return `📦 ${shortages.length} items are in shortage. These drive procurement and build risk.`;
    }

    if (q.includes("lead")) {
      if (shortageData.length === 0) {
        return "⚠️ No shortage data loaded.";
      }

      const valid = shortageData.filter((p) => p.leadTime > 0);
      if (valid.length === 0) {
        return "⚠️ No lead times defined in the data.";
      }

      const longest = valid.reduce((a, b) =>
        a.leadTime > b.leadTime ? a : b
      );

      return `⏱️ Longest lead-time item: ${longest.description} (${longest.leadTime} days).`;
    }

    if (q.includes("kit")) {
      return "📅 I’ll compare the kit date against the longest lead-time item to assess build risk.";
    }

    return "🤖 I can answer questions about cost, shortages, lead times, and kit dates.";
  }

  /* ---------- UI ---------- */

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-900 border-r border-gray-800 p-6 space-y-6">
        <h2 className="text-xl font-semibold">BOM AI</h2>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium">Costing PDF</p>
          <input
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            className="mt-2 text-sm"
          />
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <p className="text-sm font-medium">Shortage Excel</p>
          <input
            type="file"
            accept=".xlsx,.xls,.xlsm,.xlsb,.csv"
            onChange={handleExcelUpload}
            className="mt-2 text-sm"
          />
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        <header className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">
            AI Production & Planning Assistant
          </h1>
          <p className="text-gray-400 text-sm">
            Cost · Shortages · Lead times · Kit readiness
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`rounded-2xl p-4 max-w-xl text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-gray-800"
                }`}
              >
                {msg.content}
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
              placeholder="Ask about cost, shortages, lead time, kit date..."
              className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            <button
              onClick={handleAsk}
              className="bg-blue-600 px-6 rounded-xl text-sm font-medium hover:bg-blue-500"
            >
              Ask
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
