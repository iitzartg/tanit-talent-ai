import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface CvUploadItem {
  id: string;
  file: File;
  name: string;
}

export interface CvAnalysisResult {
  id: string;
  name: string;
  score: number;
  justification: string;
  matchedCriteria?: string[];
  missingCriteria?: string[];
  error?: boolean;
}

export async function analyzeCVs(
  cvs: CvUploadItem[],
  prompt: string,
): Promise<CvAnalysisResult[]> {
  const results: CvAnalysisResult[] = [];

  for (const cv of cvs) {
    try {
      const cvText = await extractCVText(cv.file);

      if (!cvText || cvText.trim().length === 0) {
        throw new Error("No text could be extracted from this file.");
      }

      const analysis = await analyzeWithOpenAI(cvText, prompt);

      results.push({
        id: cv.id,
        name: cv.name,
        score: analysis.score,
        justification: analysis.justification,
        matchedCriteria: analysis.matchedCriteria,
        missingCriteria: analysis.missingCriteria,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        id: cv.id,
        name: cv.name,
        score: 0,
        justification: `⚠️ Error: ${message}`,
        error: true,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

async function extractCVText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    return extractPDFText(file);
  }
  if (
    file.type ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractDOCXText(file);
  }
  if (file.type === "text/plain") {
    return extractTXTText(file);
  }
  throw new Error(
    `Unsupported format: ${file.type}. Use PDF, DOCX, or TXT.`,
  );
}

async function extractPDFText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += `${pageText}\n`;
    }

    if (fullText.trim().length === 0) {
      throw new Error(
        "This PDF does not contain extractable text (it may be a scanned image).",
      );
    }

    return cleanText(fullText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read PDF: ${message}`);
  }
}

async function extractDOCXText(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("The DOCX file does not contain readable text.");
    }

    return cleanText(result.value);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Could not read DOCX: ${message}`);
  }
}

function extractTXTText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      if (!text || text.trim().length === 0) {
        reject(new Error("The text file is empty."));
      } else {
        resolve(cleanText(text));
      }
    };
    reader.onerror = () =>
      reject(new Error("Error while reading the text file."));
    reader.readAsText(file, "utf-8");
  });
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

interface OpenAiAnalysisShape {
  score: number;
  justification: string;
  matchedCriteria: string[];
  missingCriteria: string[];
}

function getUsableOpenAiKey(): string | null {
  const raw = import.meta.env.VITE_OPENAI_API_KEY;
  const apiKey = typeof raw === "string" ? raw.trim() : "";
  if (!apiKey) return null;
  const placeholders = new Set([
    "your_openai_api_key_here",
    "votre_clé_api_openai_ici",
    "sk-your-key-here",
  ]);
  if (placeholders.has(apiKey.toLowerCase())) return null;
  return apiKey;
}

async function analyzeWithOpenAI(
  cvText: string,
  prompt: string,
): Promise<OpenAiAnalysisShape> {
  const apiKey = getUsableOpenAiKey();

  if (apiKey) {
    return analyzeWithOpenAIAPI(cvText, prompt, apiKey);
  }

  const fallback = simulateAnalysis(cvText, prompt);
  return {
    ...fallback,
    justification: `Mode: Keyword fallback (no usable OpenAI key)\n\n${fallback.justification}`,
  };
}

function parseJsonFromAssistantContent(raw: string): OpenAiAnalysisShape {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = jsonMatch ? jsonMatch[1].trim() : trimmed;
  const parsed = JSON.parse(candidate) as OpenAiAnalysisShape;
  if (
    typeof parsed.score !== "number" ||
    typeof parsed.justification !== "string"
  ) {
    throw new Error("Invalid JSON response from AI.");
  }
  return {
    score: parsed.score,
    justification: parsed.justification,
    matchedCriteria: Array.isArray(parsed.matchedCriteria)
      ? parsed.matchedCriteria
      : [],
    missingCriteria: Array.isArray(parsed.missingCriteria)
      ? parsed.missingCriteria
      : [],
  };
}

