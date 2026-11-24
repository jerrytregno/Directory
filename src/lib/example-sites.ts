export type HomeSite = {
  id: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  logoUrl: string | null;
  views: number;
};

function favicon(url: string) {
  const host = new URL(url).hostname;
  return `https://www.google.com/s2/favicons?domain=${host}&sz=64`;
}

export const EXAMPLE_SITES: HomeSite[] = [
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com", description: "Chat with an AI assistant for writing, research, and everyday questions.", tags: ["Apps", "Writing"], logoUrl: favicon("https://chatgpt.com"), views: 0 },
  { id: "claude", name: "Claude", url: "https://claude.ai", description: "An AI assistant for long documents, coding, and careful answers.", tags: ["Apps", "Writing"], logoUrl: favicon("https://claude.ai"), views: 0 },
  { id: "midjourney", name: "Midjourney", url: "https://www.midjourney.com", description: "Turn text prompts into images for design and concept work.", tags: ["Image"], logoUrl: favicon("https://www.midjourney.com"), views: 0 },
  { id: "perplexity", name: "Perplexity", url: "https://www.perplexity.ai", description: "Search the web with answers that cite their sources.", tags: ["Search"], logoUrl: favicon("https://www.perplexity.ai"), views: 0 },
  { id: "notion", name: "Notion", url: "https://www.notion.so", description: "Notes, docs, and project pages in one workspace.", tags: ["Apps"], logoUrl: favicon("https://www.notion.so"), views: 0 },
  { id: "canva", name: "Canva", url: "https://www.canva.com", description: "Design presentations, posts, and simple videos in the browser.", tags: ["Design"], logoUrl: favicon("https://www.canva.com"), views: 0 },
  { id: "figma", name: "Figma", url: "https://www.figma.com", description: "Design interfaces and prototypes with a team.", tags: ["Design"], logoUrl: favicon("https://www.figma.com"), views: 0 },
  { id: "github", name: "GitHub", url: "https://github.com", description: "Host code, review pull requests, and publish open-source projects.", tags: ["Developer"], logoUrl: favicon("https://github.com"), views: 0 },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com", description: "Google's AI chat for writing, planning, and research.", tags: ["Apps", "Search"], logoUrl: favicon("https://gemini.google.com"), views: 0 },
  { id: "runway", name: "Runway", url: "https://runwayml.com", description: "Generate and edit video with AI tools.", tags: ["Video"], logoUrl: favicon("https://runwayml.com"), views: 0 },
  { id: "grammarly", name: "Grammarly", url: "https://www.grammarly.com", description: "Rewrite and proofread writing in the browser and desktop apps.", tags: ["Writing"], logoUrl: favicon("https://www.grammarly.com"), views: 0 },
  { id: "zapier", name: "Zapier", url: "https://zapier.com", description: "Connect apps so a trigger in one tool runs an action in another.", tags: ["Apps"], logoUrl: favicon("https://zapier.com"), views: 0 },
];
