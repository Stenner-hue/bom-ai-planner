export default function Home() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 p-6">
        <h2 className="text-xl font-semibold mb-6">BOM AI</h2>

        <div className="space-y-4">
          <div className="p-4 bg-gray-800 rounded-lg">
            <p className="text-sm font-medium">Costing PDF</p>
            <input
              type="file"
              accept=".pdf"
              className="mt-2 text-sm"
            />
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

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-semibold">
            AI Production & Costing Assistant
          </h1>
          <p className="text-gray-400 text-sm">
            Ask about cost, shortages, lead times, and kit dates
          </p>
        </header>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI message */}
          <div className="flex">
            <div className="bg-gray-800 rounded-2xl p-4 max-w-xl">
              <p className="text-sm">
                👋 Upload your BOM costing PDF and shortage Excel.
                <br />
                I’ll help you analyse cost, shortages, and build readiness.
              </p>
            </div>
          </div>

          {/* User message example */}
          <div className="flex justify-end">
            <div className="bg-blue-600 rounded-2xl p-4 max-w-xl">
              <p className="text-sm">
                Can we meet kit date 03/03/2026 for ST100R?
              </p>
            </div>
          </div>

          {/* AI response placeholder */}
          <div className="flex">
            <div className="bg-gray-800 rounded-2xl p-4 max-w-xl">
              <p className="text-sm">
                ⚠️ Potential delay detected.
                <br />
                Longest lead item arrives after the kit date.
              </p>
            </div>
          </div>
        </div>

        {/* Input */}
        <footer className="p-6 border-t border-gray-800">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Ask a question..."
              className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none"
            />
            <button className="bg-blue-600 px-6 rounded-xl text-sm font-medium hover:bg-blue-500">
              Ask
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
