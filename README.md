# text-sanitizer

Text hygiene for logs and LLM inputs: control chars, Unicode normalization, zero-width removal, homoglyph detection.

## What & Why

Clean user-supplied or third-party text before logging, storing, or feeding to language models. Removes control characters, normalizes Unicode, detects/removes zero-width chars, and flags homoglyphs. Honest disclaimer: helps with hygiene, is NOT a security boundary or prompt-injection defense.

## API

```typescript
export function sanitize(text: string, config?: SanitizeConfig): string
export function detectHomoglyphs(text: string): HomoglyphFinding[]
export function report(text: string): Record<string, number>
```

## Install

```bash
npm install text-sanitizer
```

## Quick Start

```typescript
import { sanitize, detectHomoglyphs, report } from 'text-sanitizer';

const dirty = 'Hello\x00world​‌\n'; // with null + zero-width chars
const clean = sanitize(dirty);
console.log(clean); // 'Hello\nworld\n' (normalized)

const findings = detectHomoglyphs('Привет'); // Cyrillic text
console.log(findings); // [ { position: 0, char: 'П', lookalikes: ['P'] }, ... ]

const stats = report(dirty);
console.log(stats); // { controlChars: 1, zeroWidthChars: 2, ... }
```

## Limits

- Homoglyph detection covers common Cyrillic/Greek lookalikes, not exhaustive.
- Zero-width character removal may affect legitimate uses (e.g., joining vowels in some scripts).
- NOT a security boundary; do not use as only defense against prompt injection or malicious input.

---
Part of the [ferrow-toolkit](https://github.com/Ruzylo-cloud/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
