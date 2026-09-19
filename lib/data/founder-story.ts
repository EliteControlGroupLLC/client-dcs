// Founder's story — written from Jordan Talavera's own account (his context,
// shaped into a narrative in his voice). Used by /our-story and the homepage
// teaser.

export const FOUNDER = {
  name: "Jordan Talavera",
  title: "Founder, TruthCore",
};

export const FOUNDER_STORY_TEASER =
  "Twelve years on every side of construction taught me what goes wrong when the cheapest bid wins — because I lived it and made those mistakes myself. TruthCore is the company I built so it never happens again.";

export interface StorySection {
  heading?: string;
  paragraphs: string[];
  /** Short line shown large in serif after the section */
  pullQuote?: string;
}

export const FOUNDER_STORY: StorySection[] = [
  {
    paragraphs: [
      "I've spent twelve years in construction — working for other general contractors, for homeowners, and for developers. I haven't just watched what goes wrong in this industry. I've lived it, and I've made those mistakes myself.",
    ],
  },
  {
    heading: "The race to the bottom",
    paragraphs: [
      "In this business, the “market price” is often set by the newest contractor in town — freshly licensed, little experience, bidding close to cost just to win the job. Everyone else is expected to match it. I've been that contractor, and I've been the one forced to match him. To make a number like that work, something has to give, and it's almost always the quality of the work.",
      "I've seen understanding homeowners hire the lowest bid and pay for it later — in change orders, in rework, in stress. I've been part of that story. I've also seen, and been, the contractor who looked great from the outside but had no real systems behind the scenes: no team, no procedures, no accounting. When that happens, clients' money gets managed poorly, even when nobody means for it to.",
      "And I've seen developers hand job after job to new contractors, making them feel like they're growing — until the contractor realizes he's been building for free, owes subcontractors he never meant to hurt, and is robbing Peter to pay Paul just to keep the doors open. I know that feeling firsthand.",
    ],
    pullQuote: "When the cheapest bid wins, everyone loses — the homeowner, the crew, and the builder.",
  },
  {
    heading: "The turning point",
    paragraphs: [
      "After living all of it, I spent months asking one question: how do I build a general contractor that people can actually trust? The answer became TruthCore.",
      "Distinct Construction Solutions was simply the name I needed in the moment I filed for my license. TruthCore is who we really are — the roots, the soul and the foundation of this company.",
    ],
  },
  {
    heading: "Built on systems, not promises",
    paragraphs: [
      "Trust isn't a slogan; it's a system. I spent long nights and early mornings building BuildCore, our own in-house platform. Our team, our clients and our vendors all work in it, so every schedule, update, change and dollar is organized and visible. Nothing gets lost, and nobody is left guessing.",
    ],
  },
  {
    heading: "A team that carries the vision",
    paragraphs: [
      "Building the right team took time — months of hiring and letting people go, in the field and in the office. Today we have a team that is accountable, honest, and shares one vision: tell the truth, own the outcome, and get better every single time. We do all of it depending on Jesus Christ.",
    ],
  },
  {
    heading: "Owning our mistakes",
    paragraphs: [
      "The mistakes I made in my career affected more than me — they affected colleagues, vendors and subcontractors. None of it was ever intentional. We were stuck trying to meet a market that rewards cutting corners.",
    ],
    pullQuote: "Not anymore.",
  },
  {
    heading: "Why we're not the cheapest",
    paragraphs: [
      "We value our team's experience and our time — and experience and time cost money. Our pricing reflects what it truly takes to build it right: skilled people, trusted subcontractors who get paid fairly, real systems, and a company that will still be here to stand behind the work years from now.",
      "We'll never be the lowest bid, and that's on purpose. We'll give you an honest number up front and explain exactly what it covers. If the cheapest price is the only thing that matters, we're not the right fit — and we'll tell you that respectfully. We work with homeowners who value experience and time the way we do.",
      "That is what makes TruthCore different — and why, once you build with us, you won't want to go anywhere else.",
    ],
    pullQuote: "Experience and time cost money. Cutting corners costs more.",
  },
];
