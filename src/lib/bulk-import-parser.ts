/**
 * Bulk Import Parser & Text Normalizer
 * Robust heuristic parser for unformatted interview question blocks pasted from
 * LinkedIn, WhatsApp, Telegram, GitHub, documents, etc.
 */

export interface ParsedQuestionItem {
  question: string;
  order: number;
}

// Prefix pattern for numbered/bullet questions:
// e.g. "1.", "1)", "1-", "Q1.", "Q1:", "Q1)", "Q1-", "Q.", "Question 1:", "- ", "* ", "• "
const STRUCTURAL_PREFIX_REGEX = /^(?:(?:\d+[\.\)\-]|Q\d+[\.\:\)\-]|Q[\.\:\)\-]|Question\s*\d+[\.\:\)\-]|[\-\*\•])\s*)+/i;

// Header / Category title pattern (e.g. "Core Java:", "Spring Boot:", "Technical Round 1:")
const CATEGORY_HEADER_REGEX = /^(?:[A-Z][A-Za-z0-9\s&\/\-\+]+)\:\s*$/;

// Words that typically start a new question
const QUESTION_START_WORDS_REGEX = /^(?:what|why|how|explain|difference|describe|compare|can\s+you|where|when|is\s|are\s|which|define|implement|write\s|design\s|if\s|discuss|given|find|show|count|check|calculate|create|convert)\b/i;

// Words that typically indicate a continuation line when previous line did NOT end with '?'
const CONTINUATION_WORDS_REGEX = /^(?:and|or|that|to|with|in|for|where|so|without|by|from|about|which)\b/i;

export function parseBulkQuestionsText(rawText: string): ParsedQuestionItem[] {
  if (!rawText || !rawText.trim()) return [];

  // Normalize line endings
  const normalizedText = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const rawLines = normalizedText.split("\n");

  const questionBlocks: string[] = [];
  let currentBuffer: string[] = [];

  const flushBuffer = () => {
    if (currentBuffer.length > 0) {
      const merged = currentBuffer.join(" ").trim();
      if (merged) {
        questionBlocks.push(merged);
      }
      currentBuffer = [];
    }
  };

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const trimmedLine = rawLine.trim();

    // 1. Empty line flushes the current buffer
    if (!trimmedLine) {
      flushBuffer();
      continue;
    }

    // 2. Check if line is a category header (e.g., "Core Java:", "Spring Boot:")
    if (CATEGORY_HEADER_REGEX.test(trimmedLine) && !trimmedLine.includes("?")) {
      flushBuffer();
      continue; // Skip the header label itself
    }

    // 3. Check for structural prefix (e.g., "1. What is JVM?", "Q1: Explain HashMap", "- What is JDK?")
    const hasPrefix = STRUCTURAL_PREFIX_REGEX.test(trimmedLine);

    if (hasPrefix) {
      flushBuffer();
      const cleanedText = trimmedLine.replace(STRUCTURAL_PREFIX_REGEX, "").trim();
      if (cleanedText) {
        currentBuffer.push(cleanedText);
      }
      continue;
    }

    // 4. Line has NO prefix: Determine if it's a NEW question or a CONTINUATION of currentBuffer
    if (currentBuffer.length === 0) {
      // Buffer is empty, so this starts a new question
      currentBuffer.push(trimmedLine);
    } else {
      const prevText = currentBuffer[currentBuffer.length - 1].trim();
      const prevEndsWithQuestionMark = prevText.endsWith("?");
      const prevEndsWithPeriod = prevText.endsWith(".");

      const startsWithLowercase = /^[a-z]/.test(trimmedLine);
      const startsWithContinuationWord = CONTINUATION_WORDS_REGEX.test(trimmedLine);
      const startsWithQuestionWord = QUESTION_START_WORDS_REGEX.test(trimmedLine);

      // Continuation heuristics:
      // It is a continuation ONLY if:
      // - It starts with lowercase, OR
      // - It starts with a continuation word AND previous text did not end with '?', OR
      // - Previous text did NOT end with '?' OR '.' AND current line does NOT start with a question word / capital letter
      const isContinuation =
        startsWithLowercase ||
        (startsWithContinuationWord && !prevEndsWithQuestionMark) ||
        (!prevEndsWithQuestionMark && !prevEndsWithPeriod && !startsWithQuestionWord && !/^[A-Z]/.test(trimmedLine));

      if (isContinuation) {
        currentBuffer.push(trimmedLine);
      } else {
        // Otherwise, flush buffer and start a new question!
        flushBuffer();
        currentBuffer.push(trimmedLine);
      }
    }
  }

  // Flush remaining buffer
  flushBuffer();

  // Clean & assemble final question objects
  const finalQuestions: ParsedQuestionItem[] = [];
  let orderIndex = 1;

  for (const block of questionBlocks) {
    const trimmed = block.trim();
    if (trimmed.length > 2) {
      finalQuestions.push({
        question: trimmed,
        order: orderIndex++,
      });
    }
  }

  return finalQuestions;
}

/**
 * Normalizes question string for duplicate detection / frequency calculation
 */
export function normalizeQuestionText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}
