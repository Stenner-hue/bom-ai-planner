import "./globals.css";

export const metadata = {
  title: "BOM AI Planner",
  description: "AI-assisted BOM costing and planning tool"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
