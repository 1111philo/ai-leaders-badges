# AI Leaders Badges

Generate circular badge images with QR codes for AI Leaders course participants.

## 🌐 Web Interface

**Live at: https://1111philo.github.io/ai-leaders-badges/**

Generate badges directly in your browser:
- **Single Badge**: Enter name and URL to generate one badge
- **Batch Upload**: Upload CSV file to generate multiple badges at once

No installation required!

## 💻 Command Line Usage

### Installation

```bash
npm install
```

### Generate Badges from CSV

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

## 🎨 Badge Design

- Circular badge with transparent background
- "AI LEADER" text curved along top arc
- Participant name curved below (dynamically sized)
- QR code in center linking to profile URL
- Intricate tech-themed decorative elements
- High-contrast black and white design

## 📋 Features

- **Dynamic font sizing**: Automatically adjusts text size based on name length to prevent overlap
- **Transparent backgrounds**: PNG output preserves transparency
- **Template-based**: Uses `mockup.png` as base design
- **Client-side generation**: Web interface runs entirely in browser
- **Batch processing**: Generate dozens of badges at once

## 📦 Output

Badges are saved as PNG files with names based on participant names:
- `john_doe_badge.png`
- `jane_smith_badge.png`
