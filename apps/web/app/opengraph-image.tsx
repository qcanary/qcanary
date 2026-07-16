import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "QCanary — Monitor BullMQ queues without sharing Redis credentials";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0A0A0A 0%, #0F0F0F 50%, #0A0A0A 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Subtle grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 25% 50%, rgba(34,197,94,0.08) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(34,197,94,0.04) 0%, transparent 50%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "flex-end",
            }}
          >
            <div style={{ width: 32, height: 16, borderRadius: 6, background: "rgba(34,197,94,0.6)" }} />
            <div style={{ width: 32, height: 28, borderRadius: 6, background: "rgba(34,197,94,0.8)" }} />
            <div style={{ width: 32, height: 40, borderRadius: 6, background: "#22C55E" }} />
          </div>

          {/* Title */}
          <div
            style={{
              display: "flex",
              fontSize: 64,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#FAFAFA",
              gap: "8px",
            }}
          >
            Q<span style={{ color: "#22C55E" }}>Canary</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 24,
              color: "#71717A",
              fontWeight: 400,
              textAlign: "center",
              maxWidth: 600,
              lineHeight: 1.4,
            }}
          >
            Monitor BullMQ queues without sharing Redis credentials
          </div>

          {/* Feature pills */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "16px",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["Real-time dashboards", "Smart alerts", "Anomaly detection", "3-line setup"].map(
              (feature) => (
                <div
                  key={feature}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 999,
                    border: "1px solid rgba(34,197,94,0.2)",
                    color: "#A1A1AA",
                    fontSize: 16,
                    background: "rgba(34,197,94,0.04)",
                  }}
                >
                  {feature}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
