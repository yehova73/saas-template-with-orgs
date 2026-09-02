import { Button, Link, Text } from "@react-email/components";
import { EmailContainer } from "./email-container";
import { emailStyles } from "./styles";

export default function OrganizationInviteEmail({
  inviteUrl,
  organizationName,
  inviterName,
}: {
  inviteUrl: string;
  organizationName: string;
  inviterName?: string;
}) {
  return (
    <EmailContainer
      preview={`Join ${organizationName} on [placeholder title].`}
      title={`Join ${organizationName}`}
      reason="You're receiving this because an organization admin invited you to [placeholder title]."
      hideUnsubscribe
    >
      <Text style={emailStyles.text}>
        {inviterName || "An organization admin"} invited you to join{" "}
        {organizationName}.
      </Text>

      <Button href={inviteUrl} style={emailStyles.button}>
        Accept invite
      </Button>

      <Text style={emailStyles.text}>
        If the button doesn’t work, copy and paste this link into your browser:
      </Text>
      <Link
        href={inviteUrl}
        style={{ ...emailStyles.text, ...emailStyles.link }}
      >
        {inviteUrl}
      </Link>
    </EmailContainer>
  );
}
