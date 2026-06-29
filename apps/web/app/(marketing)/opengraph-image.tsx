import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QCanary - Monitor BullMQ queues without sharing Redis credentials";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0A0A0A",
          color: "#FAFAFA",
          fontFamily: "Inter, Arial, sans-serif",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            border: "2px solid #1F1F1F",
            borderTop: "12px solid #22C55E",
            borderRadius: "28px",
            padding: "56px",
            background: "#111111",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#22C55E",
              }}
            />
            <div
              style={{
                fontSize: "34px",
                fontWeight: 700,
                letterSpacing: "0",
              }}
            >
              QCanary
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                color: "#22C55E",
                fontSize: "30px",
                fontWeight: 700,
                marginBottom: "22px",
              }}
            >
              BullMQ monitoring for production teams
            </div>
            <div
              style={{
                fontSize: "76px",
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: "0",
              }}
            >
              Monitor BullMQ Queues
            </div>
            <div
              style={{
                marginTop: "28px",
                color: "#D4D4D8",
                fontSize: "42px",
                fontWeight: 600,
              }}
            >
              Without Sharing Redis Credentials
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#A1A1AA",
              fontSize: "24px",
            }}
          >
            <span>No Redis exposure</span>
            <span>No firewall changes</span>
            <span>Real-time alerts</span>
          </div>
        </div>
      </div>
    ),
    size
  );
}
