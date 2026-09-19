// Founder's story — Jordan Talavera's own words (lightly edited for spelling,
// grammar and flow only). Used by the /our-story page and the homepage teaser.

export const FOUNDER = {
  name: "Jordan Talavera",
  title: "Founder, TruthCore",
};

export const FOUNDER_STORY_TEASER =
  "After 12 years in the construction industry, I've seen it all — and I've lived it: cutting corners to meet the market price, homeowners hurt by bad work and change orders, building for free just to stay afloat. I made those mistakes myself. TruthCore was born to change that.";

export interface StorySection {
  heading?: string;
  paragraphs: string[];
  /** Short line shown large in serif after the section */
  pullQuote?: string;
}

export const FOUNDER_STORY: StorySection[] = [
  {
    paragraphs: [
      "After 12 years in the construction industry — working for other general contractors, homeowners, and developers — I've seen it all. And I haven't just seen it: everything I describe here, I've lived. I've been in every one of these positions, and I've made these mistakes myself.",
      "I've seen contractors cut corners to make budgets work and still turn a profit, all because we \u201Cneed\u201D to meet the market price — and I've been in that position. That market price is set by newly licensed contractors with no experience doing work for close to cost, and everyone else is pressured to match it. I know the frustration and stress of cutting corners just to make ends meet, because I've lived it.",
      "I've seen understanding homeowners hurt by change orders and bad work because they didn't know any better and hired the cheapest guy — and I've been in that position. I've seen what looked like great contractors who, behind the scenes, had no systems, no team, no procedures and no accounting, so their clients' funds were poorly managed — and I've been in that position too.",
      "I've seen developers hand job after job to freshly licensed contractors, making them feel like they're growing and expanding — and I've been in that position. In the end, the contractor finds out he's been building for free, is in debt to subcontractors he never meant to affect, and is robbing Peter to pay Paul just to keep his company alive. I know that feeling firsthand.",
    ],
  },
  {
    heading: "The turning point",
    paragraphs: [
      "Throughout the last several years, I've experienced all of this myself. After months of figuring out how I could make a real change in the construction industry — how to be a general contractor that can actually be trusted — TruthCore was born.",
      "Distinct Construction Solutions was a name that came to me in the moment, when I filed for my license. TruthCore is not only our name; it is the roots, the soul and the foundation of my company.",
    ],
    pullQuote: "TruthCore is the roots, the soul and the foundation of my company.",
  },
  {
    heading: "Built on systems, not promises",
    paragraphs: [
      "I've spent long nights, early mornings and months developing BuildCore, our custom in-house CRM. It isn't just for me — my team, our clients and our vendors all use it, so every project stays organized and everyone involved gets a boutique experience.",
    ],
  },
  {
    heading: "A team that carries the vision",
    paragraphs: [
      "After months of hiring and firing, in the field and in the office, I've been able to build a team that is accountable, honest and — most importantly — carries the same vision I do: be honest, take accountability, and get better every time. All of it while depending on Jesus Christ.",
    ],
  },
  {
    heading: "Owning our mistakes",
    paragraphs: [
      "I've made many mistakes in my career that affected not only me but my colleagues, vendors and subcontractors. It was never done to hurt anyone. We were simply stuck trying to meet and compete with the market's expectations.",
    ],
    pullQuote: "Not anymore.",
  },
  {
    paragraphs: [
      "We value our team's hard work and experience, as well as our subcontractors and the people around us. TruthCore is here to make a change.",
      "Everything you've read in my testimony is why TruthCore is different — and why you'll never go elsewhere after choosing us.",
    ],
  },
];
