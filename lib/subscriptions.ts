import { SubscriptionType } from "./generated/prisma/enums";

export interface SubscriptionFeature {
  title: string;
  description: string;
}

export interface SubscriptionPrice {
  priceValue: number;
  priceId: string;
}

export interface SubscriptionPlan {
  name: string;
  description: string;
  monthly: SubscriptionPrice;
  yearly: SubscriptionPrice;
  limits: {
    projects: number | "unlimited";
    members: number | "unlimited";
  };
  features: SubscriptionFeature[];
  trialAvailable: boolean;
  type: SubscriptionType;
  recommended: boolean;
}

export const subscriptionsConfig: SubscriptionPlan[] = [
  {
    name: "Starter",
    description:
      "Ideal for individuals and small side projects getting started.",
    monthly: { priceValue: 0, priceId: "" },
    yearly: { priceValue: 0, priceId: "" },
    limits: {
      projects: 3,
      members: 5,
    },
    features: [
      {
        title: "Up to 3 projects",
        description: "Create and manage up to 3 active projects.",
      },
      {
        title: "Up to 5 team members",
        description: "Invite up to 5 members to collaborate in your workspace.",
      },
    ],
    trialAvailable: false,
    type: SubscriptionType.STARTER,
    recommended: false,
  },
  {
    name: "Pro",
    description: "Designed for growing teams and active product workflows.",
    monthly: { priceValue: 29, priceId: "price_pro_monthly" },
    yearly: { priceValue: 290, priceId: "price_pro_yearly" },
    limits: {
      projects: 15,
      members: 20,
    },
    features: [
      {
        title: "Up to 15 projects",
        description: "Scale up to 15 active projects across your organization.",
      },
      {
        title: "Up to 20 team members",
        description: "Collaborate with up to 20 team members simultaneously.",
      },
    ],
    trialAvailable: true,
    type: SubscriptionType.PRO,
    recommended: true,
  },
  {
    name: "Ultimate",
    description: "Maximum scale and resources for high-output organizations.",
    monthly: { priceValue: 79, priceId: "price_ultimate_monthly" },
    yearly: { priceValue: 790, priceId: "price_ultimate_yearly" },
    limits: {
      projects: "unlimited",
      members: "unlimited",
    },
    features: [
      {
        title: "Unlimited projects",
        description: "Build, launch, and host as many projects as you need.",
      },
      {
        title: "Unlimited team members",
        description: "Bring your entire team on board with zero seat limits.",
      },
    ],
    trialAvailable: true,
    type: SubscriptionType.ULTIMATE,
    recommended: false,
  },
];

export interface FeatureAccess {
  projectsLimit: number | null; // null represents unlimited access
  membersLimit: number | null;
}

export const FeatureAccessConfig: Record<SubscriptionType, FeatureAccess> = {
  [SubscriptionType.STARTER]: {
    projectsLimit: 3,
    membersLimit: 5,
  },
  [SubscriptionType.PRO]: {
    projectsLimit: 15,
    membersLimit: 20,
  },
  [SubscriptionType.ULTIMATE]: {
    projectsLimit: null, // Unlimited
    membersLimit: null, // Unlimited
  },
};
