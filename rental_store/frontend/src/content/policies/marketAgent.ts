import type { PolicyDocument } from "./index";

export const marketAgentPolicy: PolicyDocument = {
  key: "marketAgent",
  title: "Market Agent Terms & Rights",
  lastUpdated: new Date().toISOString().slice(0, 10),
  summary:
    "As a market agent, you may list products and packs, set your own prices, fulfil orders, and cooperate with Hostelix in managing disputes, delivery, and platform compliance.",
  sections: [
    {
      heading: "Your Rights as a Market Agent",
      paragraphs: [
        "You have the right to list products and packs for sale in the Hostelix marketplace, subject to the platform rules and the law. This includes the ability to set your own effective prices and communicate product details clearly to students.",
        "If you fulfil a valid order successfully, you are entitled to receive payment in line with the order and settlement flow that Hostelix provides. Hostelix will not unreasonably withhold payment when the order is complete and compliant with the platform terms.",
      ],
    },
    {
      heading: "Your Responsibilities",
      paragraphs: [
        "You must describe your products accurately, deliver what you promised, and keep the information on your listings up to date. This includes pricing, stock availability, delivery times, and any special conditions that affect the buyer's decision.",
        "You must respond to order updates in a reasonable time and handle problems honestly and in good faith. If you cannot fulfil an order, you should communicate early, stop the sale when necessary, and cooperate with alternative arrangements or refund processes.",
      ],
    },
    {
      heading: "Listing Rules",
      paragraphs: [
        "Your listings must not include prohibited or hazardous items, such as weapons, drugs, counterfeit goods, stolen property, or any product that violates Kenyan law or Hostelix policies. Listings should reflect actual products and avoid misleading representations.",
        "Photos should be accurate and recent, and descriptions should be clear enough for buyers to understand what they are purchasing. Misleading pricing, untrue product claims, or fake availability are not allowed and may lead to removal or suspension.",
      ],
    },
    {
      heading: "Orders & Delivery",
      paragraphs: [
        "Orders typically move through defined statuses such as PAID, PREPARING, SHIPPED, DELIVERED, and RECEIVED. You must keep the order record current and accurately change statuses when the order progresses or is delayed.",
        "If an order cannot be delivered or completed as promised, you should communicate the issue quickly and cooperate with Hostelix support to resolve the problem. This may involve rescheduling, arranging a refund, or supporting a dispute investigation.",
      ],
    },
    {
      heading: "Conflicts & Disputes",
      paragraphs: [
        "If a student reports an issue with an order, Hostelix may ask you to provide information about the order, delivery, status, or product details. You must cooperate with the investigation and respond in good faith so the matter can be resolved fairly.",
        "Repeated unresolved conflicts or poor handling of customer issues can result in restrictions, penalties, or suspension. Hostelix may also record the dispute outcome to help protect future buyers and sellers.",
      ],
    },
    {
      heading: "Fees",
      paragraphs: [
        "Hostelix may charge a service fee, commission, or other marketplace fee on orders processed through the platform. The exact rate and billing method will be separately communicated and may vary by product or channel.",
        "You are responsible for understanding the fee schedule before listing products and for ensuring the pricing you set remains compliant with the platform's operations and applicable law.",
      ],
    },
    {
      heading: "Suspension",
      paragraphs: [
        "Hostelix may suspend your listings, temporarily restrict your account, or remove your access if you breach platform rules, fail to fulfil legitimate orders, or expose users to a legal or safety risk. You may be asked to correct the issue or provide information before a decision is made.",
        "If your account is suspended, you may submit an appeal explaining the facts and why the restriction should be lifted. Hostelix will review the information and may restore access when the issue is resolved.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about this policy? Contact legal@hostelix.example.",
      ],
    },
  ],
};
