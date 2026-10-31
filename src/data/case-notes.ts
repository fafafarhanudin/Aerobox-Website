// Words for every project page. Edit freely: the pages read from here.
// Keys are the project name as it appears in data/projects.ts (the part before " · ").
// Drafts written from what the screens show; nothing here is a client quote or a measured result.

export type Note = {
  /** one line under the name on cards */
  summary: string;
  /** the paragraph on the project page */
  overview: string;
  /** what the work covered, shown as chips */
  scope?: string[];
};

export const notes: Record<string, Note> = {
  // ---------- case studies ----------
  Cutmage: {
    summary: "Video & motion studio for teams",
    overview:
      "A browser workspace where marketing teams plan, cut, review and ship short video. One dark, calm interface carries the whole loop: a project home, a timeline editor with color and keyframes, frame-accurate review and export presets for every channel.",
    scope: ["Product design", "Editor UX", "Design system", "Brand identity"],
  },
  Handgate: {
    summary: "AI gateway & traffic analytics",
    overview:
      "A control room for teams that route requests across many AI models. Handgate shows live traffic, model and provider health, routing rules, logs and spend in one place, so an engineer can see what is slow or costly and change it without leaving the dashboard.",
    scope: ["Product design", "Data visualisation", "Dashboards", "UI states"],
  },
  Marshal: {
    summary: "Rail freight operations platform",
    overview:
      "An operations suite for a rail freight yard: consist planning, yard inventory, cargo manifests, routes, line control and fleet maintenance. Dense tables and track diagrams stay readable through one blue accent, tight type and isometric wagon renders that tell rolling stock apart at a glance.",
    scope: ["Product design", "Complex workflows", "3D renders", "Design system"],
  },
  IsoBuilder: {
    summary: "Isometric asset builder for designers",
    overview:
      "A browser tool for making editable isometric shapes and illustrations without 3D software. Pick a shape or a template, set width, depth and height, choose one colour and let the sides shade themselves, round any corner, then copy the result to Figma or export SVG and PNG. Designed end to end in Figma and built as a working beta.",
    scope: ["Product design", "Web app", "Design system", "Prototype"],
  },
  "Sentinel AI": {
    summary: "AI infrastructure observability",
    overview:
      "A landing page and product surfaces for a platform that watches AI infrastructure: GPU clusters, models and networks. The site tells the story in four steps, connect, analyze, observe and act, and the bento sections turn the same data into readable instruments.",
    scope: ["Landing page", "Bento sections", "Dashboard", "Art direction"],
  },
  Datalyr: {
    summary: "Attribution & analytics for performance marketers",
    overview:
      "The marketing website for Datalyr, attribution software that ties every conversion to the channel, campaign and ad that drove it. Product screens carry the story from revenue attribution to identity, integrations and an AI assistant, in a warm palette that stays light and readable.",
    scope: ["Website", "Product storytelling", "Framer", "Responsive"],
  },

  // ---------- dashboards ----------
  "Aether AI": {
    summary: "Fleet charging & diagnostics console",
    overview:
      "A monospace operations console for an electric fleet: charging ledger, parts registry, trip log and audit trail. Terminal-style tables with green status marks keep a lot of data calm and scannable.",
    scope: ["Dashboard", "Data tables", "Dark UI"],
  },
  BetFlow: {
    summary: "Sports betting dashboard",
    overview:
      "A betting dashboard with live markets, a bet slip, open positions, trade history and a leaderboard. Odds, results and P&L stay readable in a dense dark layout.",
    scope: ["Dashboard", "Trading UI", "Dark UI"],
  },
  Afine: {
    summary: "Developer console for model tuning",
    overview:
      "A developer console for fine-tuning and monitoring models, with rewards, rollouts, environments and traffic analysis laid out as dense, technical tables and charts.",
    scope: ["Dashboard", "Developer tools", "Dark UI"],
  },
  Nezuko: {
    summary: "Sales analytics dashboard",
    overview: "A sales dashboard with customers, revenue and order KPIs, an analytics chart and a transactions table, designed in light and dark themes.",
    scope: ["Dashboard", "Light & dark"],
  },
  PropelMatch: {
    summary: "Vendor meeting marketplace",
    overview: "A vendor workspace for booking meetings with enterprise buyers: meeting credits, requests, schedules and active campaigns in one overview.",
    scope: ["Dashboard", "Marketplace"],
  },
  "Finance overview": {
    summary: "Finance & sales overview",
    overview: "Two takes on a finance overview: revenue, expenses, customers and orders as bar charts, with an activity history beneath.",
    scope: ["Dashboard", "Charts"],
  },
  "Sales dashboard": {
    summary: "Personal finance dashboard",
    overview: "Income, expenses and cash flow with an AI assistant, savings goals and spending categories, explored for two brands.",
    scope: ["Dashboard", "AI assistant"],
  },
  Lintas: {
    summary: "Logistics control room",
    overview: "A control room for shipments: network status, on-time rate, open exceptions, live tracking and a cold-chain monitor on one dark screen.",
    scope: ["Dashboard", "Logistics"],
  },
  FileDash: {
    summary: "File manager",
    overview: "A calm file manager with folders, shared files and storage, part of a six-screen file-management concept.",
    scope: ["Dashboard", "File management"],
  },
  "Project overview": {
    summary: "Project tracking dashboard",
    overview: "Tasks, project progress, a timeline and a project list with teams and status for a studio tracking several projects at once.",
    scope: ["Dashboard", "Project management"],
  },
  "Revenue dashboard": {
    summary: "Revenue & cash flow dashboard",
    overview: "Total revenue, cash flow, sales and a sales revenue flow chart with a transaction history and finance track.",
    scope: ["Dashboard", "Finance"],
  },
  "Developer console": {
    summary: "Environment & quickstart console",
    overview: "A developer console with network overview, a code quickstart and environment cards in a compact technical layout.",
    scope: ["Dashboard", "Developer tools"],
  },
  Flowdesk: {
    summary: "Team workspace home",
    overview: "The home of a team workspace: quick actions, my tasks, active projects, a homepage redesign track and upcoming meetings.",
    scope: ["Dashboard", "Collaboration"],
  },
  Kargo: {
    summary: "Shipment & fleet dashboard",
    overview: "Shipment and delivery overview with tonnage, transport mode split, on-time delivery, freight cost, warehouse capacity and fleet utilization.",
    scope: ["Dashboard", "Logistics", "Charts"],
  },
  "Analytics suite": {
    summary: "Social analytics dashboard",
    overview: "Reach, engagement and sales across platforms with audience growth, content performance and a connection funnel.",
    scope: ["Dashboard", "Analytics"],
  },
  "Crypto portfolio": {
    summary: "Crypto portfolio tracker",
    overview: "A crypto portfolio with balance, staked assets, price chart, asset distribution and market list in a dark, mono-accented UI.",
    scope: ["Dashboard", "Crypto"],
  },
  "Trading terminal": {
    summary: "Trading terminal",
    overview: "A trading view with candlestick chart, portfolio value, assets and a mentions feed for a crypto exchange.",
    scope: ["Dashboard", "Trading UI"],
  },
  "Aperture redesign": {
    summary: "Payments analytics redesign",
    overview: "A redesign of a payments analytics dashboard: net earnings, transactions by country and top-performing merchants, cleaned up into one clear hierarchy.",
    scope: ["Dashboard", "Redesign"],
  },
  Automatic: {
    summary: "Sales team performance",
    overview: "Team performance, coaching needs, sales insights, a leaderboard and a conversion funnel for a sales team lead.",
    scope: ["Dashboard", "Sales"],
  },

  // ---------- web apps ----------
  "E-course": {
    summary: "Online learning platform",
    overview: "Course catalogue, learning progress and schedule for an online school, explored across three brands.",
    scope: ["Web app", "Education"],
  },
  "Team task tracker": {
    summary: "Task tracking app",
    overview: "Task lists grouped by status with projects, teams, priority and deadlines, in light and dark.",
    scope: ["Web app", "Productivity"],
  },
  Connect360: {
    summary: "Business partner CRM",
    overview: "A CRM table for business partners with status, contact and next steps, in light and dark.",
    scope: ["Web app", "CRM"],
  },
  "CRM pipeline": {
    summary: "Kanban CRM pipeline",
    overview: "A kanban pipeline from prospect to development with colour-coded stages, in light and dark.",
    scope: ["Web app", "CRM"],
  },
  "Job board": {
    summary: "Job search platform",
    overview: "Job listings, filters and a job detail view for a career platform.",
    scope: ["Web app", "Marketplace"],
  },
  "File storage": {
    summary: "Cloud file storage",
    overview: "A cloud storage app: a product intro screen and a dashboard with storage breakdown and recent files.",
    scope: ["Web app", "File management"],
  },
  "Slack AI Agents": {
    summary: "AI agents inside Slack",
    overview: "A Slack-style workspace where teams create, assign and monitor AI agents and their running tasks.",
    scope: ["Web app", "AI agents"],
  },
  "Space onboarding": {
    summary: "Sign-up & onboarding",
    overview: "A sign-up screen paired with full-bleed space imagery for a calm first run.",
    scope: ["Web app", "Onboarding"],
  },
  "Team chat": {
    summary: "Team chat app",
    overview: "Channels, direct messages and a design review thread in a team chat client.",
    scope: ["Web app", "Messaging"],
  },
  "AI photo studio": {
    summary: "AI video creation",
    overview: "Upload photos, choose a style and generate short videos, with a library of past creations.",
    scope: ["Web app", "AI"],
  },
  "Image gallery": {
    summary: "Video creation gallery",
    overview: "A gallery of generated videos with creators, filters and quick actions.",
    scope: ["Web app", "Gallery"],
  },

  // ---------- mobile ----------
  Moolah: {
    summary: "Social investing app",
    overview: "A social feed for investors with net-worth updates, posts and chats.",
    scope: ["Mobile app", "iOS"],
  },
  Stride: {
    summary: "Running & coaching app",
    overview: "Activity, statistics and coaching for runners, in a dark app with a bright accent.",
    scope: ["Mobile app", "iOS", "Brand"],
  },
  "Task manager": {
    summary: "Task manager",
    overview: "Onboarding, today's focus and a calendar view for a personal task manager.",
    scope: ["Mobile app", "iOS"],
  },
  "Crypto wallet": {
    summary: "Crypto wallet",
    overview: "Total balance, a trading view and a watchlist for a mobile crypto wallet.",
    scope: ["Mobile app", "Crypto"],
  },
  Streaks: {
    summary: "Habit & fitness streaks",
    overview: "Streaks, plans and stats for daily habits in a bright, friendly app.",
    scope: ["Mobile app", "Health"],
  },
  "Inbox app": {
    summary: "Email inbox",
    overview: "Onboarding, inbox and a message thread for a focused email client.",
    scope: ["Mobile app", "Productivity"],
  },
  "Wallet app": {
    summary: "Payments wallet",
    overview: "Balance, transaction history and a send-money flow for a mobile wallet.",
    scope: ["Mobile app", "Fintech"],
  },

  // ---------- landing pages ----------
  Bounty: { summary: "Creator rewards landing page", overview: "A bright landing page for a platform that pays creators for content, with phone mockups and platform logos.", scope: ["Landing page"] },
  FORMA: { summary: "Museum archive landing page", overview: "An editorial landing page for a slow archive of paintings, objects and photographs.", scope: ["Landing page", "Editorial"] },
  NEXORA: { summary: "Logistics platform landing page", overview: "A dark landing page for a logistics platform with a live tracking visual.", scope: ["Landing page"] },
  Cluely: { summary: "Creator earnings landing page", overview: "A landing page for creators earning from short content, built around real creator photography.", scope: ["Landing page"] },
  "Quality Seeds": { summary: "Seed catalogue landing page", overview: "A landing page for a premium seed catalogue with photography and trust marks.", scope: ["Landing page", "E-commerce"] },
  "Canvas AI": { summary: "AI creative workspace landing page", overview: "A landing page for an AI tool that creates images, video and 3D from one prompt.", scope: ["Landing page", "AI"] },

  // ---------- bento ----------
  "Instrument cards": { summary: "Instrument-style UI cards", overview: "A set of dense, instrument-style cards for infrastructure data: cost bridges, quorum and GPU leases.", scope: ["UI cards", "Data visualisation"] },
  "Minimal bento": { summary: "Minimal bento section", overview: "A quiet bento section for infrastructure reliability: SLOs, uptime and request volume.", scope: ["Bento", "Landing page"] },

  // ---------- live websites ----------
  Amply: { summary: "Website for a B2B web agency", overview: "The website for Amply, an agency building AI-ready websites for B2B brands. Designed by Aerobox and live.", scope: ["Website", "Live"] },
  Everflow: { summary: "Partner marketing platform website", overview: "Website for Everflow, a partner marketing platform for affiliates. Designed by Aerobox and live.", scope: ["Website", "Live"] },
  QuantVPS: { summary: "Trading VPS website", overview: "Website for QuantVPS, VPS hosting for futures traders. Designed by Aerobox and live.", scope: ["Website", "Live"] },
  "Roots by GA": { summary: "Hair care brand website", overview: "Website for Roots by GA, a peptide hair care brand. Designed by Aerobox and live.", scope: ["Website", "E-commerce", "Live"] },
  Berachain: { summary: "Onchain growth website", overview: "Website for Berachain, a growth engine for onchain businesses. Designed by Aerobox and live.", scope: ["Website", "Web3", "Live"] },
  Drewl: { summary: "Digital consultancy website", overview: "Website for Drewl, a strategy, design and development consultancy. Designed by Aerobox and live.", scope: ["Website", "Live"] },
  "Exalt Studio": { summary: "Product design studio website", overview: "Website for Exalt Studio, a design studio for growing AI and B2B software. Designed by Aerobox and live.", scope: ["Website", "Live"] },
  Moviegen: { summary: "AI video editing website", overview: "Website for Moviegen, prompt-based video editing. Designed by Aerobox and live.", scope: ["Website", "AI", "Live"] },
  Retainable: { summary: "Client portal website", overview: "Website for Retainable, a client experience platform for agencies. Designed by Aerobox and live.", scope: ["Website", "Live"] },
};
