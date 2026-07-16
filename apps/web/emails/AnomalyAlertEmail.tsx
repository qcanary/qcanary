import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface AnomalyAlertEmailProps {
  queueName: string;
  ruleName: string;
  ruleDescription: string;
  severity: "critical" | "warning";
  currentValue: number;
  baselineValue: number;
  deviation: number;
  projectId: string;
  appUrl?: string;
}

export default function AnomalyAlertEmail({
  queueName,
  ruleName,
  ruleDescription,
  severity,
  currentValue,
  baselineValue,
  deviation,
  projectId,
  appUrl = "https://qcanary.dev",
}: AnomalyAlertEmailProps) {
  const emoji = severity === "critical" ? "🚨" : "⚠️";

  return (
    <Html>
      <Head />
      <Preview>
        {emoji} Anomaly detected: {queueName} — {ruleName}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={headerText}>QCanary Anomaly Detection</Text>
          </Section>

          <Heading style={heading}>
            {emoji} {ruleName} detected on <span style={highlight}>{queueName}</span>
          </Heading>

          <Section style={card}>
            <Text style={description}>{ruleDescription}</Text>

            <Section style={metricsContainer}>
              <div style={metricRow}>
                <Text style={metricLabel}>Current value</Text>
                <Text style={{ ...metricValue, color: severity === "critical" ? "#EF4444" : "#F59E0B" }}>
                  {formatValue(currentValue)}
                </Text>
              </div>
              <div style={metricRow}>
                <Text style={metricLabel}>Normal baseline</Text>
                <Text style={metricValue}>{formatValue(baselineValue)}</Text>
              </div>
              <div style={metricRow}>
                <Text style={metricLabel}>Deviation</Text>
                <Text style={{ ...metricValue, color: severity === "critical" ? "#EF4444" : "#F59E0B" }}>
                  {deviation.toFixed(1)}x normal
                </Text>
              </div>
              <div style={metricRow}>
                <Text style={metricLabel}>Severity</Text>
                <Text style={metricValue}>
                  <span style={{
                    ...severityBadge,
                    backgroundColor: severity === "critical" ? "#EF4444" : "#F59E0B",
                  }}>
                    {severity.toUpperCase()}
                  </span>
                </Text>
              </div>
            </Section>

            <Button href={`${appUrl}/${projectId}/queues/${encodeURIComponent(queueName)}`} style={button}>
              View Queue →
            </Button>
          </Section>

          <Text style={footer}>
            This anomaly was automatically detected by QCanary's rule-based detection system.
            <br />
            Manage detection settings in your project dashboard.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function formatValue(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  if (value >= 1) return value.toFixed(2);
  if (value > 0) return (value * 100).toFixed(1) + "%";
  return "0";
}

const body = {
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
  fontFamily: "Inter, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "0 20px",
  maxWidth: "560px",
};

const header = {
  borderBottom: "1px solid #E4E4E7",
  paddingBottom: "16px",
  marginBottom: "24px",
};

const headerText = {
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#22C55E",
  margin: "0",
};

const heading = {
  fontSize: "24px",
  lineHeight: "32px",
  margin: "0 0 20px",
  color: "#111111",
  fontWeight: "600",
};

const highlight = {
  color: "#22C55E",
  fontWeight: "700",
};

const card = {
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  padding: "24px",
  border: "1px solid #E4E4E7",
};

const description = {
  fontSize: "15px",
  lineHeight: "24px",
  color: "#52525B",
  marginBottom: "20px",
};

const metricsContainer = {
  marginBottom: "20px",
};

const metricRow = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  alignItems: "center" as const,
  paddingTop: "8px",
  paddingBottom: "8px",
  borderBottom: "1px solid #E4E4E7",
};

const metricLabel = {
  fontSize: "14px",
  color: "#71717A",
  margin: "0",
};

const metricValue = {
  fontSize: "14px",
  fontWeight: "600" as const,
  color: "#111111",
  margin: "0",
};

const severityBadge = {
  display: "inline-block",
  padding: "2px 8px",
  borderRadius: "9999px",
  color: "#FFFFFF",
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "0.05em",
};

const button = {
  backgroundColor: "#22C55E",
  borderRadius: "6px",
  color: "#000000",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "8px",
  padding: "12px 16px",
  textDecoration: "none",
};

const footer = {
  fontSize: "12px",
  lineHeight: "20px",
  color: "#A1A1AA",
  marginTop: "24px",
  textAlign: "center" as const,
};
