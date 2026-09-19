// Real client reviews from Google and Yelp, transcribed verbatim from the
// platforms. Only Leonardo Becerra's final sentence (about other reviews) is
// omitted. `excerpt` is a verbatim fragment used by the hero review ticker.

export type ReviewSource = "Google" | "Yelp";

export interface ClientReview {
  author: string;
  source: ReviewSource;
  /** Absolute date as shown on the platform; Google only shows relative dates, so those are omitted. */
  date?: string;
  project: string;
  rating: number;
  excerpt: string;
  text: string;
}

export const CLIENT_REVIEWS: ClientReview[] = [
  {
    author: "Leonardo Becerra",
    source: "Google",
    project: "ADU plans",
    rating: 5,
    excerpt:
      "Integrity, transparent, and fast. … Someone who cares more about their clients and his reputation than making a buck.",
    text:
      "After working with Jordan on my ADU plans I can describe him and his company in a few words. Integrity, transparent, and fast. He has been in this field long enough to develop systems and processes to create the best outcomes for his clients. I'm new to this but I've been around high performers long enough to recognize a winner when I meet one. He especially won my respect when he said not to pay him for help SDGE service that we were going to start because was not in my best interest. Who says no to over 3k of quick work? Someone who cares more about their clients and his reputation than making a buck.",
  },
  {
    author: "David Rojo",
    source: "Google",
    project: "Roof replacement",
    rating: 5,
    excerpt:
      "He was very direct and honest. The price he gave me was almost $15,000 less than another company I was about to sign with.",
    text:
      "I don't usually write reviews but I wanted to share this. Jordan was working on a house down the street from mine on a rainy day and stopped by to let me know I really needed a new roof. He was very direct and honest. The price he gave me was almost $15,000 less than another company I was about to sign with. I called him the next day and we moved forward. What I liked was that he let me pay for the materials myself so I knew exactly what they cost, and I just paid him for the work plus his contractor markups that are very clear in his contract, That made me feel comfortable. They removed my solar panels, did a full tear off, installed the new roof, and reinstalled the solar. Everything was done in two days. We just had rain and I have no leaks. I feel good knowing it was done right. I highly recommend Distinct Construction Solution, thank you Jordan!",
  },
  {
    author: "Rick M.",
    source: "Yelp",
    date: "Nov 27, 2025",
    project: "Roof replacement",
    rating: 5,
    excerpt: "They did a great job with excellent communication, professionalism and courtesy.",
    text:
      "Jordan and his crew were doing a project next to our home. He noticed some major issues with our roof the day before a 3 day rain storm. He gave us a very reasonable price to replace the roof and was able to tarp for temporary protection against the storm. The day after the rain ended a five man team completed the job in one day. They did a great job with excellent communication, professionalism and courtesy.",
  },
  {
    author: "G V.",
    source: "Yelp",
    date: "Nov 23, 2024",
    project: "ADU · Imperial Beach",
    rating: 5,
    excerpt:
      "Jordan Talavera is an outstanding contractor. … he has become the go-to contractor for all of our friends and family.",
    text:
      "Jordan Talavera is an outstanding contractor. I first met Jordan when we hired him to complete our ADU in Imperial Beach. His work was quick and efficient, plus his local knowledge helped streamline the process of inspections and final permits. Since then, he has become the go-to contractor for all of our friends and family. Jordan's expertise and professionalism speak volumes and he will be the one we call for our next project.",
  },
  {
    author: "Christian T.",
    source: "Yelp",
    date: "Jan 25, 2024",
    project: "ADU",
    rating: 5,
    excerpt:
      "Communication was very solid! I would highly recommend a consultation as these guys know what they are doing",
    text:
      "I've been working with this company to build my ADU, and had a great experience! Communication was very solid! I would highly recommend a consultation as these guys know what they are doing, especially considering that it's a huge investment to build an ADU. Very professional work and details!",
  },
];
