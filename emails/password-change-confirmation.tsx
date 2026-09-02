import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from "@react-email/components";
import { emailStyles } from "./styles";
import { EmailContainer } from "./email-container";

export default function PasswordChangeConfirmationEmail({
  userName,
}: {
  userName?: string;
}) {
  return (
    <EmailContainer
      reason="You're receiving this because you recently updated your password on [placeholder title]."
      preview="Your [placeholder title] password has been changed."
      title="Password Changed"
      hideUnsubscribe
    >
      <Text>Hi{userName ? ` ${userName}` : ""},</Text>
      <Text style={emailStyles.text}>
        This is a confirmation that your [placeholder title] password was successfully
        changed.
      </Text>

      <Text style={emailStyles.text}>
        If you requested this change, no further action is needed.
      </Text>

      <Text style={emailStyles.text}>
        If you did <strong>not</strong> request this change, please contact our
        support team immediately.
      </Text>

      <Button href="mailto:support@[placeholder domain]" style={emailStyles.button}>
        Contact Support
      </Button>

      <Hr style={emailStyles.hr} />

      <Text style={emailStyles.footer}>
        For security, do not share your password. [placeholder title] will never ask for your
        password via email.
      </Text>

      <Text style={emailStyles.footer}>
        Support email:{" "}
        <a
          href="mailto:support@[placeholder domain]"
          style={{ color: "#0662adff", textDecoration: "underline" }}
        >
          support@[placeholder domain]
        </a>
      </Text>
    </EmailContainer>
  );
}
