import type { IntentAnalysis, TaskSignal } from "@/lib/types";
import { contentTokens, titleCase } from "./textUtils";

/**
 * IntentService — turns a natural-language request into structured intent.
 *
 * Rule-based lexical analysis (deterministic, instant, offline). The interface
 * accepts an optional async LLM enhancer later; the shape stays identical.
 */

interface TaskRule {
  canonical: string;
  label: string;
  patterns: RegExp[];
}

const TASK_RULES: TaskRule[] = [
  { canonical: "summarize", label: "Summarize", patterns: [/\bsummar(y|ize|ise|izing)\b/i, /\btldr\b/i, /\bcondense\b/i, /\bskimm(e|ing)\b/i] },
  { canonical: "review", label: "Review", patterns: [/\bcode[- ]?review\b/i, /\breview\b/i, /\baudit\b/i, /\bcritique\b/i] },
  { canonical: "detect", label: "Detect issues", patterns: [/\bdetect(ion)?\b/i, /\bfind (bugs?|issues?|vulnerabilit|weakness|risks?|errors?)\b/i, /\bvulnerabilit/i, /\bscan\b/i] },
  { canonical: "recommend", label: "Recommend fixes", patterns: [/\brecommend/i, /\bfix(es)?\b/i, /\bremediat/i, /\bsuggest(ed)? improvements?\b/i, /\bbest practices?\b/i] },
  { canonical: "debug", label: "Debug", patterns: [/\bdebug(ging)?\b/i, /\broot cause\b/i, /\bwhy .*(fail|broken|not work)/i] },
  { canonical: "explain", label: "Explain", patterns: [/\bexplain(s|ing)?\b/i, /\bsimpl(er|ify)\b/i, /\beli5\b/i, /\bunderstand(ing)?\b/i, /\bteach(es|ing)?\b/i] },
  { canonical: "quiz", label: "Quiz / test", patterns: [/\bquiz\b/i, /\btest (me|myself)\b/i, /\bexam questions?\b/i, /\bpractice questions?\b/i] },
  { canonical: "extract", label: "Extract", patterns: [/\bextract(ion)?\b/i, /\bpull out\b/i, /\bidentif(y|ies) (the )?(key|important|main)\b/i, /\bkey clauses?\b/i, /\brisks?\b/i] },
  { canonical: "convert", label: "Convert", patterns: [/\bturn[s ]?\b/i, /\bconvert\b/i, /\bmake .*notes\b/i, /\bflash ?cards?\b/i, /\btransform\b/i] },
  { canonical: "translate", label: "Translate", patterns: [/\btranslat(e|ing|ion)\b/i] },
  { canonical: "analyze", label: "Analyze", patterns: [/\banaly(z|s)e\b/i, /\banalysis\b/i, /\binsight/i, /\bassess(ment)?\b/i, /\bevaluat(e|ion)\b/i] },
  { canonical: "compare", label: "Compare", patterns: [/\bcompar(e|ison|ing)\b/i, /\bvs\.?\b/i, /\bside by side\b/i] },
  { canonical: "write", label: "Write", patterns: [/\bwrite\b/i, /\bdraft\b/i, /\bcompose\b/i, /\bblog post\b/i, /\barticl(e|es)\b/i] },
  { canonical: "rewrite", label: "Rewrite", patterns: [/\brewrit(e|ing)\b/i, /\bhumaniz(e|ing)\b/i, /\brephrase\b/i, /\bpunch up\b/i, /\bimprove (my |the )?(resume|cv|writing)\b/i] },
  { canonical: "edit", label: "Edit", patterns: [/\bedit(ing)?\b/i, /\bproofread/i, /\bpolish\b/i] },
  { canonical: "plan", label: "Plan", patterns: [/\bplan(ning)?\b/i, /\broadmap\b/i, /\bschedule\b/i, /\bitinerary\b/i, /\bstudy plan\b/i] },
  { canonical: "brainstorm", label: "Brainstorm", patterns: [/\bbrainstorm/i, /\bideas for\b/i, /\bcome up with\b/i, /\bnames?\b.*\bfor\b/i] },
  { canonical: "optimize", label: "Optimize", patterns: [/\boptimiz(e|ing|ation)\b/i, /\bspeed up\b/i, /\bperformance\b/i, /\bslow query\b/i, /\bslow\b/i] },
  { canonical: "refactor", label: "Refactor", patterns: [/\brefactor/i, /\bclean(er|up) (code|up)\b/i, /\btech(nical)? debt\b/i] },
  { canonical: "document", label: "Document", patterns: [/\bdocument(ation)?\b/i, /\breadme\b/i, /\bapi docs?\b/i] },
  { canonical: "organize", label: "Organize", patterns: [/\borgani(z|s)e\b/i, /\btriage\b/i, /\bprioriti(z|s)e\b/i, /\bsort\b/i] },
  { canonical: "design", label: "Design", patterns: [/\bdesign(ing)?\b/i, /\bblueprint\b/i, /\bwireframe\b/i, /\barchitect(ure)?\b/i] },
  { canonical: "outline", label: "Outline", patterns: [/\boutline\b/i, /\bstructure\b/i, /\bstoryboard\b/i, /\bslides?\b/i, /\bpresentation\b/i] },
];

