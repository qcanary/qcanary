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

export default function FinalNudgeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Last chance: 50% off your first year</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>We're offering 50% off Solo, Team, or Business for your first year.</Heading>
          <Text style={text}>
            You've been using QCanary for 2 weeks. We hope it's been helpful.
          </Text>
          <Text style={text}>
            We're a small team building this in public. If QCanary has saved you even one hour of
            debugging, we'd love to have you as a paying customer.
          </Text>
          <Text style={text}>
            For the next 7 days, use code <strong>EARLYBIRD</strong> for 50% off your first year:
          </Text>
          <Text style={text}>
            → Solo: <strong>$7.50/month</strong> (was $15)
            <br />
            → Team: <strong>$19.50/month</strong> (was $39)
            <br />
            → Business: <strong>$74.50/month</strong> (was $149)
          </Text>
          <Text style={{ ...text, fontSize: "13px", color: "#71717A" }}>
            This is a genuine limited offer. We can't afford to run it forever.
          </Text>
          <Button href="https://qcanary.dev/pricing" style={button}>
            Claim 50% Off →
          </Button>
          <Text style={text}>
            If QCanary isn't right for you, no hard feelings. Just reply and let us know what we're
            missing.
          </Text>
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
