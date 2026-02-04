"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "👋 Upload your BOM costing PDF and shortage Excel. Ask me about cost, shortages, lead times, or kit dates."
    }
  ]);

  const [input, setInput] = useState("");

  function handleAsk() {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    const aiMessage = {
      role: "ai",
      content: generateFakeAIResponse(input)
    };

    setMessages([...messages, userMessage, aiMessage]);
    setInput("");
  }

  function generateFakeAIResponse(question) {
    const q = question.toLowerCase();

    if (q.includes("cost")) {
      return "💰 The total estimated cost will be calculated from the costing report once uploaded.";
    }

    if (q.includes("shortage")) {
      return "📦 I will analyse the shortage report to identify missing components and quantities.";
    }

    if (q.includes("lead")) {
      return "⏱️ Lead times will be derived from the shortage file. The longest lead-time item will drive the build date.";
    }

    if (q.includes("kit")) {
      return "📅 I’ll compare the longest lead-time item against your kit date and highlight any delivery risk.";
    }

    return "🤖 I understand your question. Once files are uploaded, I’ll give a precise answer based on BOM data.";
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">BOM AI</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">Costing PDF</p>
            <input type="file" accept=".pdf" className="mt-2 text-sm" />
          </div>

          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">Shortage Excel</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="mt-2 text-sm"
            />
          </div>
        </div>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        <header className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">
            AI Production & Costing Assistant
          </h1>
          <p className="text-gray-400 text-sm">
            Costing · Shortages · Lead times · Kit dates
          </p>
        </header>

        {/* Messages */}
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

        {/* Input */}
        <footer className="p-6 border-t border-gray-800">
          <div className="flex gap-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              type="text"
              placeholder="Ask a question..."
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
