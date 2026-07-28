"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{ background: "#f5f6fa", color: "#1a1a2e", fontFamily: "sans-serif", direction: "rtl" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <div style={{ width: "5rem", height: "5rem", margin: "0 auto 2rem", borderRadius: "1.5rem", background: "rgba(45,53,97,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "2rem" }}>!</span>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>
              خطأ حرج في التطبيق
            </h1>
            <p style={{ color: "#6b7094", marginBottom: "2rem", lineHeight: 1.7 }}>
              حدث خطأ غير متوقع. يرجى تحديث الصفحة أو المحاولة لاحقاً.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
              <button
                onClick={reset}
                style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", background: "#2d3561", color: "white", border: "none", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
              >
                حاول مرة أخرى
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{ padding: "0.75rem 1.5rem", borderRadius: "0.75rem", background: "white", color: "#2d3561", border: "1px solid #dfe2ed", cursor: "pointer", fontSize: "0.875rem", fontWeight: 500 }}
              >
                الرئيسية
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
