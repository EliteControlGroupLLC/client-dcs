/**
 * The TruthCore team, in the order the owner set for the Meet the Team page.
 * Each card image already carries the name, title and bio; the same text is
 * kept here for the image alt text (screen readers and search).
 */
export interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image: string;
}

export const TEAM: TeamMember[] = [
  {
    name: "Jordan Talavera",
    title: "Founder & CEO",
    bio: "Founded TruthCore on one standard: build it right, price it honestly, and stand behind it. Jordan leads design, construction, and development across San Diego County.",
    image: "/images/team/jordan-talavera.jpg",
  },
  {
    name: "D'Ann Good",
    title: "Operations Manager",
    bio: "The glue that holds TruthCore together. D'Ann keeps every client, crew, and project moving in the same direction. From the office to the jobsite, nothing runs without her.",
    image: "/images/team/dann-good.jpg",
  },
  {
    name: "David M. March",
    title: "Architect",
    bio: "The vision on paper. David turns each client's goals into clear, buildable designs, taking every project from first sketch to permit-ready plans.",
    image: "/images/team/david-march.jpg",
  },
  {
    name: "Alfredo Salamanca",
    title: "Project Manager",
    bio: "The steady hand on every jobsite. Alfredo leads our crews, keeps schedules and inspections on track, and makes sure every build meets the TruthCore standard before it's handed over.",
    image: "/images/team/alfredo-salamanca.jpg",
  },
  {
    name: "Christian Torres",
    title: "Land & Development Manager",
    bio: "Every TruthCore development starts with Christian. He finds the land, studies what it can become, and builds the full feasibility: cost, timeline, and return. He's the first step before TruthCore builds communities and homes for San Diego families.",
    image: "/images/team/christian-torres.jpg",
  },
  {
    name: "Charles Schwarz",
    title: "Finance Director",
    bio: "The numbers behind every build. Charles oversees TruthCore's finances, from budgets and job costing to cash flow, keeping every project on solid ground and every dollar accounted for.",
    image: "/images/team/charles-schwarz.jpg",
  },
];
