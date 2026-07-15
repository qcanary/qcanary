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

export default function UpgradeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Your queues are running smoothly. Ready to upgrade?</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>You've been using QCanary for a week.</Heading>
          <Text style={text}>
            You've been monitoring your queues with QCanary for 7 days. The free tier is great for
            evaluation, but production apps need more:
          </Text>
          <Text style={text}>
            → 5 queues (not 1) with Solo at <strong>$15/month</strong>
            <br />
            → 14-day history (not 24 hours)
            <br />
            → Slack alerts (not just email)
            <br />
            → Unlimited alert rules with Team ($39/month)
          </Text>
          <Text style={text}>
            Solo is perfect for indie hackers going to production. Team adds team access, webhooks,
            and API access for growing teams.
          </Text>
          <Button href="https://qcanary.dev/pricing" style={button}>
            Compare Plans →
          </Button>
          <Text style={text}>
            Questions? Just reply to this email.
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
