export type DevLaunch = {
  rank: number;
  name: string;
  slogan: string;
  logo: string;
  url: string;
  domain: string;
  views: number;
  votes: number;
  today: number;
  pricing: string;
  tags: string[];
};

export type DevLink = {
  name: string;
  slogan: string;
  url: string;
  domain: string;
};

export type DevWinner = {
  rank: string;
  name: string;
  views: string;
  votes: number;
  url: string;
  domain: string;
};

export type DevPast = {
  name: string;
  slogan: string;
  date: string;
  votes: number;
  url: string;
  domain: string;
};

export const weekLaunches: DevLaunch[] = [
  {
    "rank": 1,
    "name": "shadcn/ui Pro",
    "slogan": "Blocks, Figma Kit, Themes, MCP & Agent Skills",
    "logo": "https://devhunt-images.b-cdn.net/1795105352914-uainqh-import.png?width=128",
    "url": "https://pro.shadcn.co/",
    "domain": "pro.shadcn.co",
    "views": 1059,
    "votes": 20,
    "today": 19,
    "pricing": "Subscription",
    "tags": [
      "UI Library",
      "Code"
    ]
  },
  {
    "rank": 2,
    "name": "OfinTech Desk",
    "slogan": "Finance AI where every figure traces to its source",
    "logo": "https://devhunt-images.b-cdn.net/1795127318113-fsc1e7-import.svg?width=128",
    "url": "https://ofintech.ai/",
    "domain": "ofintech.ai",
    "views": 1430,
    "votes": 16,
    "today": 3,
    "pricing": "Free",
    "tags": [
      "Open Source",
      "AI"
    ]
  },
  {
    "rank": 3,
    "name": "Octen Search Plan",
    "slogan": "Unlimited web search API for AI, from $20/month",
    "logo": "https://devhunt-images.b-cdn.net/1795417887435-f81oa8-octen-logo-220.png?width=128",
    "url": "https://octen.ai/pricing?channel=dh-launch#search-plans",
    "domain": "octen.ai",
    "views": 1331,
    "votes": 15,
    "today": 3,
    "pricing": "Subscription",
    "tags": [
      "API",
      "AI Agents"
    ]
  },
  {
    "rank": 4,
    "name": "SREbox",
    "slogan": "Monitor services, metrics and logs.",
    "logo": "https://devhunt-images.b-cdn.net/1795474650316-z1uw9a-import.svg?width=128",
    "url": "https://srebox.tech/",
    "domain": "srebox.tech",
    "views": 843,
    "votes": 8,
    "today": 1,
    "pricing": "Subscription",
    "tags": [
      "DevOps",
      "Analytics"
    ]
  },
  {
    "rank": 5,
    "name": "Clockoli",
    "slogan": "Free, open-source time tracking in your GitHub repo",
    "logo": "https://devhunt-images.b-cdn.net/1794830701509-n7ghws-thumbnail-240.png?width=128",
    "url": "https://clockoli.com/?utm_source=devhunt&utm_medium=launch",
    "domain": "clockoli.com",
    "views": 840,
    "votes": 6,
    "today": 1,
    "pricing": "Free",
    "tags": [
      "Open Source",
      "Browser Extension"
    ]
  },
  {
    "rank": 6,
    "name": "Revise SDK",
    "slogan": "Embed a self-hosted React DOCX editor with agent tools",
    "logo": "https://devhunt-images.b-cdn.net/1791346735190-gryaeg-import.svg?width=128",
    "url": "https://revise.io/sdk",
    "domain": "revise.io",
    "views": 689,
    "votes": 5,
    "today": 3,
    "pricing": "Free",
    "tags": [
      "UI Library",
      "Code"
    ]
  },
  {
    "rank": 7,
    "name": "CybeDefend",
    "slogan": "The open source Snyk alternative your coding agent runs",
    "logo": "https://devhunt-images.b-cdn.net/1795473180702-3hthcj-cybedefend-icone-app-512.png?width=128",
    "url": "https://github.com/CybeDefend/cybedefend",
    "domain": "github.com",
    "views": 529,
    "votes": 5,
    "today": 3,
    "pricing": "Free",
    "tags": [
      "Security",
      "Open Source"
    ]
  },
  {
    "rank": 8,
    "name": "GitSeed",
    "slogan": "Coding agents that open PRs without ever holding your Git keys",
    "logo": "https://devhunt-images.b-cdn.net/1795095884993-hiep72-gitseed-logo-512.png?width=128",
    "url": "https://gitseed.dev",
    "domain": "gitseed.dev",
    "views": 621,
    "votes": 3,
    "today": 2,
    "pricing": "Free",
    "tags": [
      "Open Source",
      "DevOps"
    ]
  },
  {
    "rank": 9,
    "name": "BiVelio Savings Layer",
    "slogan": "Cut LLM API costs. Track savings per request.",
    "logo": "https://devhunt-images.b-cdn.net/1795172033020-mivdpz-download.gif?width=128",
    "url": "https://savings.bivelio.com/en",
    "domain": "savings.bivelio.com",
    "views": 673,
    "votes": 2,
    "today": 1,
    "pricing": "Free",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 10,
    "name": "AI Code With",
    "slogan": "Up to 90% Off Claude Code, GPT & 80+ AI Models",
    "logo": "https://devhunt-images.b-cdn.net/1795071410405-jh8m44-ai.png?width=128",
    "url": "https://aicodewith.ai/",
    "domain": "aicodewith.ai",
    "views": 470,
    "votes": 2,
    "today": 0,
    "pricing": "One time fee",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 11,
    "name": "CleanBleep",
    "slogan": "Auto-bleep swear words in your video and audio — no editing software needed",
    "logo": "https://devhunt-images.b-cdn.net/1794879969332-rw3gyy-logo-512x512-transparent.png?width=128",
    "url": "https://cleanbleep.com",
    "domain": "cleanbleep.com",
    "views": 302,
    "votes": 2,
    "today": 1,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Video"
    ]
  },
  {
    "rank": 12,
    "name": "Soliton ID",
    "slogan": "Proof of human presence in seconds",
    "logo": "https://devhunt-images.b-cdn.net/1794948677681-7zj0bo-d102262b1083141b.webp?width=128",
    "url": "https://soliton.id/",
    "domain": "soliton.id",
    "views": 253,
    "votes": 2,
    "today": 1,
    "pricing": "Free",
    "tags": [
      "API",
      "Security"
    ]
  },
  {
    "rank": 15,
    "name": "ListingBott v2",
    "slogan": "ListingBott - your Business, Service, SaaS, Tool, Product, Newsletter, or blog listed on 100+ directories by our human team, saving you weeks of work to focus on more creative tasks.",
    "logo": "https://devhunt-images.b-cdn.net/1790463364064-1790463358425ListingBott_iOS.png?width=128",
    "url": "https://listingbott.com",
    "domain": "listingbott.com",
    "views": 518,
    "votes": 1,
    "today": 0,
    "pricing": "One time fee",
    "tags": []
  },
  {
    "rank": 16,
    "name": "SoluTerminal",
    "slogan": "Claude Code and Codex in terminal panes on Windows",
    "logo": "https://devhunt-images.b-cdn.net/1794620658404-qc3fi4-soluterminal-icon-512.png?width=128",
    "url": "https://soluterminal.com/?utm_source=devhunt&utm_campaign=oss-launch",
    "domain": "soluterminal.com",
    "views": 468,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Open Source",
      "AI Agents"
    ]
  },
  {
    "rank": 17,
    "name": "APIMODELS",
    "slogan": "One API key for 160+ image, video, audio and LLM models",
    "logo": "https://devhunt-images.b-cdn.net/1794717002217-wenqb0-import.png?width=128",
    "url": "https://apimodels.app/",
    "domain": "apimodels.app",
    "views": 431,
    "votes": 1,
    "today": 0,
    "pricing": "One time fee",
    "tags": [
      "AI",
      "API"
    ]
  },
  {
    "rank": 18,
    "name": "Node Mantis",
    "slogan": "Give it a web task in plain English, get the result back",
    "logo": "https://devhunt-images.b-cdn.net/1794930857553-7gf4k8-node-mantis-icon.png?width=128",
    "url": "https://nodemantis.com",
    "domain": "nodemantis.com",
    "views": 392,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "API",
      "AI"
    ]
  },
  {
    "rank": 19,
    "name": "Messaging Me",
    "slogan": "We are conversation makers",
    "logo": "https://devhunt-images.b-cdn.net/1794951643379-m9rr2q-import.svg?width=128",
    "url": "https://app.messagingme.fr/",
    "domain": "app.messagingme.fr",
    "views": 356,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Marketing",
      "Sales"
    ]
  },
  {
    "rank": 20,
    "name": "Debitura MCP Server",
    "slogan": "Debt collection MCP server for AI assistants",
    "logo": "https://devhunt-images.b-cdn.net/1794957493947-vkq8wx-import.png?width=128",
    "url": "https://www.debitura.com/integration/mcp-server",
    "domain": "debitura.com",
    "views": 335,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI",
      "API"
    ]
  },
  {
    "rank": 21,
    "name": "InterOdin",
    "slogan": "OpenAI-compatible LLM API with fewer refusals, for security research",
    "logo": "https://devhunt-images.b-cdn.net/1795007657764-2a8zdj-import.svg?width=128",
    "url": "https://interodin.com/",
    "domain": "interodin.com",
    "views": 299,
    "votes": 1,
    "today": 0,
    "pricing": "One time fee",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 22,
    "name": "Kernstra",
    "slogan": "Embed a PDF Viewer and Editor in Your Web App",
    "logo": "https://devhunt-images.b-cdn.net/1795106254133-ocfehv-import.png?width=128",
    "url": "https://kernstra.com/",
    "domain": "kernstra.com",
    "views": 262,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "Code",
      "Visual editing"
    ]
  },
  {
    "rank": 23,
    "name": "Crow",
    "slogan": "Agentless Linux server management over plain SSH",
    "logo": "https://devhunt-images.b-cdn.net/1795106696418-f16wiq-661635065-3d9027d4-67b1-4548-a105-de92db8577a9.png?width=128",
    "url": "https://crow.rs/",
    "domain": "crow.rs",
    "views": 255,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "DevOps"
    ]
  },
  {
    "rank": 24,
    "name": "Forge: Agentic Workspace",
    "slogan": "Context-Driven Agentic Workspace",
    "logo": "https://devhunt-images.b-cdn.net/1795152128473-v06xz0-import.png?width=128",
    "url": "https://forgeforward.dev/?utm_source=devhunt&utm_medium=paid&utm_campaign=launch1",
    "domain": "forgeforward.dev",
    "views": 238,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 25,
    "name": "Hockeysticky",
    "slogan": "Less struggle. More users.",
    "logo": "https://devhunt-images.b-cdn.net/1795168614392-wvzgfg-import.png?width=128",
    "url": "https://hockeysticky.com/?utm_source=devhunt&utm_medium=listing",
    "domain": "hockeysticky.com",
    "views": 223,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Marketing"
    ]
  },
  {
    "rank": 26,
    "name": "Plango",
    "slogan": "Plango lets your AI agents work all night - safely",
    "logo": "https://devhunt-images.b-cdn.net/1795365100523-x0y0lv-import.png?width=128",
    "url": "https://installplango.com/",
    "domain": "installplango.com",
    "views": 231,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI",
      "Security"
    ]
  },
  {
    "rank": 27,
    "name": "Tailcove",
    "slogan": "Logs, errors and uptime for the team on call",
    "logo": "https://devhunt-images.b-cdn.net/1795376948590-72smuj-import.svg?width=128",
    "url": "https://tailcove.dev/",
    "domain": "tailcove.dev",
    "views": 330,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "DevOps",
      "Analytics"
    ]
  },
  {
    "rank": 28,
    "name": "CallMyAgent",
    "slogan": "your coding agent phones you when it's stuck",
    "logo": "https://devhunt-images.b-cdn.net/1795440994963-ntt32f-import.svg?width=128",
    "url": "https://getcallmyagent.com/",
    "domain": "getcallmyagent.com",
    "views": 215,
    "votes": 1,
    "today": 1,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 29,
    "name": "LiveTranslate",
    "slogan": "Real-time AI voice translation in 78 languages",
    "logo": "https://devhunt-images.b-cdn.net/1790080856052-1790080854437livetranslate-logo.png?width=128",
    "url": "https://www.livetranslate.app",
    "domain": "livetranslate.app",
    "views": 211,
    "votes": 1,
    "today": 0,
    "pricing": "One time fee",
    "tags": [
      "Voice",
      "AI"
    ]
  },
  {
    "rank": 30,
    "name": "Reply200",
    "slogan": "AI comment moderation and auto-reply for Facebook, Instagram, TikTok and YouTube",
    "logo": "https://devhunt-images.b-cdn.net/1794839661089-kai6bb-reply200-pill-square-1024.png?width=128",
    "url": "https://reply200.com/",
    "domain": "reply200.com",
    "views": 215,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Marketing"
    ]
  },
  {
    "rank": 31,
    "name": "Hexby",
    "slogan": "Your codebase, turned into a design canvas — powered by your AI agents.",
    "logo": "https://devhunt-images.b-cdn.net/1792390224126-5xkz44-linkedin-logo.png?width=128",
    "url": "https://hexby.ai",
    "domain": "hexby.ai",
    "views": 185,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI"
    ]
  },
  {
    "rank": 32,
    "name": "Better Launch",
    "slogan": "Post Your Product & Get Discovered Fast",
    "logo": "https://devhunt-images.b-cdn.net/1794233577593-0u9ou1-betterlaunch.png?width=128",
    "url": "https://betterlaunch.co/",
    "domain": "betterlaunch.co",
    "views": 177,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI",
      "Marketing"
    ]
  },
  {
    "rank": 33,
    "name": "Shipfolio",
    "slogan": "Proof of work for founders who ship",
    "logo": "https://devhunt-images.b-cdn.net/1794904279689-069c60-import.svg?width=128",
    "url": "https://shipfolio.io/",
    "domain": "shipfolio.io",
    "views": 165,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Code",
      "MCP"
    ]
  },
  {
    "rank": 34,
    "name": "MusicSong",
    "slogan": "Free AI Song Generator",
    "logo": "https://devhunt-images.b-cdn.net/1794905212626-63d2fv-musicsong-logo-220.png?width=128",
    "url": "https://musicsong.io/",
    "domain": "musicsong.io",
    "views": 154,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Voice"
    ]
  },
  {
    "rank": 35,
    "name": "openfabriq",
    "slogan": "Your AI software factory, as code",
    "logo": "https://devhunt-images.b-cdn.net/1794911724568-y7z39x-import.svg?width=128",
    "url": "https://openfabriq.dev/",
    "domain": "openfabriq.dev",
    "views": 164,
    "votes": 1,
    "today": 1,
    "pricing": "Free",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 36,
    "name": "Midge",
    "slogan": "Free Bug Reporting for Mac, iPhone and Chrome",
    "logo": "https://devhunt-images.b-cdn.net/1794954795821-matdle-import.svg?width=128",
    "url": "https://midge.dev/",
    "domain": "midge.dev",
    "views": 145,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Code",
      "QA"
    ]
  },
  {
    "rank": 37,
    "name": "SignalVault",
    "slogan": "PII redaction and audit logs for AI applications",
    "logo": "https://devhunt-images.b-cdn.net/1794989098655-jblhhk-import.svg?width=128",
    "url": "https://signalvault.io/",
    "domain": "signalvault.io",
    "views": 153,
    "votes": 1,
    "today": 1,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "API"
    ]
  },
  {
    "rank": 38,
    "name": "ServerDog",
    "slogan": "Ship to your own servers. Hand no one the keys.",
    "logo": "https://devhunt-images.b-cdn.net/1794999147457-i0gzvw-logo-220.png?width=128",
    "url": "https://serverdog.app",
    "domain": "serverdog.app",
    "views": 141,
    "votes": 1,
    "today": 0,
    "pricing": "One time fee",
    "tags": [
      "DevOps"
    ]
  },
  {
    "rank": 39,
    "name": "OpenStarterKit",
    "slogan": "Next.js SaaS Starter Kit",
    "logo": "https://devhunt-images.b-cdn.net/1795047663565-3tuttv-osk-devhunt-light.png?width=128",
    "url": "https://openstarterkit.dev/",
    "domain": "openstarterkit.dev",
    "views": 156,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Open Source",
      "Code"
    ]
  },
  {
    "rank": 40,
    "name": "Jobs Every Hour",
    "slogan": "Job search without ghost jobs, read from career pages every hour",
    "logo": "https://devhunt-images.b-cdn.net/1795246609157-au1nu1-import.svg?width=128",
    "url": "https://jobseveryhour.com/",
    "domain": "jobseveryhour.com",
    "views": 128,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Other",
      "API"
    ]
  },
  {
    "rank": 41,
    "name": "LumiCloud",
    "slogan": "E2B-compatible sandboxes for AI agents",
    "logo": "https://devhunt-images.b-cdn.net/1795344314293-jpr5rx-icon-512-white.png?width=128",
    "url": "https://lumicloud.ai/",
    "domain": "lumicloud.ai",
    "views": 128,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Code"
    ]
  },
  {
    "rank": 42,
    "name": "Hintwise",
    "slogan": "Company intelligence in one place",
    "logo": "https://devhunt-images.b-cdn.net/1795362752948-udxfh3-import.png?width=128",
    "url": "https://www.hintwise.ai/",
    "domain": "hintwise.ai",
    "views": 123,
    "votes": 1,
    "today": 0,
    "pricing": "Subscription",
    "tags": [
      "AI",
      "Analytics"
    ]
  },
  {
    "rank": 43,
    "name": "Social SDK",
    "slogan": "Open-source TypeScript SDK for posting to 7 social networks",
    "logo": "https://devhunt-images.b-cdn.net/1795442511195-46xsg7-import.svg?width=128",
    "url": "https://social-sdk.dev/",
    "domain": "social-sdk.dev",
    "views": 134,
    "votes": 1,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "Code",
      "API"
    ]
  },
  {
    "rank": 49,
    "name": "Checkcraft",
    "slogan": "AI drafts your API checks. Checkcraft proves it worked: response, logs, DB",
    "logo": "https://devhunt-images.b-cdn.net/1795125349936-sb35gy-logo-220.png?width=128",
    "url": "https://checkcraft.ru/en/?utm_source=devhunt&utm_campaign=launch",
    "domain": "checkcraft.ru",
    "views": 198,
    "votes": 0,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "API",
      "Testing"
    ]
  },
  {
    "rank": 50,
    "name": "FastHook",
    "slogan": "Workflow automation for your apps",
    "logo": "https://devhunt-images.b-cdn.net/1784120543975-1784120543330apple-touch-icon.png?width=128",
    "url": "https://www.fasthook.io/?utm_source=devhunt&utm_medium=referral&utm_campaign=ai_builder_launch&utm_content=product",
    "domain": "fasthook.io",
    "views": 761,
    "votes": 0,
    "today": 0,
    "pricing": "Free",
    "tags": [
      "AI",
      "API"
    ]
  }
];

