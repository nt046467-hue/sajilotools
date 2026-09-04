"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Copy,
  Check,
  Download,
  RefreshCw,
  Minus,
  Plus,
  Code2,
  Type,
  List,
  AlignLeft,
  MessageSquare,
} from "lucide-react";

/* ─────────────────────── WORD BANKS ─────────────────────── */

const CLASSIC_WORDS = [
  "lorem","ipsum","dolor","sit","amet","consectetur","adipiscing","elit","sed","do",
  "eiusmod","tempor","incididunt","ut","labore","et","dolore","magna","aliqua","enim",
  "ad","minim","veniam","quis","nostrud","exercitation","ullamco","laboris","nisi",
  "aliquip","ex","ea","commodo","consequat","duis","aute","irure","in","reprehenderit",
  "voluptate","velit","esse","cillum","fugiat","nulla","pariatur","excepteur","sint",
  "occaecat","cupidatat","non","proident","sunt","culpa","qui","officia","deserunt",
  "mollit","anim","id","est","laborum","perspiciatis","unde","omnis","iste","natus",
  "error","voluptatem","accusantium","doloremque","laudantium","totam","rem","aperiam",
  "eaque","ipsa","quae","ab","illo","inventore","veritatis","quasi","architecto",
  "beatae","vitae","dicta","explicabo","nemo","ipsam","quia","voluptas","aspernatur",
  "aut","odit","fugit","consequuntur","magni","dolores","eos","ratione","sequi",
  "nesciunt","neque","porro","quisquam","numquam","eius","modi","tempora","magnam",
  "quaerat","minima","nostrum","exercitationem","ullam","corporis","suscipit",
  "laboriosam","commodi","consequatur","autem","vel","eum","iure","nihil","molestiae",
  "illum","quo","vero","accusamus","iusto","odio","dignissimos","ducimus","blanditiis",
  "praesentium","voluptatum","deleniti","atque","corrupti","quos","quas","molestias",
  "excepturi","cupiditate","provident","similique","mollitia","animi","dolorum","fuga",
  "harum","quidem","rerum","facilis","expedita","distinctio","nam","libero","tempore",
  "soluta","nobis","eligendi","optio","cumque","impedit","minus","maxime","placeat",
  "facere","possimus","assumenda","repellendus",
];

const CLASSIC_OPENER = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";

const TECH_WORDS = [
  "synergize","leverage","scalable","paradigm","disrupt","optimize","blockchain",
  "cloud-native","agile","sprint","deploy","iterate","pipeline","microservice",
  "kubernetes","devops","fullstack","API","endpoint","webhook","serverless",
  "containerize","orchestrate","bandwidth","throughput","latency","uptime","SLA",
  "stakeholder","roadmap","KPI","OKR","pivot","growth-hack","monetize","churn",
  "onboard","retention","funnel","conversion","engagement","analytics","dashboard",
  "real-time","machine-learning","neural-network","deep-learning","inference",
  "training","dataset","model","transformer","embedding","vector","token","prompt",
  "fine-tune","pre-train","benchmark","evaluation","accuracy","precision","recall",
  "startup","unicorn","seed-round","series-A","valuation","runway","burn-rate",
  "product-market-fit","MVP","iteration","feedback-loop","user-story","backlog",
  "standup","retrospective","velocity","capacity","technical-debt","refactor",
  "code-review","pull-request","merge","branch","repository","CI-CD","integration",
  "regression","unit-test","end-to-end","coverage","linting","type-safety",
  "framework","library","dependency","package","bundle","tree-shake","lazy-load",
  "hydration","SSR","SSG","ISR","edge-function","CDN","cache","invalidate",
  "infrastructure","terraform","provisioning","auto-scale","load-balancer",
  "observability","monitoring","alerting","incident","postmortem","SRE",
  "cross-functional","alignment","north-star","metric","data-driven","insight",
];

const TECH_OPENER = "Synergize scalable paradigms to leverage cloud-native infrastructure.";

