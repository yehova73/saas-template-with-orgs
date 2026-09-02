"use server";

import { prisma } from "@/lib/prisma";
import { stripe } from "./config";
import { requireOrganizationPermission } from "@/actions/organizations/organization/permissions";

const INVOICES_PER_PAGE = 10;

export const getInvoicesAction = async (startingAfter?: string) => {
  const { organization } = await requireOrganizationPermission("manageBilling");
  const subscription = await prisma.subscription.findUnique({
    where: { organizationId: organization.id },
    select: { stripeCustomerId: true },
  });

  if (!subscription?.stripeCustomerId) {
    return { invoices: [], hasMore: false, nextCursor: null };
  }

  const invoices = await stripe.invoices.list({
    customer: subscription.stripeCustomerId,
    limit: INVOICES_PER_PAGE,
    ...(startingAfter ? { starting_after: startingAfter } : {}),
  });

  return {
    invoices: invoices.data.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      created: invoice.created,
      amount: invoice.amount_paid || invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      receiptUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
    })),
    hasMore: invoices.has_more,
    nextCursor: invoices.data.at(-1)?.id ?? null,
  };
};