async function analyzeWithOpenAIAPI(
  cvText: string,
  prompt: string,
  apiKey: string,
): Promise<OpenAiAnalysisShape> {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert recruiter. Analyze the following CV against the requested criteria.
            Return a valid JSON response with the following fields:
            {
              "score": number between 0 and 100,
              "justification": "detailed explanation of the score in English",
              "matchedCriteria": ["criterion1", "criterion2"],
              "missingCriteria": ["criterion3", "criterion4"]
            }
            Be precise, objective, and professional in your analysis.`,
          },
          {
            role: "user",
            content: `Search criteria: ${prompt}\n\nCV to analyze:\n${cvText.substring(0, 4000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}.`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from OpenAI API.");
    }
    const parsed = parseJsonFromAssistantContent(content);
    return {
      ...parsed,
      justification: `Mode: LLM (OpenAI)\n\n${parsed.justification}`,
    };
  } catch {
    const fallback = simulateAnalysis(cvText, prompt);
    return {
      ...fallback,
      justification: `Mode: Keyword fallback (LLM unavailable)\n\n${fallback.justification}`,
    };
  }
}

function simulateAnalysis(cvText: string, prompt: string): OpenAiAnalysisShape {
  const cvLower = cvText.toLowerCase();
  const promptLower = prompt.toLowerCase();

  const stopWords = [
    // English
    "i",
    "you",
    "he",
    "she",
    "we",
    "they",
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "for",
    "with",
    "without",
    "in",
    "on",
    "under",
    "by",
    "of",
    "to",
    "that",
    "which",
    "who",
    "where",
    "what",
    "looking",
    "searching",
    "need",
    "want",
    "having",
    // French
    "je",
    "tu",
    "il",
    "elle",
    "nous",
    "vous",
    "ils",
    "elles",
    "le",
    "la",
    "les",
    "un",
    "une",
    "des",
    "du",
    "de",
    "pour",
    "avec",
    "sans",
    "dans",
    "sur",
    "sous",
    "par",
    "et",
    "ou",
    "mais",
    "donc",
    "car",
    "qui",
    "que",
    "quoi",
    "dont",
    "ou",
    "cherche",
    "recherche",
    "veux",
    "avoir",
  ];

  const keywords = promptLower
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.includes(word))
    .map((word) => word.replace(/[.,!?;:()]/g, ""));

  let matchCount = 0;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  keywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\w*\\b`, "i");
    if (regex.test(cvLower)) {
      matchCount++;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  });

  const technicalSkills = [
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

  let techBonus = 0;
  technicalSkills.forEach((skill) => {
    if (cvLower.includes(skill) && promptLower.includes(skill)) {
      techBonus += 5;
    }
  });

  let score =
    keywords.length > 0
      ? Math.min(100, Math.round((matchCount / keywords.length) * 100))
      : 50;

  score = Math.min(100, score + techBonus);

  if (cvText.length > 5000) score = Math.min(100, score + 10);
  else if (cvText.length > 2000) score = Math.min(100, score + 5);
  else if (cvText.length < 500) score = Math.max(0, score - 10);

  let justification = "📊 **CV Analysis**\n\n";
  justification += `**Criteria analyzed:** ${keywords.length}\n`;
  if (keywords.length > 0) {
    justification += `**Matches:** ${matchCount}/${keywords.length} (${Math.round((matchCount / keywords.length) * 100)}%)\n\n`;
  }
  justification += `**CV content length:** ${cvText.length} characters\n`;

  if (matchCount > 0) {
    justification += `\n**Strengths:** This CV matches ${matchCount} requested criteria.\n`;
  }

  if (score >= 80) {
    justification += `\n✅ **Conclusion:** Excellent profile. It strongly matches the requested criteria.`;
  } else if (score >= 60) {
    justification += `\n👍 **Conclusion:** Good profile. It matches most criteria well.`;
  } else if (score >= 40) {
    justification += `\n⚠️ **Conclusion:** Promising profile, but some important criteria are missing.`;
  } else {
    justification += `\n❌ **Conclusion:** Profile does not match the requested criteria sufficiently.`;
  }

  return {
    score: Math.round(score),
    justification,
    matchedCriteria: matchedKeywords.slice(0, 8).map((k) => `✓ ${k}`),
    missingCriteria: missingKeywords.slice(0, 8).map((k) => `✗ ${k}`),
  };
}
