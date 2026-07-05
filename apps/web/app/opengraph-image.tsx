import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0A0A0A",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: -160,
            left: "50%",
            marginLeft: -400,
            width: 800,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(34,197,94,0.25) 0%, rgba(34,197,94,0.08) 40%, rgba(10,10,10,0) 70%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Q icon */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 52,
              height: 52,
              borderRadius: 12,
              background: "#22C55E",
              color: "#0A0A0A",
              fontSize: 28,
              fontWeight: 700,
              fontFamily: "system-ui, sans-serif",
              marginBottom: 4,
            }}
          >
            Q
          </div>

          {/* QCanary name */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#FAFAFA",
              fontFamily: "system-ui, sans-serif",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            QCanary
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#A1A1AA",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 500,
            letterSpacing: "-0.01em",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Monitor BullMQ Without Exposing Redis
        </div>

        {/* Subtitle */}
        <div
          style={{
            marginTop: 12,
            fontSize: 16,
            color: "#52525B",
            fontFamily: "ui-monospace, monospace",
            padding: "8px 20px",
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            letterSpacing: "0.02em",
          }}
        >
          npm install @qcanary/agent · Zero-Trust Queue Observability
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 36,
            left: 0,
            width: "100%",
            textAlign: "center",
            fontSize: 14,
            color: "#52525B",
            fontFamily: "ui-monospace, monospace",
          }}
        >
          qcanary.dev
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
