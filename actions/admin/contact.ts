"use server";

import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "../account/account";
import { emailService } from "@/lib/emails/email-service";
import { ServerActionResponse } from "@/hooks/use-server-action";

export const sendContactMessageAction = async (props: {
  firstName: string;
  subject: string;
  email: string;
  message: string;
}): Promise<ServerActionResponse<null>> => {
  await emailService.sendAdminContactRequestEmail({
    email: props.email,
    message: props.message,
    name: props.firstName,
    subject: props.subject,
    type: "contact",
  });
  await prisma.contactRequest.create({
    data: {
      email: props.email,
      firstName: props.firstName,
      lastName: "",
      message: props.message,
      subject: props.subject,
    },
  });
  return {
    status: "ok",
    message: {
      title: "Message sent",
      description: "We'll get back to you within 24 hours.",
    },
  };
};

export const createFeedbackAction = async (data: {
  rank: string;
  category: string;
  feedback: string;
}): Promise<ServerActionResponse<null>> => {
  const user = await getUserFromSession();

  await prisma.feedback.create({
    data: {
      userId: user!.id,
      category: data.category,
      feedback: data.feedback,
      rating: data.rank,
    },
  });

  if (user.email) {
    await emailService.sendAdminContactRequestEmail({
      email: user.email,
      name: user.name || "",
      message: data.feedback,
      subject: data.category,
      type: "support",
    });
  }

  return {
    status: "ok",
    message: {
      title: "Support request sent! We will respond as soon as we can.",
    },
  };
};

export async function deleteContactRequest(
  id: string,
  type: "contact" | "feedback" = "contact",
) {
  if (type === "contact") {
    await prisma.contactRequest.delete({
      where: { id },
    });
  } else if (type === "feedback") {
    await prisma.feedback.delete({
      where: { id },
    });
  }
}
