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

export default function WelcomeEmail() {
  return (
    <Html>
      <Head />
      <Preview>Install the QCanary agent and send your first BullMQ events.</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={heading}>Welcome to QCanary</Heading>
          <Text style={text}>
            QCanary monitors BullMQ queues without asking for Redis credentials. Start by installing
            the agent in the service that creates your queues.
          </Text>
          <Section style={codeBlock}>
            <Text style={code}>npm install @qcanary/agent</Text>
          </Section>
          <Text style={text}>
            Create a project, copy your qca_live_ API key, and initialize QueueMonitor with your
            existing BullMQ queues.
          </Text>
          <Button href="https://qcanary.dev/docs" style={button}>
            View setup guide
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

const codeBlock = {
  backgroundColor: "#111111",
  border: "1px solid #1F1F1F",
  borderRadius: "8px",
  padding: "12px 16px",
};

const code = {
  color: "#22C55E",
  fontFamily: "Menlo, Consolas, monospace",
  fontSize: "14px",
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
