export interface CreatorConfig {
  name: string;
  role: string;
  tagline: string;
  intro: string;
  whyExists: string;
  creatorPhilosophy: string;
  engineeringPhilosophy: string;
  github?: string;
  linkedin?: string;
  portfolio?: string;
}

export const creatorConfig: CreatorConfig = {
  name: "Keerthivasan",
  role: "Java Backend Developer",
  tagline: "Building high-performance backend systems & structured engineering documentation",
  intro:
    "This workspace was conceived, designed, and engineered by Keerthivasan as a personal command center for backend engineering learning, interview preparation, system design practice, and engineering documentation.",
  whyExists:
    "Backend engineering knowledge is scattered across interview experiences, GitHub repositories, LinkedIn posts, community discussions, documents, bookmarks, notes, and personal projects.\n\nThis workspace was built to bring those pieces together into one structured engineering system.",
  creatorPhilosophy:
    "Learn deeply. Build realistically. Understand the internals. Document the decisions. Prepare like an engineer.",
  engineeringPhilosophy:
    "Understand the concept → see how it works internally → build it → document the engineering decisions → discuss it in an interview.",
  github: "https://github.com",
  linkedin: "https://linkedin.com",
  portfolio: undefined,
};