export const alsoLaunching: DevLink[] = [
  {
    "name": "Glideworth",
    "slogan": "Know when you can retire, and how much you can spend.",
    "url": "https://glideworth.com/",
    "domain": "glideworth.com"
  },
  {
    "name": "KnowErgo by Knowella",
    "slogan": "Scores ergonomic risk from a short video",
    "url": "https://www.knowella.com/agents/ergo/",
    "domain": "knowella.com"
  },
  {
    "name": "Assetly",
    "slogan": "What your money did today, and why",
    "url": "https://hodlerss.github.io/assetly",
    "domain": "hodlerss.github.io"
  },
  {
    "name": "Secret Santa Name Generator",
    "slogan": "Free Secret Santa generator without email or sign-up.",
    "url": "https://secretsantanamegenerator.com/",
    "domain": "secretsantanamegenerator.com"
  },
  {
    "name": "Free Games for Seniors",
    "slogan": "Free online games for seniors that play in your browser.",
    "url": "https://freegamesforseniors.com/",
    "domain": "freegamesforseniors.com"
  },
  {
    "name": "Think Study Learn",
    "slogan": "Think Study Learn UK helps GCSE and A-Level students get AI-powered study help, lecture notes, and past papers.",
    "url": "https://thinkstudylearn.com/uk",
    "domain": "thinkstudylearn.com"
  },
  {
    "name": "Perfect HOA",
    "slogan": "All-in-one HOA management software for self-managed communities",
    "url": "https://perfecthoa.com",
    "domain": "perfecthoa.com"
  },
  {
    "name": "My 9 Games Template",
    "slogan": "Pick nine games you love, arrange your gaming 3×3, and download a shareable image.",
    "url": "https://my9gamestemplate.com/",
    "domain": "my9gamestemplate.com"
  },
  {
    "name": "Parallax Downloader",
    "slogan": "Save public Instagram and X posts in original quality",
    "url": "https://downloader.parallax.kr",
    "domain": "downloader.parallax.kr"
  },
  {
    "name": "DontRemember",
    "slogan": "AI writes and sends birthday, anniversary, and love emails from your Gmail.",
    "url": "https://dontremember.app/",
    "domain": "dontremember.app"
  },
  {
    "name": "Agricalc",
    "slogan": "Free science-based agriculture calculators",
    "url": "https://agricalc.online/",
    "domain": "agricalc.online"
  }
];

