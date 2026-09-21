import type { PolicyDocument } from "./index";

export const platformPolicy: PolicyDocument = {
  key: "platform",
  title: "Hostelix Platform Terms",
  lastUpdated: new Date().toISOString().slice(0, 10),
  summary:
    "Hostelix is a neutral marketplace that connects students, landlords, caretakers, and market agents while not acting as a party to any individual rental or sale agreement.",
  sections: [
    {
      heading: "About Hostelix",
      paragraphs: [
        "Hostelix is a digital platform that helps students discover hostels, landlords manage listings and tenants, caretakers coordinate property support, and market agents sell essential goods and packs. The platform is designed to make rental and marketplace transactions easier to manage in one place.",
        "Hostelix does not own, manage, or operate every property listed on the platform, and it is not a party to any tenancy agreement, sale agreement, or service contract entered into between users. We provide tools, communication, and payment support, but users remain responsible for the terms they agree with one another.",
      ],
    },
    {
      heading: "Account Responsibility",
      paragraphs: [
        "You must provide accurate and current information when creating and updating your account, including your contact details and identity information when requested. Each person should maintain only one account unless an exception is approved by Hostelix.",
        "You are responsible for keeping your login credentials secure and for notifying Hostelix immediately if you suspect unauthorised access, misuse, or account compromise. Hostelix may take protective steps, including resetting credentials or restricting access, to safeguard the platform.",
      ],
    },
    {
      heading: "Acceptable Use",
      paragraphs: [
        "You must use Hostelix lawfully and in good faith. This means no fraud, harassment, impersonation, spam, scraping, distribution of illegal content, or deceptive behaviour intended to manipulate listings, payments, reviews, or communications.",
        "We may suspend, restrict, or terminate your access to the platform if we believe you have breached these terms, threatened other users, or created operational risk. We may also remove content that violates our policies or the law.",
      ],
    },
    {
      heading: "Data & Privacy",
      paragraphs: [
        "Hostelix collects information needed to provide the service, including account data, communication records, property and booking details, payment references, and support requests. This information is used to operate the platform, improve services, verify listings, manage disputes, and provide customer support.",
        "We do not sell personal data to third parties. We may share limited information with trusted service providers required to process payments, provide hosting, support security, or resolve disputes, and we do so only as necessary and in line with applicable law.",
        "If you want your personal data updated, restricted, or deleted, you may contact Hostelix support with your request. We will assess your request in line with the law, platform needs, and any legal obligations to retain data such as transaction records or fraud investigations.",
      ],
    },
    {
      heading: "Payments & Fees",
      paragraphs: [
        "Payments made through Hostelix are processed through secure payment channels and are subject to the provider's own terms and conditions. Hostelix does not guarantee the availability of any payment method and may suspend a method if there is a security or compliance concern.",
        "Hostelix may charge a service fee for marketplace transactions or other paid features, and the fee schedule will be communicated clearly before you confirm the transaction. Rent payments are usually made directly to the landlord unless Hostelix states otherwise in a specific payment flow.",
      ],
    },
    {
      heading: "Disputes",
      paragraphs: [
        "If a dispute arises between users, the parties should first try to resolve the issue through the built-in communication tools and support channels. Hostelix may offer mediation for marketplace or service conflicts, but our involvement is to facilitate a fair process rather than to act as a court.",
        "Any agreed outcome or final resolution decision will be recorded in the platform record for transparency and future reference. Hostelix may also impose platform-level actions, such as account restrictions or payment holds, where permitted by policy or law.",
      ],
    },
    {
      heading: "Changes to These Terms",
      paragraphs: [
        "Hostelix may update these terms from time to time to reflect legal, operational, or product changes. We will communicate material updates through the platform or email, and the updated effective date will be shown on the policy page.",
        "Continued use of the platform after an update becomes effective means you accept the revised terms. If you do not agree with the changes, you may stop using the platform and close your account where available.",
      ],
    },
    {
      heading: "Governing Law",
      paragraphs: [
        "These terms are governed by the laws of Kenya, including the applicable consumer, data protection, and commercial laws. Any legal action arising from the platform or these terms will be subject to the courts and jurisdiction of Nairobi in Kenya.",
        "If any part of these terms is found to be invalid or unenforceable, the remaining provisions remain in force and continue to apply as intended.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        "Questions about this policy? Contact 0757475316 or softwarewebdevelopers1@gmail.com.",
      ],
    },
  ],
};
