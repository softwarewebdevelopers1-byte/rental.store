import type { PolicyDocument } from "./index";

export const caretakerPolicy: PolicyDocument = {
  key: "caretaker",
  title: "Caretaker Terms & Rights",
  lastUpdated: new Date().toISOString().slice(0, 10),
  summary:
    "As a caretaker, you work with the landlord to maintain a hostel, respond to maintenance issues, respect privacy, and support a safe and orderly environment for tenants.",
  sections: [
    {
      heading: "Your Rights as a Caretaker",
      paragraphs: [
        "You have the right to receive clear instructions from the landlord about the hostel, the expected standards of care, and any maintenance or access requirements. This helps you understand the scope of your role and reduces conflict during service delivery.",
        "You are not expected to make decisions outside the authority you were given. If a matter falls outside your assigned duties or requires a landlord decision, you should escalate the issue instead of acting without approval.",
        "Your messages and personal information should be handled with respect, and you should be able to communicate with the landlord and tenants in a way that supports efficient problem-solving without unnecessary exposure of private details.",
      ],
    },
    {
      heading: "Your Responsibilities",
      paragraphs: [
        "You must respond to maintenance requests assigned to you in a timely and professional manner. This includes inspecting the issue, communicating updates, and escalating unresolved matters to the landlord or appropriate authority when needed.",
        "You should communicate courteously with students and tenants, keep matters factual and respectful, and handle sensitive information with care. Student information should only be used for the purpose of supporting the hostel operations and not shared beyond the platform or required team members.",
      ],
    },
    {
      heading: "Scope of Access",
      paragraphs: [
        "Your access to the platform is limited to the hostels and students assigned to your role. You should not view records or information outside the scope of your duty unless the landlord specifically grants access for a valid reason.",
        "If a task requires financial or tenant management access beyond your role, you should request support from the landlord or Hostelix rather than viewing or changing records you are not authorised to handle.",
      ],
    },
    {
      heading: "Conduct",
      paragraphs: [
        "You must communicate respectfully, keep interactions professional, and avoid any behaviour that could be perceived as coercive, abusive, discriminatory, or inappropriate. This includes communication with students, tenants, and landlords through the platform.",
        "You must not share student contact details outside the platform, solicit business from tenants, or use your role to promote unrelated services. Hostelix may restrict or remove access when a caretaker breaches these standards.",
      ],
    },
    {
      heading: "Termination of Assignment",
      paragraphs: [
        "Your assignment to a hostel may end when the landlord removes you from the role, the tenancy ends, or a formal review finds that your access or conduct is no longer appropriate. Hostelix may also disable access if the account is inactive or non-compliant with platform rules.",
        "Once the assignment ends, your access to the hostel records, communications, and related tools should be removed promptly. Any unresolved issues or records should be handed over to the landlord or the platform support team as required.",
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
