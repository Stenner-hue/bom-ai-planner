export default function Home() {
  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>BOM AI Planner</h1>

      <p>Upload your BOM Costing PDF and Shortage Excel file.</p>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Costing PDF:
          <br />
          <input type="file" accept=".pdf" />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label>
          Shortage Excel:
          <br />
          <input type="file" accept=".xlsx,.xls" />
        </label>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <textarea
          placeholder="Ask a question (e.g. Can we meet kit date 03/03/2026?)"
          style={{ width: "100%", height: "100px" }}
        />
      </div>

      <button style={{ padding: "10px 20px" }}>
        Ask
      </button>

      <div style={{ marginTop: "40px" }}>
        <h3>Response:</h3>
        <p>(AI response will appear here)</p>
      </div>
    </main>
  );
}
