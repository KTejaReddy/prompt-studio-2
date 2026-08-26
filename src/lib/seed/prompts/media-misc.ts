import { DEFAULT_PLATFORMS, type SeedPrompt } from "../promptTypes";

export const MEDIA_MISC_PROMPTS: SeedPrompt[] = [
  // ---------------- Content Creation ----------------
  {
    id: "youtube-script-writer",
    title: "YouTube Script Writer",
    description:
      "Writes retention-engineered video scripts: cold open hook, structured body with re-hooks, and end screen payoff.",
    category: "content-creation",
    subcategory: "Video Scripts",
    tasks: ["write"],
    tags: ["YouTube", "Script", "Retention"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "script",
    purpose: "Videos people finish",
    transformation: "Hook → Promise → Deliver → Re-hook",
    tone: "Energetic creator",
    bestFor: ["YouTubers", "Course Creators"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TOPIC", label: "Video topic", required: true },
      { key: "AUDIENCE", label: "Audience" },
      { key: "LENGTH_MIN", label: "Target length (minutes)" },
    ],
    body: `Write a YouTube script about {TOPIC} for {AUDIENCE}, targeting {LENGTH_MIN} minutes.

Structure:
1. COLD OPEN (first 15s) — Start mid-action or with the most surprising fact. No channel intro, no "hey guys".
2. PROMISE — What the viewer will walk away with, stated once, fast.
3. BODY — Sections of 60–90 seconds. Every section ends with an open loop or mini-payoff that earns the next section.
4. RE-HOOKS — At natural drop points (~30s, ~50% mark), one-line curiosity resets tied to upcoming content.
5. END SCREEN — Deliver the promised payoff fully first; then a single relevant next-video suggestion.

Write spoken-language sentences — short, concrete, rhythm-friendly. Mark [B-ROLL] cues inline where visuals should carry the moment.`,
    ageDays: 128,
    usageCount: 2140,
    rating: 4.6,
    ratingCount: 129,
  },

  // ---------------- Presentations ----------------
  {
    id: "slide-deck-storyboarder",
    title: "Slide Deck Storyboarder",
    description:
      "Plans a presentation slide by slide: message per slide, visual suggestion, and speaker notes.",
    category: "presentations",
    subcategory: "Slide Design",
    tasks: ["outline", "design"],
    tags: ["Slides", "Presentation", "Storytelling"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "slides",
    purpose: "Decks that present themselves well",
    transformation: "Narrative → Slides → Visuals → Notes",
    tone: "Presentation designer",
    bestFor: ["Anyone facing a deck deadline"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "GOAL", label: "Presentation goal & audience", required: true },
      { key: "CONTENT", label: "Content / material" },
      { key: "SLIDE_COUNT", label: "Max slides" },
    ],
    body: `Storyboard a deck. Goal & audience: {GOAL}. Material: {CONTENT}. Max slides: {SLIDE_COUNT}

For EVERY slide output a block:
- SLIDE N — Title as a full-sentence takeaway (not a topic label).
- ON SLIDE — The minimal content: one idea, ≤ 20 words of text, what chart/image carries it.
- SPOKEN — Two-to-three sentence speaker notes in conversational language.
- TRANSITION — The hinge phrase into the next slide.

Open with a situation slide that makes the audience feel the problem before showing anything else. Close with the decision or action slide. If material exceeds {SLIDE_COUNT} slides, cut breadth and note what moved to appendix.`,
    ageDays: 148,
    usageCount: 2480,
    rating: 4.6,
    ratingCount: 151,
  },
  {
    id: "executive-presentation-condenser",
    title: "Executive Presentation Condenser",
    description:
      "Compresses a sprawling deck or document into a tight executive version that leads with the ask.",
    category: "presentations",
    subcategory: "Executive Decks",
    tasks: ["summarize", "rewrite"],
    tags: ["Executive", "Condense", "Board Deck"],
    difficulty: "advanced",
    inputType: "document",
    outputType: "slides",
    purpose: "Ten-minute leadership attention",
    transformation: "Distill → Order → Sharpen → Preempt",
    tone: "Executive",
    bestFor: ["Managers", "Chiefs of Staff"],
    platforms: ["chatgpt", "copilot", "claude"],
    variables: [
      { key: "MATERIAL", label: "Current deck / document" },
      { key: "ASK", label: "The decision or budget you need" },
    ],
    body: `Condense this into an executive briefing. Material:

{MATERIAL}

The ask: {ASK}

Rules:
1. First slide states the ask and its headline justification — before any context.
2. Maximum eight content slides; each titled as a conclusion.
3. One chart idea per slide maximum; name the exact comparison it shows ("cost A vs cost B over 12 months").
4. Pre-empt the two objections this audience will raise, each with a data point from the source material.
5. Appendix list: what got cut and where to find it when questioned.

Cut everything that doesn't serve the ask, including things you're proud of.`,
    ageDays: 98,
    usageCount: 1240,
    rating: 4.5,
    ratingCount: 73,
  },

  // ---------------- Customer Support ----------------
  {
    id: "empathetic-support-drafter",
    title: "Empathetic Support Reply Drafter",
    description:
      "Drafts support responses that acknowledge frustration, state exactly what happens next, and rebuild trust.",
    category: "customer-support",
    subcategory: "Response Writing",
    tasks: ["write", "draft"],
    tags: ["Support", "Customer Service", "Empathy"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "email",
    purpose: "Support replies that de-escalate",
    transformation: "Acknowledge → Explain → Act → Confirm",
    tone: "Warm, competent",
    bestFor: ["Support Teams", "Founders doing support"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "TICKET", label: "Customer message" },
      { key: "RESOLUTION_FACTS", label: "What we can actually do" },
    ],
    body: `Draft a reply to this support ticket. Facts of the situation: {RESOLUTION_FACTS}

<ticket>
{TICKET}
</ticket>

Rules for the reply:
1. Open by reflecting their actual problem in one sentence — no template gratitude.
2. State plainly what happened if we failed, without corporate hedging.
3. Give the concrete next step WITH a timeframe ("by Thursday 5pm"), only commitments present in the resolution facts.
4. If we cannot do what they want, say so directly and offer the nearest real alternative.
5. ≤ 150 words. No "we apologize for any inconvenience". End by inviting reply if anything's still unresolved.`,
    ageDays: 112,
    usageCount: 1720,
    rating: 4.6,
    ratingCount: 94,
  },

  // ---------------- Management ----------------
  {
    id: "one-on-one-coach",
    title: "1:1 Meeting Coach",
    description:
      "Prepares managers for one-on-ones with tailored questions based on the report's current situation.",
    category: "management",
    subcategory: "One-on-Ones",
    tasks: ["plan", "coach"],
    tags: ["Management", "1:1", "Leadership"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "plan",
    purpose: "1:1s people actually value",
    transformation: "Context → Questions → Listen-plan → Commit",
    tone: "Thoughtful manager coach",
    bestFor: ["New and experienced managers"],
    platforms: ["chatgpt", "claude", "gemini", "copilot"],
    variables: [
      { key: "REPORT_CONTEXT", label: "Report's role & recent situation", required: true },
      { key: "LAST_TOPICS", label: "Topics from last 1:1s" },
    ],
    body: `Prepare my 1:1. Report context: {REPORT_CONTEXT}. Recent topics: {LAST_TOPICS}

Prepare:
1. OPENING QUESTION — One question that invites what THEY care about today (not status).
2. QUESTION LADDER — Four candidate questions matched to their situation, ordered from safe to deeper, each with why-now rationale and what answer patterns to listen for.
3. TOPIC RISK — If recent topics suggest a brewing issue (workload, growth, conflict), name it and how to open that door gently.
4. MY COMMITMENTS CHECK — Promises from previous 1:1s implied by the topics; verify before asking anything new.
5. CLOSE — How to end with one concrete improvement either side commits to.
Remind me at the top: this meeting is theirs; my agenda comes second.`,
    ageDays: 84,
    usageCount: 990,
    rating: 4.5,
    ratingCount: 58,
  },

  // ---------------- Entrepreneurship ----------------
  {
    id: "idea-validator",
    title: "Startup Idea Validator",
    description:
      "Stress-tests a startup idea against demand evidence, cheap tests, and kill criteria before you build.",
    category: "entrepreneurship",
    subcategory: "Idea Validation",
    tasks: ["evaluate", "plan"],
    tags: ["Validation", "Startups", "Lean"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "report",
    purpose: "Don't build what nobody wants",
    transformation: "Claim → Evidence → Test → Kill-criteria",
    tone: "Honest mentor",
    bestFor: ["Aspiring founders", "Intrapreneurs"],
    platforms: DEFAULT_PLATFORMS,
    variables: [{ key: "IDEA", label: "The idea", required: true }],
    body: `Pressure-test this startup idea: {IDEA}

Deliver:
1. CORE ASSUMPTIONS STACK — The 3–5 beliefs that must ALL be true, ordered by riskiness. Phrase each as falsifiable statements.
2. EVIDENCE SCAN — What observable evidence already supports or contradicts each (existing behavior, workarounds, spend). Distinguish evidence from wishful reading.
3. CHEAPEST TEST PER ASSUMPTION — A test costing < $100 / < 1 week each, with pass/fail numbers defined BEFORE running.
4. KILL CRITERIA — The specific results that should stop this project. Write them now while you're objective.
5. ADJACENT VERSION — The smaller/simpler version of this idea that could validate faster if the full version looks shaky.`,
    ageDays: 138,
    usageCount: 1560,
    rating: 4.6,
    ratingCount: 97,
  },

  // ---------------- Personal Development ----------------
  {
    id: "habit-loop-designer",
    title: "Habit Loop Designer",
    description:
      "Designs a habit around your real schedule using cue-routine-reward with friction engineering.",
    category: "personal-development",
    subcategory: "Habits",
    tasks: ["design", "plan"],
    tags: ["Habits", "Behavior", "Self-improvement"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "plan",
    purpose: "Habits that survive bad days",
    transformation: "Anchor → Shrink → Reward → Track",
    tone: "Encouraging realist",
    bestFor: ["Anyone restarting the same habit"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "HABIT", label: "Habit you want" },
      { key: "LIFE_CONTEXT", label: "Your typical day" },
      { key: "PAST_ATTEMPTS", label: "Why past attempts failed" },
    ],
    body: `Design a habit plan. Wanted habit: {HABIT}. My days look like: {LIFE_CONTEXT}. Past attempts failed because: {PAST_ATTEMPTS}

Build:
1. FAILURE POST-MORTEM — Why the past attempts likely failed structurally (too big? no cue? no immediate reward?), not motivationally.
2. MINIMUM VIABLE HABIT — The 2-minute version so small refusing feels silly. This is the real starting point.
3. CUE ENGINEERING — Exact anchor: "After [existing routine], I will [tiny habit]". Choose the anchor from MY schedule where friction is lowest.
4. IMMEDIATE REWARD — Something felt within 30 seconds of finishing.
5. STALL PLAN — What the fallback is on terrible days (do the 30-second version) and the tracking method that takes zero discipline.
No shame mechanics. Design for the tired version of me.`,
    ageDays: 76,
    usageCount: 1080,
    rating: 4.5,
    ratingCount: 62,
  },

  // ---------------- Image Generation ----------------
  {
    id: "cinematic-photo-prompt",
    title: "Cinematic Photo Prompt Engineer",
    description:
      "Crafts detailed image-generation prompts with lens, lighting, composition and style control.",
    category: "image-generation",
    subcategory: "Photography",
    tasks: ["write", "design"],
    tags: ["Midjourney", "Image Prompt", "Photography"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "image-prompt",
    purpose: "Precise image generation",
    transformation: "Subject → Light → Lens → Style → Params",
    tone: "Art director",
    bestFor: ["Designers", "Marketers", "AI artists"],
    platforms: ["chatgpt", "claude", "gemini", "mistral"],
    variables: [
      { key: "SUBJECT", label: "What should be in the image" },
      { key: "MOOD", label: "Mood / feeling" },
      { key: "TARGET_TOOL", label: "Target tool", suggestions: ["Midjourney", "DALL·E", "Stable Diffusion", "Flux"] },
    ],
    body: `Engineer an image prompt for {TARGET_TOOL}. Subject: {SUBJECT}. Mood: {MOOD}

Produce three variants (safe / balanced / adventurous), each specifying in order: subject + action, environment, lighting setup (direction + quality + color temperature), camera/lens character, composition framing, color palette, texture details, and style reference era or movement.

Rules:
- Concrete visual language only ("low golden-hour sun raking from frame left") — never vague adjectives alone ("beautiful").
- Include {TARGET_TOOL}-appropriate parameters/syntax notes.
- Flag one thing likely to render poorly (hands, text, crowds) and the workaround phrasing.`,
    featured: true,
    ageDays: 122,
    usageCount: 3390,
    rating: 4.7,
    ratingCount: 208,
  },

  // ---------------- Video ----------------
  {
    id: "video-hook-workshop",
    title: "Video Hook Workshop",
    description:
      "Generates ten scroll-stopping video openings with different hook mechanics, rated by stop-power.",
    category: "video",
    subcategory: "Hooks",
    tasks: ["brainstorm", "write"],
    tags: ["Hooks", "Short-form", "TikTok", "Reels"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "copy",
    purpose: "First-three-second survival",
    transformation: "Mechanism → Hook → Rate → Refine",
    tone: "Short-form strategist",
    bestFor: ["Creators", "Social teams"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "VIDEO_TOPIC", label: "Video topic" },
      { key: "PLATFORM", label: "Platform", suggestions: ["TikTok", "Reels", "Shorts"] },
    ],
    body: `Workshop hooks for a {PLATFORM} video about: {VIDEO_TOPIC}

Generate TEN hooks, each using a DIFFERENT mechanic: bold claim, pattern interrupt, question the viewer fears, result-first, contrarian take, curiosity gap, callout to the exact viewer, before/after tease, mistake confession, countdown/list promise.

Per hook: opening line (≤ 12 words) + what happens visually in the first 2 seconds.

Then rank the top 3 by predicted stop-power for THIS topic, one line of reasoning each. Kill any hook that overpromises beyond what the video can deliver.`,
    ageDays: 66,
    usageCount: 1470,
    rating: 4.4,
    ratingCount: 83,
  },

  // ---------------- Social Media ----------------
  {
    id: "thread-composer",
    title: "X/Twitter Thread Composer",
    description:
      "Structures ideas into threads with a scroll-stopping opener, one idea per post, and a strong close.",
    category: "social-media",
    subcategory: "Threads",
    tasks: ["write", "outline"],
    tags: ["Twitter", "Threads", "Social"],
    difficulty: "beginner",
    inputType: "text",
    outputType: "social-post",
    purpose: "Threads worth resharing",
    transformation: "Angle → Opener → Sequence → Close",
    tone: "Sharp, human",
    bestFor: ["Founders building in public", "Writers"],
    platforms: DEFAULT_PLATFORMS,
    variables: [
      { key: "IDEA_OR_DRAFT", label: "Idea or draft" },
      { key: "POST_LIMIT", label: "Max posts" },
    ],
    body: `Turn this into a thread ({POST_LIMIT} posts max): {IDEA_OR_DRAFT}

Rules:
- Post 1 must earn the tap: specific claim, tension, or number — never "a thread 🧵".
- One idea per post; every post stands alone but rewards sequential reading.
- Vary rhythm: mix short punches with occasional longer lines. No hashtag spam; ≤ 1 emoji per post.
- Include one concrete example or number per three posts minimum.
- Final post: takeaway + soft follow CTA.
Output numbered posts ready to paste, then flag the weakest post with a rewrite option.`,
    ageDays: 58,
    usageCount: 1240,
    rating: 4.3,
    ratingCount: 67,
  },

  // ---------------- Automation ----------------
  {
    id: "automation-blueprint-designer",
    title: "Automation Blueprint Designer",
    description:
      "Designs reliable workflow automations: trigger, steps, error handling, and failure alerts.",
    category: "automation",
    subcategory: "Workflow Design",
    tasks: ["design", "plan"],
    tags: ["Automation", "n8n", "Zapier", "Make"],
    difficulty: "intermediate",
    inputType: "text",
    outputType: "blueprint",
    purpose: "Automations that don't break silently",
    transformation: "Trigger → Steps → Guardrails → Monitor",
    tone: "Systems engineer",
    bestFor: ["Ops folks", "No-code builders"],
    platforms: ["chatgpt", "claude", "deepseek", "copilot"],
    variables: [
      { key: "PROCESS", label: "Process to automate" },
      { key: "TOOLS", label: "Tools available" },
    ],
    body: `Design an automation. Process: {PROCESS}. Available tools: {TOOLS}

Deliver:
1. PROCESS MAP — Current manual flow in steps, with time-per-run estimate.
2. BLUEPRINT — Trigger → transformations → actions, each node named with its input/output. Note sync vs async boundaries.
3. ERROR HANDLING — For each fallible step: retry policy, what happens on final failure, who gets alerted through which channel.
4. IDEMPOTENCY GUARD — How to prevent duplicate runs causing double effects (dedupe keys, run locks).
5. OBSERVABILITY — The one log/summary that tells you weekly whether it still works.
6. BUILD ORDER — Which slice to ship first that delivers value even if the rest isn't built yet.`,
    ageDays: 45,
    usageCount: 720,
    rating: 4.4,
    ratingCount: 38,
  },
];
