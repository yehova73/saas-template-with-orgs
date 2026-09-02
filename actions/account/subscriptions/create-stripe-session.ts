"use server";

import { requireOrganizationPermission } from "@/actions/organizations/organization";
import { prisma } from "@/lib/prisma";
import { stripe } from "./config";
import { ServerActionResponse } from "@/hooks/use-server-action";

export const createStripeSessionAction = async (
  priceId: string,
): Promise<ServerActionResponse<{ url: string | null }>> => {
  const { user, organization } =
    await requireOrganizationPermission("manageBilling");

  const organizationDetails = await prisma.organization.findFirst({
    where: { id: organization.id },
    select: { id: true, subscription: true },
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    ...(organizationDetails?.subscription?.stripeCustomerId
      ? { customer: organizationDetails.subscription.stripeCustomerId }
      : user.email
        ? { customer_email: user.email }
        : {}),
    mode: "subscription",
    success_url: `${process.env.NEXTAUTH_URL}/api/stripe/session-completed?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/app/organsation-settings/billing?action=session_canceled`,
    metadata: {
      organizationId: organization.id,
      initiatedByUserId: user.id,
    },
  });

  return {
    status: "ok",
    data: { url: session.url },
  };
};
