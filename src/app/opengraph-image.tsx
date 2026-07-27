import { ImageResponse } from "next/og";

export const runtime = "edge";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0b14",
          background: "linear-gradient(135deg, #2d3561 0%, #0a0b14 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px",
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: "bold",
              color: "white",
              marginBottom: 20,
              letterSpacing: "-0.05em",
            }}
          >
            السُّدفة
          </div>
          <div
            style={{
              fontSize: 36,
              color: "rgba(255, 255, 255, 0.6)",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.4,
            }}
          >
            مجلة أدبية عربية تنشر القصائد والتأملات والحكايات
          </div>
          <div
            style={{
              marginTop: 60,
              display: "flex",
              gap: 20,
            }}
          >
            {["شعر", "قصة", "نثر", "مقالات", "تأملات"].map((section) => (
              <div
                key={section}
                style={{
                  padding: "12px 24px",
                  borderRadius: 12,
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: 24,
                }}
              >
                {section}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
