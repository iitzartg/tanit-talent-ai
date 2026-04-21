const PLACEHOLDER_KEYS = new Set([
  "your_openai_api_key_here",
  "votre_clé_api_openai_ici",
  "sk-your-key-here",
]);

const TECHNICAL_SKILLS = [
  "react",
  "angular",
  "vue",
  "javascript",
  "typescript",
  "node",
  "python",
  "java",
  "php",
  "laravel",
  "symfony",
  "django",
  "flask",
  "spring",
  "sql",
  "mongodb",
  "postgresql",
  "mysql",
  "aws",
  "azure",
  "docker",
  "kubernetes",
  "git",
  "agile",
  "scrum",
  "jira",
];

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "for", "with", "without", "in", "on", "under", "by", "of", "to",
  "that", "which", "who", "where", "what", "looking", "searching", "need", "want", "having",
  "le", "la", "les", "un", "une", "des", "du", "de", "pour", "avec", "sans", "dans", "sur", "sous", "par",
  "et", "ou", "mais", "donc", "car", "qui", "que", "quoi", "dont", "cherche", "recherche", "veux", "avoir",
]);

const clamp01 = (value) => {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return Number(value.toFixed(2));
};

function getOpenAiKey() {
  const rawKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY || "";
  const key = String(rawKey).trim();
  if (!key) return null;
  if (PLACEHOLDER_KEYS.has(key.toLowerCase())) return null;
  return key;
}

function buildPromptFromJob(job) {
  const requirements = Array.isArray(job?.requirements) ? job.requirements.join(", ") : "";
  return [
    `Job title: ${job?.title || ""}`,
    `Company: ${job?.company || ""}`,
    `Description: ${job?.description || ""}`,
    `Requirements: ${requirements}`,
  ].join("\n");
}

function buildCandidateText(profile) {
  if (!profile) return "";
  return [profile.bio || "", Array.isArray(profile.skills) ? profile.skills.join(" ") : "", profile.cvText || ""]
    .join("\n")
    .trim();
}

function parseScoreFromResponse(content) {
  const trimmed = String(content || "").trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  const parsed = JSON.parse(candidate);
  const rawScore = typeof parsed?.score === "number" ? parsed.score : 0;
  const normalized = rawScore > 1 ? rawScore / 100 : rawScore;
  return clamp01(normalized);
}

async function scoreWithOpenAI({ candidateText, jobPrompt, apiKey }) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      max_tokens: 350,
      messages: [
        {
          role: "system",
          content:
            "You are an expert recruiter. Return ONLY valid JSON with shape {\"score\": number}. Score must be between 0 and 100.",
        },
        {
          role: "user",
          content: `Evaluate this candidate CV against the job.\n\nJOB:\n${jobPrompt}\n\nCANDIDATE CV:\n${candidateText.slice(0, 7000)}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return parseScoreFromResponse(content);
}

function scoreWithKeywordFallback({ candidateText, jobPrompt }) {
  const cvLower = candidateText.toLowerCase();
  const promptLower = jobPrompt.toLowerCase();
  const keywords = promptLower
    .split(/\s+/)
    .map((word) => word.replace(/[.,!?;:()]/g, ""))
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  if (keywords.length === 0) return 0.5;

  let matches = 0;
  for (const keyword of keywords) {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, "i");
    if (regex.test(cvLower)) matches += 1;
  }

  let score = matches / keywords.length;
  for (const skill of TECHNICAL_SKILLS) {
    if (promptLower.includes(skill) && cvLower.includes(skill)) {
      score += 0.02;
    }
  }
  return clamp01(score);
}

async function computeApplicationAiScore({ job, profile, candidateTextOverride = "" }) {
  const candidateText = String(candidateTextOverride || "").trim() || buildCandidateText(profile);
  const jobPrompt = buildPromptFromJob(job);

  if (!candidateText.trim()) return 0;

  const apiKey = getOpenAiKey();
  if (apiKey) {
    try {
      return await scoreWithOpenAI({ candidateText, jobPrompt, apiKey });
    } catch (_error) {
      return scoreWithKeywordFallback({ candidateText, jobPrompt });
    }
  }

  return scoreWithKeywordFallback({ candidateText, jobPrompt });
}

module.exports = {
  computeApplicationAiScore,
};
