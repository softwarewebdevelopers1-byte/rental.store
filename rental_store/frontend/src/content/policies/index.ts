import { caretakerPolicy } from "./caretaker";
import { landlordPolicy } from "./landlord";
import { marketAgentPolicy } from "./marketAgent";
import { platformPolicy } from "./platform";
import { studentPolicy } from "./student";

export interface PolicySection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface PolicyDocument {
  key: PolicyKey;
  title: string;
  lastUpdated: string;
  summary: string;
  sections: PolicySection[];
}

export type PolicyKey =
  | "platform"
  | "student"
  | "landlord"
  | "caretaker"
  | "marketAgent";

export const policies: Record<PolicyKey, PolicyDocument> = {
  platform: platformPolicy,
  student: studentPolicy,
  landlord: landlordPolicy,
  caretaker: caretakerPolicy,
  marketAgent: marketAgentPolicy,
};

export function urlSlugToPolicyKey(slug: string): PolicyKey {
  switch (slug) {
    case "platform":
      return "platform";
    case "student":
      return "student";
    case "landlord":
      return "landlord";
    case "caretaker":
      return "caretaker";
    case "market-agent":
      return "marketAgent";
    default:
      return "platform";
  }
}

export function policyKeyToUrlSlug(key: PolicyKey): string {
  if (key === "marketAgent") {
    return "market-agent";
  }

  return key;
}
