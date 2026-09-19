// Founder's story — written from Jordan Talavera's own account (his context,
// shaped into a narrative in his voice). Used by /our-story and the homepage
// teaser. Industry problems are described as market dynamics; the founder's
// own part is framed as growing without the experience, systems and team he
// has today — never as harming clients.

export const FOUNDER = {
  name: "Jordan Talavera",
  title: "Founder, TruthCore",
};

export const FOUNDER_STORY_TEASER =
  "Twelve years in construction showed me what happens when the cheapest bid wins — and taught me what it really takes to build it right. TruthCore is the company I built on those lessons.";

/** Verbatim line from the story, used on the homepage teaser card. */
export const FOUNDER_TEASER_QUOTE = "We refuse to compete on who can cut the most corners.";

export interface StoryListItem {
  title: string;
  text: string;
}

export interface StorySection {
  heading?: string;
  paragraphs: string[];
  /** Checklist rendered between paragraphs (after `listAfter` paragraphs). */
  list?: StoryListItem[];
  listAfter?: number;
  /** Short line shown large in serif after the section */
  pullQuote?: string;
}

export const FOUNDER_STORY: StorySection[] = [
  {
    paragraphs: [
      "I've spent twelve years in construction — working for other general contractors, for homeowners, and for developers. That's long enough to see how this industry really works, and long enough to learn some lessons the hard way.",
    ],
  },
  {
    heading: "The race to the bottom",
    paragraphs: [
      "In construction, the “market price” is too often set by the newest contractor in town — freshly licensed, with little experience, bidding close to cost just to win the work. Everyone else is expected to match it. And when a number is too low to do the job right, something has to give.",
      "Homeowners end up paying for it later — in surprise change orders, rework and stress. Contractors who look great from the outside turn out to have no systems behind the scenes: no real team, no procedures, no accounting. Developers hand job after job to new contractors who believe they're growing, until those contractors realize they've been building for free, fall behind with their subcontractors, and start robbing Peter to pay Paul just to stay in business.",
      "I know that pressure from the inside. Early in my career, I was a young contractor trying to compete in that market — without the experience, the systems or the team I have today. Nobody sets out to cut corners; the market pushes you there. Those years taught me exactly what it takes to do this the right way.",
    ],
    pullQuote: "When the cheapest bid wins, everyone loses — the homeowner, the crew, and the builder.",
  },
  {
    heading: "The turning point",
    paragraphs: [
      "I spent months asking one question: how do I build a general contractor that people can actually trust? The answer became TruthCore.",
      "Distinct Construction Solutions was simply the name I needed the day I filed for my license. TruthCore is who we really are — the roots, the soul and the foundation of this company.",
    ],
  },
  {
    heading: "Good work is only the beginning",
    paragraphs: [
      "Most people judge a contractor by the finished product. But quality craftsmanship is only part of the job. A good general contractor is responsible for everything that happens around the work, every single day:",
      "Doing all of that — consistently, on every project — takes standards. Standards take time, and time is money. It's exactly what separates a professional builder from the lowest bid.",
    ],
    listAfter: 1,
    list: [
      { title: "Documentation", text: "Contracts, scopes, change orders and approvals — all in writing." },
      { title: "Progress photos", text: "Every phase of your project recorded and shared." },
      { title: "RFIs & coordination", text: "Questions answered, trades scheduled and inspections lined up." },
      { title: "Warranties", text: "Tracked, documented and honored long after we leave." },
      { title: "Employee compliance", text: "Licensing, insurance and labor requirements kept current." },
      { title: "Safety", text: "A safe jobsite for our crew, our subcontractors and your family." },
      { title: "Site cleanliness", text: "A clean, organized jobsite at the end of every day." },
    ],
  },
  {
    heading: "Built on systems, not promises",
    paragraphs: [
      "Standards only hold up with systems behind them. I spent long nights and early mornings building BuildCore, our own in-house platform. Our team, our clients and our vendors all work in it — every schedule, photo, RFI, change order, warranty and dollar is organized and visible. Nothing gets lost, and nobody is left guessing.",
    ],
  },
  {
    heading: "A team that carries the vision",
    paragraphs: [
      "Building the right team took time — months of hiring and making hard decisions, in the field and in the office. Today we have a team that is accountable, honest, and shares one vision: tell the truth, own the outcome, and get better every single time. We do all of it depending on Jesus Christ.",
    ],
  },
  {
    heading: "Lessons that made us",
    paragraphs: [
      "Like anyone who has built a company from the ground up, I've made decisions I would make differently with the experience and systems I have today. Every one of those lessons shaped how TruthCore operates now.",
      "We refuse to compete on who can cut the most corners.",
    ],
    pullQuote: "Not anymore.",
  },
  {
    heading: "Why we're not the cheapest",
    paragraphs: [
      "We value our team's experience and our time — and experience and time cost money. Our pricing reflects what it truly takes to build it right: skilled people, trusted subcontractors who are paid fairly, real systems, and a company that will still be here to stand behind the work years from now.",
      "We'll never be the lowest bid, and that's on purpose. You'll get an honest number up front and a clear explanation of what it covers. If the cheapest price is the only thing that matters, we're not the right fit — and we'll tell you that respectfully. We work with homeowners who value experience and time the way we do.",
      "That's what makes TruthCore different — and why, once you build with us, you won't want to go anywhere else.",
    ],
    pullQuote: "Experience and time cost money. Cutting corners costs more.",
  },
];
