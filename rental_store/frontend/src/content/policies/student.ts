import type { PolicyDocument } from "./index";

export const studentPolicy: PolicyDocument = {
  key: "student",
  title: "Student Terms & Rights",
  lastUpdated: new Date().toISOString().slice(0, 10),
  summary:
    "As a student, you can browse verified listings, keep your information private, pay rent in line with your tenancy, and raise issues when your hostel or order is not meeting expectations.",
  sections: [
    {
      heading: "Your Rights as a Student",
      paragraphs: [
        "You have the right to view accurate and up-to-date hostel listings before making a booking or joining a hostel. If a listing is inaccurate or misleading, you may report it to Hostelix and ask for follow-up support.",
        "You are entitled to a clear rental arrangement with your landlord or hostel manager, including the amount due, notice requirements, and the expected terms of your stay. Hostelix can help document concerns, but it does not replace the contract between you and the landlord.",
        "You may report maintenance issues, safety concerns, or service problems and expect acknowledgement and reasonable follow-up. Your messages are private to the extent allowed by the platform and the law, and you may rate your hostel once your tenancy or order is complete.",
      ],
    },
    {
      heading: "Your Responsibilities",
      paragraphs: [
        "You must pay rent on time, keep your room and shared spaces reasonably clean, and respect the rules of the hostel and the other occupants. This includes complying with quiet hours, waste disposal requirements, and any house rules communicated by the landlord or caretaker.",
        "You must report damage or loss promptly, avoid subletting or assigning your room without approval, and cooperate with any maintenance or verification process needed to keep the property safe and habitable. Failure to do so may affect your continued tenancy or access to services.",
      ],
    },
    {
      heading: "Payments",
      paragraphs: [
        "Rent is normally due in line with the payment schedule shown in your tenancy or hostel record. Hostelix can send reminders before due dates, but the final payment obligation remains between you and the landlord.",
        "If your payment status shows PENDING, it means the payment is still being processed or not yet confirmed. An OVERDUE status means the amount remains unpaid after the due date and may trigger reminders, penalties, or follow-up by the landlord.",
        "Persistent late payments may lead to escalation, restricted access, or termination of the tenancy in line with the hostel's rules and the applicable rental agreement. Hostelix may record the payment history to support reminders and dispute resolution.",
      ],
    },
    {
      heading: "Maintenance & Repairs",
      paragraphs: [
        "When you notice a maintenance issue, you should report it through the platform as soon as possible and include a clear description of the problem. The landlord or caretaker will review the request and may ask for additional details before arranging action.",
        "Reasonable repair timelines depend on the urgency of the problem, the type of issue, and the availability of the responsible party. For example, urgent plumbing or security issues should be addressed quickly, while cosmetic or minor wear may take longer.",
        "If the damage is caused by normal wear and tear, the landlord is generally responsible for repair. If the issue was caused by your negligence, misuse, or failure to maintain the room, you may be expected to cover the cost or assist with the fix.",
      ],
    },
    {
      heading: "Moving Hostels",
      paragraphs: [
        "You may use the Change Hostel feature to move to another hostel if the new hostel accepts you and the platform allows the transfer. The feature keeps your account active so you do not have to create a new profile each time you move.",
        "You should provide the notice required by your current rental agreement or hostel rules before moving. Hostelix will update your active hostel record after the transfer is confirmed and may notify the previous landlord or hostel manager.",
      ],
    },
    {
      heading: "Marketplace Orders",
      paragraphs: [
        "When you place a marketplace order, you are entitled to receive the goods or services you paid for in the condition and quantity described. If an item is missing, damaged, delayed, or incorrect, you should report it through the order support process without delay.",
        "Hostelix will assist in coordinating a dispute between you and the market agent, but a final resolution may depend on the order timeline, proof of delivery, and the facts of the complaint. Refunds or other remedies may be offered if the issue is valid and supported by evidence.",
      ],
    },
    {
      heading: "Reviews & Ratings",
      paragraphs: [
        "You may rate your hostel or host after your tenancy is complete. Reviews should be honest, factual, and respectful so they help future students make informed decisions without being abusive or defamatory.",
        "Hostelix may moderate reviews that include threats, hate speech, personal attacks, or false claims, and may remove content that violates platform rules or the law.",
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