export const topWinners: DevWinner[] = [
  {
    "rank": "01",
    "name": "Daytona",
    "views": "216K",
    "votes": 339,
    "url": "https://github.com/daytonaio/daytona",
    "domain": "github.com"
  },
  {
    "rank": "02",
    "name": "LiveCodes",
    "views": "127K",
    "votes": 258,
    "url": "https://livecodes.io/",
    "domain": "livecodes.io"
  },
  {
    "rank": "03",
    "name": "toddle",
    "views": "120K",
    "votes": 147,
    "url": "https://toddle.dev",
    "domain": "toddle.dev"
  },
  {
    "rank": "04",
    "name": "Langfuse",
    "views": "70K",
    "votes": 89,
    "url": "https://langfuse.com",
    "domain": "langfuse.com"
  },
  {
    "rank": "05",
    "name": "Clerk",
    "views": "28.9K",
    "votes": 61,
    "url": "https://clerk.com",
    "domain": "clerk.com"
  },
  {
    "rank": "06",
    "name": "Huly",
    "views": "55.9K",
    "votes": 29,
    "url": "https://huly.io",
    "domain": "huly.io"
  },
  {
    "rank": "07",
    "name": "Memgraph",
    "views": "35.9K",
    "votes": 24,
    "url": "https://memgraph.com/",
    "domain": "memgraph.com"
  },
  {
    "rank": "08",
    "name": "Bootstrap",
    "views": "25K",
    "votes": 20,
    "url": "https://getbootstrap.com",
    "domain": "getbootstrap.com"
  }
];