const NEPALI_WORDS = [
  "momo","dhido","dal-bhat","gundruk","tongba","sel-roti","yomari","chatamari",
  "Everest","Annapurna","Manaslu","Langtang","Pokhara","Kathmandu","Bhaktapur",
  "Patan","Lumbini","Chitwan","Mustang","Namche","Lukla","Sagarmatha","Himalaya",
  "Pashupatinath","Boudhanath","Swayambhu","Changu-Narayan","Nyatapola","Durbar",
  "topi","daura-suruwal","dhaka","madal","sarangi","damphu","jhyaure","deusi-bhailo",
  "Dashain","Tihar","Holi","Chhath","Teej","Indra-Jatra","Bisket","Gai-Jatra",
  "namaste","dhanyabad","mitho","ramro","sundar","sano","thulo","naya","purano",
  "khusi","maya","didi","bhai","daju","bahini","hajur","tapai","hami","timi",
  "chiya","lassi","raksi","jaand","sukuti","achaar","papad","bara","chatpate",
  "rhododendron","pipal","banyan","bamboo","paddy","terrace","monsoon","valley",
  "stupa","temple","pagoda","mandala","thangka","prayer-flag","khukuri","dhol",
  "rickshaw","tempo","microbus","sajilo","sajha","yatayat","gharelu","bikas",
  "samaj","sanskriti","parampara","utsav","tyohar","mela","bazar","haat",
  "chautari","peepal","dera","ghar","tole","chowk","galli","sadak","bridge",
  "suspension","rapids","rafting","trekking","summit","basecamp","sherpa","porter",
];

const NEPALI_OPENER = "Namaste, sajilo tools le tapai ko lagi momo jasto naram placeholder text banaidiyo.";

const HIPSTER_WORDS = [
  "artisan","cold-pressed","sustainable","curated","handcrafted","organic","locally-sourced",
  "farm-to-table","ethically-sourced","small-batch","bespoke","minimalist","aesthetic",
  "vintage","retro","vinyl","cassette","typewriter","polaroid","film-grain","analog",
  "craft-beer","sourdough","kombucha","matcha","oat-milk","avocado-toast","acai-bowl",
  "cold-brew","pour-over","single-origin","fair-trade","nitro","microbrew","IPA",
  "mason-jar","succulent","terrarium","macrame","rattan","mid-century","bohemian",
  "thrift","upcycled","reclaimed","raw-denim","selvedge","chambray","flannel",
  "fixie","longboard","penny-farthing","skateboard","cruiser","messenger-bag",
  "co-working","nomad","wanderlust","rooftop","loft","warehouse","exposed-brick",
  "Edison-bulb","neon-sign","mural","street-art","zine","podcast","playlist",
  "lo-fi","chill-hop","indie","folk","ambient","synth-wave","dream-pop",
  "mindful","zen","yoga","meditation","breathwork","journaling","gratitude",
  "plant-based","gluten-free","keto","paleo","adaptogen","turmeric","ginger-shot",
  "capsule-wardrobe","slow-fashion","conscious","intentional","authentic","genuine",
  "vibe","aesthetic","mood","energy","manifest","align","flow-state","grounded",
  "wholesome","nourish","ritual","ceremony","gathering","collective","community",
];

const HIPSTER_OPENER = "Artisan cold-pressed sustainable curated handcrafted organic locally-sourced vibes.";

type Flavor = "classic" | "tech" | "nepali" | "hipster";
type Unit = "paragraphs" | "sentences" | "words" | "lists";

const FLAVOR_MAP: Record<Flavor, { words: string[]; opener: string; label: string; emoji: string }> = {
  classic: { words: CLASSIC_WORDS, opener: CLASSIC_OPENER, label: "Classic Latin", emoji: "📜" },
  tech:    { words: TECH_WORDS,    opener: TECH_OPENER,    label: "Tech / Corporate", emoji: "💻" },
  nepali:  { words: NEPALI_WORDS,  opener: NEPALI_OPENER,  label: "Nepali Flavor 🇳🇵", emoji: "🇳🇵" },
  hipster: { words: HIPSTER_WORDS, opener: HIPSTER_OPENER, label: "Hipster", emoji: "🧔" },
};