interface CategoryRule {
  category: string;
  domain: string;
  patterns: RegExp[];
}

const CATEGORY_RULES: CategoryRule[] = [
  { category: "legal", domain: "Legal & contracts", patterns: [/\blegal\b/i, /\bcontract\b/i, /\bclause\b/i, /\bliability\b/i, /\bindemnit/i, /\bnda\b/i, /\bterms of service\b/i, /\bcompliance\b/i] },
  { category: "coding", domain: "Software development", patterns: [/\bpython\b/i, /\bjavascript\b/i, /\btypescript\b/i, /\bjava\b/i, /\bgolang|\bgo code\b/i, /\brust\b/i, /\bcod(e|ing)\b/i, /\bfunction\b/i, /\bapi\b/i, /\bsql\b/i, /\bregex\b/i, /\bbug\b/i, /\brefactor/i, /\bsecurity vulnerabilit/i, /\brepository\b/i] },
  { category: "data-analysis", domain: "Data & analytics", patterns: [/\bdata ?set\b/i, /\bcsv\b/i, /\bspreadsheet\b/i, /\bchart\b/i, /\bstatistic/i, /\bcorrelat/i, /\bregression\b/i, /\bdashboard\b/i, /\bmetrics?\b/i] },
  { category: "education", domain: "Education & learning", patterns: [/\bstudy\b/i, /\bexam\b/i, /\bquiz\b/i, /\bflash ?cards?\b/i, /\blesson\b/i, /\bstudent(s)?\b/i, /\blearn(ing)?\b/i, /\brevision\b/i] },
  { category: "research", domain: "Research", patterns: [/\bresearch\b/i, /\bpaper(s)?\b/i, /\bliterature\b/i, /\bacademic\b/i, /\bcitation/i, /\bstud(y|ies)\b.*(result|finding)/i, /\brar\b/i] },
  { category: "marketing", domain: "Marketing", patterns: [/\bmarketing\b/i, /\bad(s|vertising| copy)?\b/i, /\bseo\b/i, /\bcampaign\b/i, /\blanding page\b/i, /\bconversion\b/i, /\bbrand(ing)?\b/i] },
  { category: "career", domain: "Career & job search", patterns: [/\bresume\b/i, /\bcv\b/i, /\bcover letter\b/i, /\binterview\b/i, /\bjob\b/i, /\bhiring\b/i, /\blinkedin\b/i, /\bcareer\b/i] },
  { category: "business", domain: "Business & strategy", patterns: [/\bbusiness\b/i, /\bcompetitor\b/i, /\bmarket(ing)? analysis\b/i, /\bswot\b/i, /\bstrategy\b/i, /\bstakeholder/i, /\bexecutive\b/i, /\bpitch\b/i, /\bstartup idea\b/i, /\bpricing\b/i] },
  { category: "finance", domain: "Finance", patterns: [/\bbudget\b/i, /\binvest(ment|ing)\b/i, /\bportfolio\b/i, /\bstock(s)?\b/i, /\bsaving(s)?\b/i, /\bexpenses?\b/i, /\bfinancial\b/i] },
  { category: "productivity", domain: "Personal productivity", patterns: [/\bemail(s)?\b/i, /\binbox\b/i, /\bmeeting(s)?\b/i, /\bto-?do\b/i, /\bproductivity\b/i, /\bschedule\b/i, /\bsummariz(e|ing) (a|any|this|the) (document|article|text|report)\b/i] },
  { category: "writing", domain: "Writing & editing", patterns: [/\bblog\b/i, /\barticl(e|es)\b/i, /\bwrit(e|ing)\b/i, /\bprose\b/i, /\bcopy\b/i, /\bhumaniz/i, /\bnewsletter\b/i, /\bstory\b/i, /\bnovel\b/i] },
  { category: "presentations", domain: "Presentations", patterns: [/\bpresentation\b/i, /\bslide(s|deck| deck)?\b/i, /\bpptx?\b/i, /\bkeynote\b/i, /\btalk\b/i] },
  { category: "content-creation", domain: "Content creation", patterns: [/\byoutube\b/i, /\bvideo script\b/i, /\bpodcast\b/i, /\bcontent calendar\b/i, /\bvlog\b/i] },
  { category: "social-media", domain: "Social media", patterns: [/\btwitter\b/i, /\bthread\b/i, /\btiktok\b/i, /\binstagram\b/i, /\breels?\b/i, /\bshorts?\b/i, /\bhooks?\b/i, /\bposts?\b for social/i] },
  { category: "image-generation", domain: "Image generation", patterns: [/\bimage\b/i, /\bphoto(realistic)?\b/i, /\bmidjourney\b/i, /\bdall-?e\b/i, /\bstable diffusion\b/i, /\billustration\b/i, /\blogo\b/i, /\bthumbnail\b/i] },
  { category: "video", domain: "Video", patterns: [/\bvideo\b/i, /\breel(s)?\b/i, /\bhook(s)?\b/i, /\bstoryboard\b/i] },
  { category: "design", domain: "Design & UX", patterns: [/\bux\b/i, /\bui design\b/i, /\bdesign (critique|system|review)\b/i, /\buser research\b/i, /\bfigma\b/i] },
  { category: "customer-support", domain: "Customer support", patterns: [/\bsupport ticket\b/i, /\bcustomer (email|message|complaint|reply|service)\b/i, /\bhelpdesk\b/i, /\bzendesk\b/i] },
  { category: "management", domain: "Management", patterns: [/\bone[- ]on[- ]one\b/i, /\b1:1\b/i, /\bperforman(c|ke) review\b/i, /\bmanage(ment|r)\b/i, /\bteam member\b/i] },
  { category: "entrepreneurship", domain: "Entrepreneurship", patterns: [/\bstart ?up\b/i, /\bidea validat/i, /\bmvp\b/i, /\bfounder\b/i, /\bpitch deck\b/i] },
  { category: "automation", domain: "Automation", patterns: [/\bautomat(e|ion)\b/i, /\bzapier\b/i, /\bn8n\b/i, /\bmake\.com\b/i, /\bwebhook\b/i] },
  { category: "personal-development", domain: "Personal development", patterns: [/\bhabit(s)?\b/i, /\bjournal(ing)?\b/i, /\breflect(ion|ing)\b/i, /\bmindful/i, /\bself[- ]improvement\b/i] },
];

