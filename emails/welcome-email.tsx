import { Button, Hr, Section, Text } from "@react-email/components";
import { emailStyles } from "./styles";
import { EmailContainer } from "./email-container";

interface WelcomeEmailProps {
  userName?: string;
  email?: string;
}

export default function WelcomeEmail({ userName, email }: WelcomeEmailProps) {
  return (
    <EmailContainer
      preview="Freeze your browser tabs, eliminate tab clutter, and organize your work."
      title="Welcome to [placeholder title]"
      reason="You're receiving this because you created a [placeholder title] account."
      unsubscribeUrl={`[placeholder url]/unsubscribe?type=important&email=${email}`}
    >
      <Text>Hi{userName ? ` ${userName}` : ""},</Text>

      <Text style={emailStyles.text}>
        Say goodbye to browser anxiety and 40+ open tabs scattered across
        windows. [placeholder title] helps you instantly freeze messy browser sessions into
        clean, organized workspaces so you never lose your place.
      </Text>

      <Section>
        <Text style={emailStyles.subtitle}>3 Quick Steps to Get Started</Text>

        <Section style={emailStyles.listItem}>
          <Text style={emailStyles.listItemTitle}>
            1. Freeze your active window
          </Text>
          <Text style={emailStyles.listItemDescription}>
            Click the [placeholder title] extension icon to capture and save your current
            multi-tab session instantly into a local workspace.
          </Text>
        </Section>

        <Section style={emailStyles.listItem}>
          <Text style={emailStyles.listItemTitle}>2. Name your workspace</Text>
          <Text style={emailStyles.listItemDescription}>
            Assign a project name (e.g., &quot;Project Delta&quot;). [placeholder title]
            prefaces your OS taskbar title so you can Alt-Tab straight back to
            your targeted workflow.
          </Text>
        </Section>

        <Section style={emailStyles.listItem}>
          <Text style={emailStyles.listItemTitle}>
            3. Restore and swap effortlessly
          </Text>
          <Text style={emailStyles.listItemDescription}>
            Reopen your saved link lists into clean, native Chrome windows
            whenever you&apos;re ready to jump back into a project.
          </Text>
        </Section>
      </Section>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.text}>
        Ready to clear the clutter and streamline your tabs? Launch your
        workspace manager now.
      </Text>

      <Button href="[placeholder url]/dashboard" style={emailStyles.button}>
        Open [placeholder title] Dashboard
      </Button>

      <Text style={{ fontSize: "14px", color: "#666", marginTop: "24px" }}>
        — The [placeholder title] Team
      </Text>
    </EmailContainer>
  );
}