const UNIT_CONFIG: Record<Unit, { label: string; min: number; max: number; icon: React.ReactNode }> = {
  paragraphs: { label: "Paragraphs", min: 1, max: 50, icon: <AlignLeft size={14} /> },
  sentences:  { label: "Sentences",  min: 1, max: 200, icon: <MessageSquare size={14} /> },
  words:      { label: "Words",      min: 1, max: 1000, icon: <Type size={14} /> },
  lists:      { label: "List Items", min: 1, max: 50, icon: <List size={14} /> },
};

/* ─────────────────── GENERATION ENGINE ─────────────────── */

function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateSentence(words: string[], minWords = 6, maxWords = 16): string {
  const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
  const parts: string[] = [];
  for (let i = 0; i < len; i++) parts.push(pick(words));
  // Add a comma somewhere in longer sentences
  if (len > 8) {
    const commaPos = 3 + Math.floor(Math.random() * (len - 6));
    parts[commaPos] = parts[commaPos] + ",";
  }
  return capitalize(parts.join(" ")) + ".";
}

function generateParagraph(words: string[], sentenceCount = 4): string {
  const count = sentenceCount + Math.floor(Math.random() * 3) - 1; // 3–6 sentences
  const sentences: string[] = [];
  for (let i = 0; i < Math.max(2, count); i++) {
    sentences.push(generateSentence(words));
  }
  return sentences.join(" ");
}

function generate(
  unit: Unit,
  count: number,
  flavor: Flavor,
  classicStart: boolean,
  htmlWrap: boolean
): string {
  const { words, opener } = FLAVOR_MAP[flavor];
  const lines: string[] = [];

  switch (unit) {
    case "paragraphs": {
      for (let i = 0; i < count; i++) {
        let p = generateParagraph(words);
        if (classicStart && i === 0) p = opener + " " + p;
        lines.push(htmlWrap ? `<p>${p}</p>` : p);
      }
      return lines.join(htmlWrap ? "\n\n" : "\n\n");
    }
    case "sentences": {
      for (let i = 0; i < count; i++) {
        let s = generateSentence(words);
        if (classicStart && i === 0) s = opener;
        lines.push(s);
      }
      const text = lines.join(" ");
      return htmlWrap ? `<p>${text}</p>` : text;
    }
    case "words": {
      const parts: string[] = [];
      if (classicStart) {
        const openerWords = opener.replace(/[.,]/g, "").split(/\s+/);
        parts.push(...openerWords.slice(0, Math.min(count, openerWords.length)));
      }
      while (parts.length < count) parts.push(pick(words));
      const text = capitalize(parts.slice(0, count).join(" "));
      return htmlWrap ? `<p>${text}</p>` : text;
    }
    case "lists": {
      const tag = htmlWrap ? "ol" : "";
      for (let i = 0; i < count; i++) {
        let item = generateSentence(words, 4, 10);
        if (classicStart && i === 0) item = opener;
        lines.push(htmlWrap ? `  <li>${item}</li>` : `• ${item}`);
      }
      if (htmlWrap) return `<${tag}>\n${lines.join("\n")}\n</${tag}>`;
      return lines.join("\n");
    }
  }
}

/* ─────────────────── COMPONENT ─────────────────── */