export const pastWinners: DevPast[] = [
  {
    "name": "Athena Axyloris",
    "slogan": "Know What Matters Now",
    "date": "Nov 17, 26",
    "votes": 50,
    "url": "https://athenaos.net/",
    "domain": "athenaos.net"
  },
  {
    "name": "String",
    "slogan": "Search the web, fetch any URL and map a site as clean, LLM-ready Markdown.",
    "date": "Nov 10, 26",
    "votes": 48,
    "url": "https://usestring.ai/web-access",
    "domain": "usestring.ai"
  },
  {
    "name": "Raziel",
    "slogan": "Free API and MCP server: 25 investment and startup calculators, guide search, a glossary and more.",
    "date": "Nov 3, 26",
    "votes": 44,
    "url": "https://raziel.co/developers",
    "domain": "raziel.co"
  },
  {
    "name": "Articos MCP",
    "slogan": "Test ideas and messaging with simulated buyers, in your MCP agent",
    "date": "Oct 27, 26",
    "votes": 91,
    "url": "https://www.articos.com/",
    "domain": "articos.com"
  },
  {
    "name": "AI-Atlas",
    "slogan": "Map your AI skills from your GitHub code",
    "date": "Oct 20, 26",
    "votes": 64,
    "url": "https://getaiatlas.com/",
    "domain": "getaiatlas.com"
  },
  {
    "name": "TwitterAPIs",
    "slogan": "Pay-as-you-go Twitter/X API: tweet scraper, search, writes",
    "date": "Oct 13, 26",
    "votes": 46,
    "url": "https://www.twitterapis.com",
    "domain": "twitterapis.com"
  },
  {
    "name": "OneProvider",
    "slogan": "Leading AI models in one API. Leave overpaying behind.",
    "date": "Oct 6, 26",
    "votes": 76,
    "url": "https://oneprovider.dev/",
    "domain": "oneprovider.dev"
  },
  {
    "name": "Hyperfrontend",
    "slogan": "Frontend freedom, without the rewrite.",
    "date": "Sep 29, 26",
    "votes": 31,
    "url": "https://hyperfrontend.dev/",
    "domain": "hyperfrontend.dev"
  },
  {
    "name": "luoluoAI",
    "slogan": "One endpoint to access all models with bottom price.",
    "date": "Sep 22, 26",
    "votes": 52,
    "url": "https://api.luoluocoder.com/",
    "domain": "api.luoluocoder.com"
  },
  {
    "name": "BrowserGateway",
    "slogan": "The open router for cloud browsers",
    "date": "Sep 15, 26",
    "votes": 22,
    "url": "https://browsergateway.com",
    "domain": "browsergateway.com"
  },
  {
    "name": "ModelGate",
    "slogan": "Stop paying an LLM to do a function's job.",
    "date": "Sep 8, 26",
    "votes": 28,
    "url": "https://modelgatehq.com/",
    "domain": "modelgatehq.com"
  },
  {
    "name": "Traccia",
    "slogan": "Finally, a vendor-neutral AI Agent Control Plane.",
    "date": "Sep 1, 26",
    "votes": 21,
    "url": "https://traccia.ai/",
    "domain": "traccia.ai"
  },
  {
    "name": "LAN Sheriff",
    "slogan": "Nothing leaves town unnoticed. Every server your devices talk to, live on a world map.",
    "date": "Aug 25, 26",
    "votes": 32,
    "url": "https://lansheriff.com",
    "domain": "lansheriff.com"
  },
  {
    "name": "gridctl",
    "slogan": "One YAML file. One endpoint. Every MCP server plus the skills and agents you author alongside them.",
    "date": "Aug 18, 26",
    "votes": 20,
    "url": "https://github.com/gridctl/gridctl",
    "domain": "github.com"
  },
  {
    "name": "Testera IO",
    "slogan": "Intelligent agents that triage, heal, and ship QA forward",
    "date": "Aug 11, 26",
    "votes": 35,
    "url": "https://testera.io",
    "domain": "testera.io"
  },
  {
    "name": "Savyre AI Coding Workflow",
    "slogan": "Structure, review and ship AI code with confidence",
    "date": "Aug 4, 26",
    "votes": 43,
    "url": "https://savyre.com/products/ai-coding-workflow",
    "domain": "savyre.com"
  },
  {
    "name": "Drumbeats",
    "slogan": "Never miss a beat! Unified monitoring for cron jobs, workers, and uptime.",
    "date": "Jul 28, 26",
    "votes": 37,
    "url": "https://drumbeats.io",
    "domain": "drumbeats.io"
  },
  {
    "name": "Spawned",
    "slogan": "A Vercel for your own Cloud.",
    "date": "Jul 21, 26",
    "votes": 68,
    "url": "https://spawned.ai",
    "domain": "spawned.ai"
  },
  {
    "name": "ShiftFast",
    "slogan": "AI-ready Next.js boilerplate with Clerk, Stripe & Drizzle",
    "date": "Jul 14, 26",
    "votes": 17,
    "url": "https://shiftfast.dev",
    "domain": "shiftfast.dev"
  },
  {
    "name": "ReviewPhin",
    "slogan": "Self-hosted, agentic code review for GitLab and GitHub.",
    "date": "Jul 7, 26",
    "votes": 12,
    "url": "https://reviewphin.com",
    "domain": "reviewphin.com"
  },
  {
    "name": "Offsend Browser Extension",
    "slogan": "Mask secrets before they reach ChatGPT, Claude, or Gemini.",
    "date": "Jun 30, 26",
    "votes": 11,
    "url": "https://offsend.io/extension",
    "domain": "offsend.io"
  },
  {
    "name": "Tencent EdgeOne Makers",
    "slogan": "Ship AI agents like web apps, in minutes.",
    "date": "Jun 23, 26",
    "votes": 36,
    "url": "https://pages.edgeone.ai/",
    "domain": "pages.edgeone.ai"
  },
  {
    "name": "livemy.app",
    "slogan": "Vibe hosting that reads your code.",
    "date": "Jun 16, 26",
    "votes": 18,
    "url": "https://livemy.app",
    "domain": "livemy.app"
  },
  {
    "name": "Perfai Security",
    "slogan": "1-prompt to find your app's live vulnerabilities in minutes.",
    "date": "Jun 9, 26",
    "votes": 30,
    "url": "https://perfai.ai",
    "domain": "perfai.ai"
  },
  {
    "name": "quokka",
    "slogan": "Inspect and clean a USB-connected device from your terminal.",
    "date": "Jun 2, 26",
    "votes": 16,
    "url": "https://github.com/dutradotdev/quokka",
    "domain": "github.com"
  },
  {
    "name": "MCP Bridge by Appfactor",
    "slogan": "Connect Any API to Any AI Agent",
    "date": "May 26, 26",
    "votes": 8,
    "url": "https://mcp-bridge.ai",
    "domain": "mcp-bridge.ai"
  },
  {
    "name": "ContextAtlas",
    "slogan": "Stop making Claude Code rediscover your repo.",
    "date": "May 19, 26",
    "votes": 10,
    "url": "https://contextatlas.io",
    "domain": "contextatlas.io"
  },
  {
    "name": "Shadcn Space",
    "slogan": "Your dedicated space for shadcn/ui components, blocks and templates.",
    "date": "May 12, 26",
    "votes": 11,
    "url": "https://shadcnspace.com/",
    "domain": "shadcnspace.com"
  },
  {
    "name": "Monghoul",
    "slogan": "The MongoDB GUI you'll actually enjoy",
    "date": "May 5, 26",
    "votes": 11,
    "url": "https://www.monghoul.com/",
    "domain": "monghoul.com"
  },
  {
    "name": "Chaterm",
    "slogan": "Deploy, fix, and automate your infra in one terminal",
    "date": "Apr 28, 26",
    "votes": 65,
    "url": "https://github.com/chaterm/Chaterm",
    "domain": "github.com"
  }
];

