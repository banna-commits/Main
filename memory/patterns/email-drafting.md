# Pattern: Email Drafting

## When
Knut forwards an email to banna@bottenanna.no and asks for a reply draft.

## Steps
1. Read the forwarded email thread
2. Draft reply matching tone (Norwegian for Norwegian contacts, English otherwise)
3. For long emails: split into 2 parts if >300 words
4. Send draft to knutgreiner@gmail.com for review
5. Read back the actual sent content as confirmation

## Gotchas
- Use `--body-file -` with heredoc for multi-line emails
- `--body` does NOT unescape `\n` — always use body-file for paragraphs
- Always CC all relevant parties (e.g., TakstHjem = Andre + Dag + Knut)
- gog account: `banna@bottenanna.no` (not bottenanna26)

## Quality: ⭐⭐⭐⭐ (works well, confirmed by Knut)
