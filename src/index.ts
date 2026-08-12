/**
 * Text hygiene: control char removal, Unicode normalization, zero-width stripping, homoglyph detection.
 * NOT a security boundary; helps with logging and LLM input cleaning.
 */

export interface SanitizeConfig {
  keepNewlines?: boolean;
  keepTabs?: boolean;
  maxLength?: number;
  normalize?: boolean;
  removeZeroWidth?: boolean;
  removeHomoglyphs?: boolean;
  collapseWhitespace?: boolean;
}

export interface HomoglyphFinding {
  position: number;
  char: string;
  lookalikes: string[];
}

// Common Unicode lookalikes (Cyrillic/Greek that look like Latin)
const HOMOGLYPHS: Record<string, string[]> = {
  'А': ['A'], // Cyrillic A
  'В': ['B'], // Cyrillic B
  'Е': ['E'], // Cyrillic E
  'К': ['K'], // Cyrillic K
  'М': ['M'], // Cyrillic M
  'Н': ['H'], // Cyrillic H
  'О': ['O'], // Cyrillic O
  'Р': ['P'], // Cyrillic R
  'С': ['C'], // Cyrillic S
  'Т': ['T'], // Cyrillic T
  'Х': ['X'], // Cyrillic X
  'а': ['a'], // Cyrillic a
  'е': ['e'], // Cyrillic e
  'о': ['o'], // Cyrillic o
  'р': ['p'], // Cyrillic r
  'с': ['c'], // Cyrillic c
  'х': ['x'], // Cyrillic x
  'ν': ['v'], // Greek nu
  'ρ': ['p'], // Greek rho
  'τ': ['t'], // Greek tau
};

// Zero-width characters
const ZERO_WIDTH_CHARS = new Set<string>(['​', '‌', '‍', '﻿']);

/**
 * Sanitize text: remove control chars, normalize Unicode, strip zero-width, etc.
 */
export function sanitize(text: string, config?: SanitizeConfig): string {
  let result = text;

  // Unicode normalization (NFC form)
  if (config?.normalize !== false) {
    result = result.normalize('NFC');
  }

  // Remove zero-width characters
  if (config?.removeZeroWidth !== false) {
    result = [...result].filter(ch => !ZERO_WIDTH_CHARS.has(ch)).join('');
  }

  // Remove control characters (except \n and \t if configured)
  const keepNewlines = config?.keepNewlines ?? true;
  const keepTabs = config?.keepTabs ?? true;
  result = [...result]
    .filter(ch => {
      const code = ch.charCodeAt(0);
      if (ch === '\n' && keepNewlines) return true;
      if (ch === '\t' && keepTabs) return true;
      if (code < 32 && ch !== '\n' && ch !== '\t') return false; // Control chars
      if (code === 127) return false; // DEL
      return true;
    })
    .join('');

  // Replace homoglyphs
  if (config?.removeHomoglyphs) {
    for (const [glyph, lookalikes] of Object.entries(HOMOGLYPHS)) {
      result = result.replace(new RegExp(glyph, 'g'), lookalikes[0]);
    }
  }

  // Collapse whitespace
  if (config?.collapseWhitespace) {
    result = result.replace(/\s+/g, ' ').trim();
  }

  // Truncate to maxLength on grapheme boundary
  if (config?.maxLength && result.length > config.maxLength) {
    const graphemes = [...result];
    result = graphemes.slice(0, config.maxLength).join('');
  }

  return result;
}

/**
 * Detect homoglyphs in text (reports positions and lookalikes).
 */
export function detectHomoglyphs(text: string): HomoglyphFinding[] {
  const findings: HomoglyphFinding[] = [];
  const normalized = text.normalize('NFC');

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch in HOMOGLYPHS) {
      findings.push({
        position: i,
        char: ch,
        lookalikes: HOMOGLYPHS[ch],
      });
    }
  }

  return findings;
}

/**
 * Report what was found in text (counts, no sensitive values).
 */
export function report(text: string): Record<string, number> {
  const findings: Record<string, number> = {
    controlChars: 0,
    zeroWidthChars: 0,
    homoglyphs: 0,
    length: text.length,
  };

  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code < 32 || code === 127) findings.controlChars++;
    if (ZERO_WIDTH_CHARS.has(ch)) findings.zeroWidthChars++;
    if (ch in HOMOGLYPHS) findings.homoglyphs++;
  }

  return findings;
}