export const devNews: { tag: string; title: string }[] = [
  {
    "tag": "Security",
    "title": "Grafana releases version 13.3.2 for enterprise and OSS editions"
  },
  {
    "tag": "Security",
    "title": "iTerm2 vulnerability allows arbitrary command execution via Kitty image protocol"
  },
  {
    "tag": "Security",
    "title": "Hex.pm reports security breach and credential rotation after RCE vulnerability"
  },
  {
    "tag": "AI",
    "title": "OpenAI's GPT-6 models can design protein structures and sequences directly"
  },
  {
    "tag": "Coding agents",
    "title": "iFood uses OpenAI API to run coding agents across 15,000 repos"
  },
  {
    "tag": "Coding agents",
    "title": "Claude Ship adds AI-driven PR review and approval to Claude Code"
  }
];

export const devCategories: { name: string; count: number }[] = [
  {
    "name": "AI",
    "count": 1828
  },
  {
    "name": "Marketing",
    "count": 570
  },
  {
    "name": "Open Source",
    "count": 539
  },
  {
    "name": "Code",
    "count": 481
  },
  {
    "name": "Design",
    "count": 422
  },
  {
    "name": "API",
    "count": 420
  },
  {
    "name": "AI Agents",
    "count": 358
  },
  {
    "name": "Helpers",
    "count": 342
  },
  {
    "name": "Image",
    "count": 319
  },
  {
    "name": "DevOps",
    "count": 317
  },
  {
    "name": "NoCode",
    "count": 305
  },
  {
    "name": "SEO",
    "count": 301
  },
  {
    "name": "Workflow automation",
    "count": 266
  },
  {
    "name": "Video",
    "count": 252
  },
  {
    "name": "Analytics",
    "count": 236
  },
  {
    "name": "Emails",
    "count": 186
  },
  {
    "name": "Social Media",
    "count": 186
  },
  {
    "name": "MCP",
    "count": 185
  },
  {
    "name": "Content Writing",
    "count": 182
  },
  {
    "name": "Monitoring",
    "count": 173
  },
  {
    "name": "CLI",
    "count": 166
  },
  {
    "name": "Visual editing",
    "count": 161
  },
  {
    "name": "Other",
    "count": 160
  },
  {
    "name": "Boilerplate",
    "count": 157
  },
  {
    "name": "Security",
    "count": 154
  },
  {
    "name": "AI Coding",
    "count": 142
  },
  {
    "name": "Voice",
    "count": 136
  },
  {
    "name": "Browser Extension",
    "count": 132
  },
  {
    "name": "UI Library",
    "count": 130
  },
  {
    "name": "Tailwind CSS",
    "count": 102
  },
  {
    "name": "Hosting",
    "count": 99
  },
  {
    "name": "Framework",
    "count": 84
  },
  {
    "name": "Sales",
    "count": 83
  },
  {
    "name": "Web3",
    "count": 83
  },
  {
    "name": "DB",
    "count": 80
  },
  {
    "name": "QA",
    "count": 73
  },
  {
    "name": "Mobile",
    "count": 70
  },
  {
    "name": "Testing",
    "count": 67
  },
  {
    "name": "Language",
    "count": 62
  },
  {
    "name": "CMS",
    "count": 59
  },
  {
    "name": "Docs",
    "count": 51
  },
  {
    "name": "IDE",
    "count": 51
  },
  {
    "name": "CI",
    "count": 41
  },
  {
    "name": "Charts",
    "count": 40
  },
  {
    "name": "Payments",
    "count": 37
  },
  {
    "name": "Crypto",
    "count": 34
  },
  {
    "name": "Auth",
    "count": 11
  }
];