export default function LoremIpsumTool() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read initial state from URL params
  const initialUnit = (searchParams.get("unit") as Unit) || "paragraphs";
  const initialCount = Number(searchParams.get("count")) || 3;
  const initialFlavor = (searchParams.get("flavor") as Flavor) || "classic";
  const initialClassic = searchParams.get("classic") !== "0";
  const initialHtml = searchParams.get("html") === "1";

  const [unit, setUnit] = useState<Unit>(
    ["paragraphs", "sentences", "words", "lists"].includes(initialUnit) ? initialUnit : "paragraphs"
  );
  const [count, setCount] = useState(initialCount);
  const [flavor, setFlavor] = useState<Flavor>(
    ["classic", "tech", "nepali", "hipster"].includes(initialFlavor) ? initialFlavor : "classic"
  );
  const [classicStart, setClassicStart] = useState(initialClassic);
  const [htmlWrap, setHtmlWrap] = useState(initialHtml);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [seed, setSeed] = useState(0); // bump to re-roll

  // Clamp count to valid range when unit changes
  const config = UNIT_CONFIG[unit];
  const clampedCount = Math.max(config.min, Math.min(config.max, count));

  // Auto-regenerate whenever settings change
  useEffect(() => {
    const result = generate(unit, clampedCount, flavor, classicStart, htmlWrap);
    setOutput(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, clampedCount, flavor, classicStart, htmlWrap, seed]);

  // Sync settings to URL (debounced)
  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (unit !== "paragraphs") params.set("unit", unit);
      if (clampedCount !== 3) params.set("count", String(clampedCount));
      if (flavor !== "classic") params.set("flavor", flavor);
      if (!classicStart) params.set("classic", "0");
      if (htmlWrap) params.set("html", "1");
      const qs = params.toString();
      const newUrl = qs ? `${pathname}?${qs}` : pathname;
      router.replace(newUrl, { scroll: false });
    }, 400);
    return () => clearTimeout(timeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, clampedCount, flavor, classicStart, htmlWrap]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [output]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lorem-ipsum-${flavor}-${unit}-${clampedCount}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [output, flavor, unit, clampedCount]);

  // Stats
  const stats = useMemo(() => {
    const plainText = output.replace(/<[^>]*>/g, "");
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const charCount = plainText.length;
    return { wordCount, charCount };
  }, [output]);

  const adjustCount = (delta: number) => {
    setCount((prev) => Math.max(config.min, Math.min(config.max, prev + delta)));
  };

  /* ─────── Shared style tokens ─────── */
  const cardCls = "bg-white dark:bg-[#141829] rounded-2xl border border-[#E4E0D8] dark:border-[#1E2338] shadow-sm";
  const labelCls = "text-xs sm:text-sm font-semibold text-[#18181B] dark:text-[#F4F4F5]";
  const mutedCls = "text-[10px] sm:text-xs text-[#71717A] dark:text-[#A1A1AA]";
  const btnPrimary = "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] hover:opacity-90 transition-opacity";
  const btnSecondary = "bg-white dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] border border-[#E4E0D8] dark:border-[#2A2F4A] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42] transition-colors";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* ─── Controls Card ─── */}
      <div className={`${cardCls} p-4 sm:p-6 space-y-5`}>
        {/* Flavor Selector */}
        <div>
          <label className={`${labelCls} block mb-2`}>Text Style</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(FLAVOR_MAP) as Flavor[]).map((f) => (
              <button
                key={f}
                onClick={() => setFlavor(f)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  flavor === f
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] ring-2 ring-[#1F2544]/20 dark:ring-[#F5A623]/30"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                }`}
              >
                <span>{FLAVOR_MAP[f].emoji}</span>
                <span className="truncate">{FLAVOR_MAP[f].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Unit Selector */}
        <div>
          <label className={`${labelCls} block mb-2`}>Output Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(Object.keys(UNIT_CONFIG) as Unit[]).map((u) => (
              <button
                key={u}
                onClick={() => { setUnit(u); setCount(Math.min(count, UNIT_CONFIG[u].max)); }}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  unit === u
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] ring-2 ring-[#1F2544]/20 dark:ring-[#F5A623]/30"
                    : "bg-[#FAFAF8] dark:bg-[#1E2338] text-[#52525B] dark:text-[#A1A1AA] hover:bg-[#F0EDE8] dark:hover:bg-[#252A42]"
                }`}
              >
                {UNIT_CONFIG[u].icon}
                <span>{UNIT_CONFIG[u].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count Stepper + Toggles Row */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Stepper */}
          <div className="flex-1">
            <label className={`${labelCls} block mb-2`}>
              {config.label} Count
            </label>
            <div className="flex items-center gap-0">
              <button
                onClick={() => adjustCount(-1)}
                disabled={clampedCount <= config.min}
                className={`px-3 py-2.5 rounded-l-xl text-sm font-bold ${btnSecondary} disabled:opacity-30`}
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min={config.min}
                max={config.max}
                value={clampedCount}
                onChange={(e) => setCount(Math.max(config.min, Math.min(config.max, Number(e.target.value) || config.min)))}
                className="w-16 sm:w-20 text-center py-2.5 border-y border-[#E4E0D8] dark:border-[#2A2F4A] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm font-mono text-[#18181B] dark:text-[#F4F4F5] outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                onClick={() => adjustCount(1)}
                disabled={clampedCount >= config.max}
                className={`px-3 py-2.5 rounded-r-xl text-sm font-bold ${btnSecondary} disabled:opacity-30`}
              >
                <Plus size={14} />
              </button>
            </div>
            <p className={`${mutedCls} mt-1`}>{config.min}–{config.max}</p>
          </div>

          {/* Toggles */}
          <div className="flex-1 space-y-3">
            {/* Classic start */}
            <label className="flex items-center justify-between gap-3 cursor-pointer group">
              <span className="text-xs sm:text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#1F2544] dark:group-hover:text-[#F5A623] transition-colors">
                Start with classic opening
              </span>
              <div
                onClick={() => setClassicStart(!classicStart)}
                className={`relative w-10 h-[22px] rounded-full cursor-pointer transition-colors shrink-0 ${
                  classicStart
                    ? "bg-[#1F2544] dark:bg-[#F5A623]"
                    : "bg-[#D4D4D8] dark:bg-[#374151]"
                }`}
              >
                <div
                  className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    classicStart ? "translate-x-[22px]" : "translate-x-[3px]"
                  }`}
                />
              </div>
            </label>

            {/* HTML wrap */}
            <label className="flex items-center justify-between gap-3 cursor-pointer group">
              <span className="text-xs sm:text-sm font-medium text-[#18181B] dark:text-[#F4F4F5] group-hover:text-[#1F2544] dark:group-hover:text-[#F5A623] transition-colors flex items-center gap-1.5">
                <Code2 size={14} className="text-[#71717A]" />
                HTML tags
              </span>
              <div
                onClick={() => setHtmlWrap(!htmlWrap)}
                className={`relative w-10 h-[22px] rounded-full cursor-pointer transition-colors shrink-0 ${
                  htmlWrap
                    ? "bg-[#1F2544] dark:bg-[#F5A623]"
                    : "bg-[#D4D4D8] dark:bg-[#374151]"
                }`}
              >
                <div
                  className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    htmlWrap ? "translate-x-[22px]" : "translate-x-[3px]"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {/* Re-roll Button */}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold shadow-sm flex items-center justify-center gap-2 ${btnPrimary}`}
        >
          <RefreshCw size={16} /> Regenerate
        </button>
      </div>

      {/* ─── Output Card ─── */}
      <div className={`${cardCls} p-4 sm:p-6 space-y-3`}>
        {/* Action Buttons — stacked on mobile */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            disabled={!output}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40 ${
              copied
                ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                : btnSecondary
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={handleDownload}
            disabled={!output}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-40 ${btnSecondary}`}
          >
            <Download size={13} /> Download .txt
          </button>
        </div>

        {/* Output Text */}
        <div
          className={`w-full min-h-[200px] max-h-[500px] overflow-y-auto p-4 sm:p-5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#0A0D1A] text-sm leading-relaxed whitespace-pre-wrap break-words ${
            htmlWrap
              ? "font-mono text-xs text-[#52525B] dark:text-[#9CA3AF]"
              : "text-[#18181B] dark:text-[#F4F4F5]"
          }`}
        >
          {output || (
            <span className="text-[#C4C0B8] dark:text-[#374151]">
              Generating placeholder text…
            </span>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-4">
            <span className={mutedCls}>
              <strong className="text-[#18181B] dark:text-[#F4F4F5]">{stats.wordCount.toLocaleString()}</strong> words
            </span>
            <span className={mutedCls}>
              <strong className="text-[#18181B] dark:text-[#F4F4F5]">{stats.charCount.toLocaleString()}</strong> chars
            </span>
          </div>
          <span className={`${mutedCls} flex items-center gap-1`}>
            {FLAVOR_MAP[flavor].emoji} {FLAVOR_MAP[flavor].label}
          </span>
        </div>
      </div>
    </div>
  );
}
