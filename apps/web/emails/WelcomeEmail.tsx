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

const codeBlock = {
  backgroundColor: "#F4F4F5",
  border: "1px solid #E4E4E7",
  borderRadius: "8px",
  padding: "12px 16px",
};

const code = {
  color: "#16A34A",
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
