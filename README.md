# AI Leaders Badges

Generate circular badge images with QR codes for AI Leaders course participants.

## Installation

```bash
npm install
```

## Usage

1. Create a CSV file with participant data:

```csv
name,url
John Doe,https://example.com/john-doe
Jane Smith,https://example.com/jane-smith
```

2. Run the generator:

```bash
node generate-badges.js participants.csv
```

3. Find generated badges in the `output/` directory

## Badge Design

- Circular badge (1200x1200px)
- "AI LEADER" text curved along top
- Participant name curved below
- QR code in center linking to profile URL
- Tech-themed decorative elements
- Black and white color scheme

## Output

Badges are saved as PNG files with names based on participant names:
- `john_doe_badge.png`
- `jane_smith_badge.png`
