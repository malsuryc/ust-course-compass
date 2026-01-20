/**
 * Prerequisite Parser
 *
 * Extracts course codes from free-form prerequisite strings.
 * Handles various formats:
 * - Simple: "ACCT 2010"
 * - Multiple: "ACCT 2010, MATH 1010"
 * - Boolean: "ACCT 1000 AND (MATH 1010 OR MATH 1020)"
 * - Conditional: "(for non-BIBU students) ACCT 2010"
 * - Equivalent: "ACCT 5100 OR ACCT 5150 OR Equivalent"
 */

export interface ParsedPrerequisite {
  /** All course codes found (normalized without spaces, e.g., "ACCT2010") */
  courseCodes: string[];
  /** Whether the prerequisite contains AND logic */
  hasAnd: boolean;
  /** Whether the prerequisite contains OR logic */
  hasOr: boolean;
  /** Original raw string */
  raw: string;
}

// Regex to match course codes like "ACCT 2010", "MATH1010", "COMP 2011H"
// Captures: PREFIX (2-4 uppercase letters) + optional space + NUMBER (3-4 digits + optional letter)
const COURSE_CODE_REGEX = /\b([A-Z]{2,4})\s*(\d{3,4}[A-Z]?)\b/g;

/**
 * Normalizes a course code by removing spaces.
 * "ACCT 2010" -> "ACCT2010"
 */
export function normalizeCourseCode(code: string): string {
  return code.replace(/\s+/g, "").toUpperCase();
}

/**
 * Extracts all course codes from a prerequisite string.
 */
export function extractCourseCodes(prerequisiteStr: string): string[] {
  if (!prerequisiteStr || typeof prerequisiteStr !== "string") {
    return [];
  }

  const codes: string[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  COURSE_CODE_REGEX.lastIndex = 0;

  while ((match = COURSE_CODE_REGEX.exec(prerequisiteStr)) !== null) {
    const prefix = match[1];
    const number = match[2];
    const normalizedCode = `${prefix}${number}`;
    if (!codes.includes(normalizedCode)) {
      codes.push(normalizedCode);
    }
  }

  return codes;
}

/**
 * Parses a prerequisite string and returns structured data.
 */
export function parsePrerequisite(prerequisiteStr: string): ParsedPrerequisite {
  const raw = prerequisiteStr || "";
  const upperRaw = raw.toUpperCase();

  return {
    courseCodes: extractCourseCodes(raw),
    hasAnd: upperRaw.includes(" AND "),
    hasOr: upperRaw.includes(" OR "),
    raw,
  };
}

/**
 * Parses a comma-separated list of course codes (used for exclusions, co-listed, etc.)
 * "ACCT 2010, CORE 1310" -> ["ACCT2010", "CORE1310"]
 */
export function parseCommaSeparatedCourses(str: string): string[] {
  if (!str || typeof str !== "string") {
    return [];
  }
  return extractCourseCodes(str);
}

/**
 * Parses cross-campus equivalence field.
 * May contain formats like "HKUST(GZ) - ACCT 5010"
 */
export function parseCrossCampusEquivalence(str: string): string[] {
  if (!str || typeof str !== "string") {
    return [];
  }
  return extractCourseCodes(str);
}
