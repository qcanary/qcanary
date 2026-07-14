import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";

export default function UsageAlertEmail() {
  return (
    <Html>
      <Head />
      <Preview>You're at 90% of your free limit</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Your free queue is almost full.</Heading>
          <Text style={text}>
            You're currently using 90% of your free queue limit. In about 24 hours, new events will
            be dropped until you upgrade or wait for the daily reset.
          </Text>
          <Text style={text}>
            Upgrade to <strong>Team ($39/month)</strong> for:
          </Text>
          <Text style={text}>
            → 100,000 events/day (20x more)
            <br />
            → 10 queues (10x more)
            <br />
            → 30-day history
            <br />
            → Slack alerts
          </Text>
          <Button href="https://qcanary.dev/pricing" style={button}>
            Upgrade Now →
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#FFFFFF",
  color: "#1A1A1A",
  fontFamily: "Inter, Arial, sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "32px 20px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "28px",
  lineHeight: "36px",
  margin: "0 0 16px",
  color: "#111111",
};

const text = {
  color: "#52525B",
  fontSize: "15px",
  lineHeight: "24px",
};

const button = {
  backgroundColor: "#22C55E",
  borderRadius: "6px",
  color: "#000000",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "16px",
  padding: "12px 16px",
  textDecoration: "none",
};
