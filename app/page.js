"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload your shortage Excel file. I can analyse shortages, stock, and lead times."
    }
  ]);

  const [input, setInput] = useState("");
  const [shortageData, setShortageData] = useState([]);

  function handleExcelUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      setShortageData(json);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: `✅ Shortage file loaded (${json.length} rows). Ready for questions.`
        }
      ]);
    };

    reader.readAsBinaryString(file);
  }

  function handleAsk() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const aiMessage = {
      role: "ai",
      content: answerFromShortageData(input)
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  }

  function answerFromShortageData(question) {
    if (shortageData.length === 0) {
      return "⚠️ Please upload a shortage Excel file first.";
    }

    const q = question.toLowerCase();

    if (q.includes("shortage")) {
      const shortages = shortageData.filter(
        (row) => Number(row.Shortage) > 0
      );

      if (shortages.length === 0) {
        return "✅ No shortages found. All required parts are in stock.";
      }

      return `📦 ${shortages.length} items are in shortage. The most critical ones should be ordered first.`;
    }

    if (q.includes("lead")) {
      const withLeadTime = shortageData.filter(
        (row) => Number(row["Lead Time"]) > 0
      );

      if (withLeadTime.length === 0) {
        return "⚠️ No lead times defined in the shortage file.";
      }

      const longest = withLeadTime.reduce((a, b) =>
        Number(a["Lead Time"]) > Number(b["Lead Time"]) ? a : b
      );

      return `⏱️ Longest lead-time item: ${longest.Description} (${longest["Lead Time"]} days).`;
    }

    return "🤖 I can answer questions about shortages and lead times from the uploaded Excel.";
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">BOM AI</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">Shortage Excel</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="mt-2 text-sm"
              onChange={handleExcelUpload}
            />
          </div>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        <header className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">
            AI Production & Planning Assistant
          </h1>
          <p className="text-gray-400 text-sm">
            Shortages · Lead times · Build risk
          </p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
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
              type="text"
              placeholder="Ask about shortages or lead times..."
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