const INPUT_RULES: { type: string; patterns: RegExp[] }[] = [
  { type: "code", patterns: [/\b(code|snippet|script|program|repository|repo|function(s)?|class(es)?)\b/i, /\b(python|javascript|typescript|java|golang|rust|c\+\+|c#)\b/i] },
  { type: "pdf", patterns: [/\bpdf\b/i] },
  { type: "data", patterns: [/\b(csv|data ?set|spreadsheet|excel|json|table of data|database rows)\b/i] },
  { type: "url", patterns: [/\b(url|website|link|webpage|landing page)\b/i] },
  { type: "image", patterns: [/\b(image|screenshot|photo|picture)\b/i] },
  { type: "document", patterns: [/\b(document|paper|report|contract|article|essay|thesis|transcript|manuscript|book|chapter|notes)\b/i] },
  { type: "email", patterns: [/\b(emails?|inbox)\b/i] },
];

const OUTPUT_RULES: { type: string; patterns: RegExp[] }[] = [
  { type: "questions", patterns: [/\b(questions?|quiz|exam|flash ?cards?)\b/i] },
  { type: "summary", patterns: [/\b(summar(y|ies)|tldr|key points|digest|notes)\b/i] },
  { type: "report", patterns: [/\b(report|analysis|audit findings|risk assessment|brief)\b/i] },
  { type: "slides", patterns: [/\b(slides?|presentation|deck|ppt)\b/i] },
  { type: "email", patterns: [/\b(email|reply|response letter|outreach)\b/i] },
  { type: "plan", patterns: [/\b(plan|roadmap|schedule|itinerary|checklist)\b/i] },
  { type: "table", patterns: [/\b(table|matrix|spreadsheet layout|comparison grid)\b/i] },
  { type: "code", patterns: [/\b(sql query|regex|code fix|refactored code)\b/i] },
  { type: "copy", patterns: [/\b(ad copy|social posts?|thread|tweet|caption|hook)\b/i] },
  { type: "explanation", patterns: [/\b(explanation|guide|tutorial|walkthrough)\b/i] },
  { type: "image-prompt", patterns: [/\b(image prompt|midjourney prompt|art prompt)\b/i] },
];

const PLATFORM_PATTERNS: { id: string; patterns: RegExp[] }[] = [
  { id: "chatgpt", patterns: [/\bchat ?gpt\b/i, /\bopenai\b/i] },
  { id: "claude", patterns: [/\bclaude\b/i, /\banthropic\b/i] },
  { id: "gemini", patterns: [/\bgemini\b/i, /\bbard\b/i] },
  { id: "grok", patterns: [/\bgrok\b/i] },
  { id: "deepseek", patterns: [/\bdeepseek\b/i] },
  { id: "perplexity", patterns: [/\bperplexity\b/i] },
  { id: "copilot", patterns: [/\b(microsoft )?copilot\b/i] },
  { id: "mistral", patterns: [/\bmistral\b/i] },
  { id: "meta", patterns: [/\bmeta ai\b/i, /\bllama\b/i] },
];

const CONSTRAINT_PATTERNS: { re: RegExp; constraint: string }[] = [
  { re: /\bplain (english|language)\b/i, constraint: "Plain language, no jargon" },
  { re: /\bwithout jargon\b/i, constraint: "No jargon" },
  { re: /\bstep[- ]by[- ]step\b/i, constraint: "Step-by-step structure" },
  { re: /\bbeginner[- ]friendly\b/i, constraint: "Beginner-friendly" },
  { re: /\bshort(ly)?\b|\bconcise\b|\bbrief\b/i, constraint: "Keep it concise" },
  { re: /\bdetailed\b|\bin depth\b|\bthorough\b/i, constraint: "Be thorough" },
  { re: /\btable\b/i, constraint: "Prefer tabular output" },
  { re: /\bbullet points?\b/i, constraint: "Use bullet points" },
];

// Multi-step connectors push complexity up.
const CONNECTOR_RE = /\b(then|after that|afterwards|also|and then|followed by|finally|next)\b/gi;

export function parseIntent(rawQuery: string): IntentAnalysis {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();

  // ---- Tasks (ordered by appearance in text) ----
  const tasks: TaskSignal[] = [];
  for (const rule of TASK_RULES) {
    for (const p of rule.patterns) {
      const m = q.match(new RegExp(p.source, "i"));
      if (m) {
        if (!tasks.some((t) => t.task === rule.canonical)) {
          tasks.push({ task: rule.canonical, phrase: m[0].toLowerCase() });
        }
        break;
      }
    }
  }
  // keep textual order
  tasks.sort((a, b) => lower.indexOf(a.phrase) - lower.indexOf(b.phrase));

  // ---- Category / domain ----
  let category: string | null = null;
  let domain: string | null = null;
  let bestHits = 0;
  for (const rule of CATEGORY_RULES) {
    const hits = rule.patterns.filter((p) => p.test(q)).length;
    if (hits > bestHits) {
      bestHits = hits;
      category = rule.category;
      domain = rule.domain;
    }
  }

  // ---- Input / output / platform ----
  const inputType =
    INPUT_RULES.find((r) => r.patterns.some((p) => p.test(q)))?.type ?? null;
  const outputType =
    OUTPUT_RULES.find((r) => r.patterns.some((p) => p.test(q)))?.type ?? null;
  const platformMatch = PLATFORM_PATTERNS.find((r) => r.patterns.some((p) => p.test(q)));

  // ---- Constraints ----
  const constraints = CONSTRAINT_PATTERNS.filter((c) => c.re.test(q)).map((c) => c.constraint);

  // ---- Complexity ----
  const connectorCount = (lower.match(CONNECTOR_RE) ?? []).length;
  const commaTaskCount = (q.match(/,/g) ?? []).length;
  const complexityRaw = Math.min(
    5,
    Math.max(
      tasks.length >= 3 ? 4 : tasks.length,
      1 + connectorCount + Math.min(commaTaskCount, 2),
    ),
  );

  // ---- Keywords ----
  const keywords = contentTokens(q).slice(0, 12);

  // ---- Intent phrase ----
  const primaryTask = tasks[0] ? titleCase(tasks[0].task) : "Assist";
  const intent = domain
    ? `${domain} · ${primaryTask}`
    : `${primaryTask} assistance`;

  return {
    rawQuery: q,
    intent,
    category,
    tasks,
    domain,
    inputType,
    outputType,
    platform: platformMatch?.id ?? null,
    complexity: complexityRaw,
    keywords,
    constraints,
  };
}
