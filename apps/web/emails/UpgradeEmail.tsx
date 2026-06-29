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
      <Preview>Keep more BullMQ history and raise your QCanary usage limits.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Keep more queue history</Heading>
          <Text style={text}>
            QCanary plans include project, event, alert, and history limits so your team can scale
            monitoring as queue volume grows.
          </Text>
          <Text style={text}>
            Starter adds 30-day history and alert rules. Pro adds unlimited projects, unlimited
            daily events, webhooks, and 90-day history.
          </Text>
          <Button href="https://qcanary.dev/settings" style={button}>
            Review plans
          </Button>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#0A0A0A",
  color: "#FAFAFA",
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
};

const text = {
  color: "#D4D4D8",
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
