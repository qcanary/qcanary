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

export default function TipsEmail() {
  return (
    <Html>
      <Head />
      <Preview>Add Slack, email, or webhook alerts for BullMQ failures.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Turn queue events into alerts</Heading>
          <Text style={text}>
            Once events are flowing, create alert rules for failure rate, no activity, queue depth,
            and long-running jobs. Starter plans include Slack and email alerts; Pro adds webhooks.
          </Text>
          <Text style={text}>
            A good first rule: alert when the failure rate is above 5% over the last 10 minutes for
            a production queue.
          </Text>
          <Button href="https://qcanary.dev/docs" style={button}>
            Configure alerts
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
