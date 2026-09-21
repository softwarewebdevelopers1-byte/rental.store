import type { PolicyDocument } from "./index";

export const landlordPolicy: PolicyDocument = {
  key: "landlord",
  title: "Landlord Terms & Rights",
  lastUpdated: new Date().toISOString().slice(0, 10),
  summary:
    "As a landlord, you can list a property, verify tenants, receive rent records, manage maintenance and tenancy decisions, and rely on Hostelix for dispute support as a neutral platform.",
  sections: [
    {
      heading: "Your Rights as a Landlord",
      paragraphs: [
        "You have the right to verify prospective tenants before accepting a booking or tenancy. This may include checking identification, confirming payment ability, and reviewing the information provided on the application or profile.",
        "You are entitled to receive rent on time in line with the agreed schedule and to keep a record of payment status and outstanding balances. Hostelix supports this process by providing reminders and status tracking but does not hold your rent on your behalf.",
        "You can protect yourself from fraudulent bookings by reviewing applicant details, requiring verification, and declining applicants that do not meet your standards or the platform rules. You may also deactivate a hostel you no longer wish to list at any time, subject to any existing obligations.",
      ],
    },
    {
      heading: "Your Responsibilities",
      paragraphs: [
        "You must provide accurate information about the property, price, amenities, and availability. Listings should reflect the actual condition of the hostel and not mislead students about the quality, safety, or terms of occupancy.",
        "You are responsible for maintaining the property in a safe and habitable condition, addressing urgent maintenance issues promptly, and responding to reasonable repair requests within a reasonable time. You must respect tenant privacy and treat all prospective and current tenants fairly and lawfully.",
        "You must not discriminate unlawfully or deny access on grounds that are protected by law. Any decisions about a tenancy should be based on valid, lawful, and consistent criteria, including platform rules and your own lawful policies.",
      ],
    },
    {
      heading: "Verification",
      paragraphs: [
        "The verification process may ask you to provide documentation, transact in line with known seller or landlord criteria, or confirm identity details. Hostelix may review these items to reduce risk, improve trust, and protect other users.",
        "A verified badge signals that a profile or listing has met the required verification steps, but it does not guarantee future performance or eliminate all risk. Hostelix may revoke verification if information is found to be inaccurate, fraudulent, or otherwise non-compliant.",
      ],
    },
    {
      heading: "Managing Tenants",
      paragraphs: [
        "You may accept or reject students based on your criteria and the information available through the platform. You should keep clear tenant records, including payment information, communications, and any issues raised during the tenancy, so that disputes can be resolved fairly.",
        "Tenant records and personal information must be kept confidential and used only for legitimate rental operations, support, and compliance. You must handle requests to vacate or move out in line with the relevant rental agreement and the notice period stated on the platform or in the tenancy record.",
      ],
    },
    {
      heading: "Caretakers",
      paragraphs: [
        "You may assign one or more caretakers to a hostel to support maintenance, checks, and communication. When you appoint a caretaker through Hostelix, you remain responsible for the actions and omissions of that person in relation to your hostel and your tenants, as far as they are acting on your behalf.",
        "You should provide clear instructions, maintain access levels that are appropriate to the role, and review reports and service requests so that the caretaker can support the property effectively and lawfully.",
      ],
    },
    {
      heading: "Payments & Reminders",
      paragraphs: [
        "Rent records are used to track payments due, made, missed, or outstanding. Hostelix may automatically send reminders to students when a due date is approaching or when a payment appears overdue, but it does not hold or receive rent on your behalf.",
        "Payment records are important evidence if a dispute arises, but the ultimate obligation to collect and account for rent remains between you and the tenant. Hostelix may support with documentation, notices, and mediation services if needed.",
      ],
    },
    {
      heading: "Termination",
      paragraphs: [
        "A tenancy may be terminated for valid reasons, including non-payment, serious misconduct, damage, or breach of a lawful house rule. The process should follow the terms of the rental agreement, any local legal requirements, and the notice period communicated in the tenancy record.",
        "When a tenancy ends, you should record the termination on the platform promptly and provide the necessary information needed to update the property status, settlement of costs, and any outstanding payments or maintenance issues.",
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
