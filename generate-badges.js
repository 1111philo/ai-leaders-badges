const { createCanvas, registerFont } = require('canvas');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
const path = require('path');

const SIZE = 1200;
const CENTER = SIZE / 2;

async function generateQRCode(url) {
  return await QRCode.toDataURL(url, {
    width: 400,
    margin: 1,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

function generateBinaryString(length) {
  return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
}

function createSVGPath(d, attrs = {}) {
  const attrStr = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ');
  return `<path d="${d}" ${attrStr} />`;
}

function createCircularText(text, radius, startAngle, endAngle, fontSize, fontWeight = 'bold') {
  const totalAngle = endAngle - startAngle;
  const angleStep = totalAngle / (text.length - 1);

  let paths = '';
  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + (i * angleStep);
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;
    const rotation = (angle * 180 / Math.PI) + 90;

    paths += `<text x="${x}" y="${y}" font-size="${fontSize}" font-weight="${fontWeight}" font-family="Arial, sans-serif" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotation}, ${x}, ${y})" fill="white">${text[i]}</text>`;
  }
  return paths;
}

function createCircuitPattern(innerRadius, outerRadius, density = 48) {
  let elements = '';

  for (let i = 0; i < density; i++) {
    const angle = (i / density) * Math.PI * 2;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = CENTER + Math.cos(angle) * r;
    const y = CENTER + Math.sin(angle) * r;

    if (i % 6 === 0) {
      elements += `<circle cx="${x}" cy="${y}" r="8" fill="white" />`;
      elements += `<circle cx="${x}" cy="${y}" r="5" fill="black" />`;
    } else if (i % 3 === 0) {
      const x2 = CENTER + Math.cos(angle) * (r + 15);
      const y2 = CENTER + Math.sin(angle) * (r + 15);
      elements += `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="white" stroke-width="3" />`;
    } else if (i % 2 === 0) {
      elements += `<rect x="${x-4}" y="${y-8}" width="8" height="16" fill="white" transform="rotate(${angle * 180 / Math.PI + 90}, ${x}, ${y})" />`;
    }
  }

  for (let r = innerRadius; r < outerRadius; r += 30) {
    const dashes = Math.floor(Math.random() * 50 + 50);
    elements += `<circle cx="${CENTER}" cy="${CENTER}" r="${r}" fill="none" stroke="white" stroke-width="1" stroke-dasharray="${dashes} ${dashes}" opacity="0.3" />`;
  }

  return elements;
}

function createBinaryRing(radius, fontSize = 12) {
  const binary = generateBinaryString(80);
  const angleStep = (Math.PI * 2) / binary.length;

  let text = '';
  for (let i = 0; i < binary.length; i++) {
    const angle = (i * angleStep) - Math.PI / 2;
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;
    const rotation = (angle * 180 / Math.PI) + 90;

    text += `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="monospace" text-anchor="middle" dominant-baseline="middle" transform="rotate(${rotation}, ${x}, ${y})" fill="white" opacity="0.7">${binary[i]}</text>`;
  }
  return text;
}

function createTechDecorations(innerRadius, outerRadius) {
  let deco = '';

  const numElements = 16;
  for (let i = 0; i < numElements; i++) {
    const angle = (i / numElements) * Math.PI * 2;
    const r = (innerRadius + outerRadius) / 2;
    const x = CENTER + Math.cos(angle) * r;
    const y = CENTER + Math.sin(angle) * r;
    const rotation = angle * 180 / Math.PI;

    if (i % 4 === 0) {
      deco += `<g transform="translate(${x}, ${y}) rotate(${rotation})">
        <rect x="-6" y="-12" width="12" height="24" fill="white" />
        <rect x="-3" y="-8" width="6" height="16" fill="black" />
      </g>`;
    } else if (i % 2 === 0) {
      deco += `<circle cx="${x}" cy="${y}" r="6" fill="white" stroke="black" stroke-width="2" />`;
    }
  }

  return deco;
}

async function generateBadge(name, profileUrl, outputPath) {
  const qrDataUrl = await generateQRCode(profileUrl);
  const qrBase64 = qrDataUrl.split(',')[1];

  const nameUpper = name.toUpperCase();

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${SIZE}" height="${SIZE}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10"/>
      <feOffset dx="0" dy="5" result="offsetblur"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.5"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="${SIZE}" height="${SIZE}" fill="#f0f0f0" />

  <circle cx="${CENTER}" cy="${CENTER}" r="560" fill="black" filter="url(#shadow)" />

  <circle cx="${CENTER}" cy="${CENTER}" r="540" fill="black" stroke="white" stroke-width="8" />

  ${createBinaryRing(510, 11)}

  <circle cx="${CENTER}" cy="${CENTER}" r="480" fill="none" stroke="white" stroke-width="3" />

  ${createCircularText('AI LEADER', 450, -Math.PI * 0.72, -Math.PI * 0.28, 72, '900')}

  <circle cx="${CENTER}" cy="${CENTER}" r="400" fill="none" stroke="white" stroke-width="2" stroke-dasharray="10 10" opacity="0.5" />

  ${createCircularText(nameUpper, 370, -Math.PI * 0.85, -Math.PI * 0.15, 36, 'bold')}

  <circle cx="${CENTER}" cy="${CENTER}" r="340" fill="none" stroke="white" stroke-width="2" />

  ${createCircuitPattern(240, 330, 48)}

  ${createTechDecorations(330, 360)}

  ${createBinaryRing(360, 10)}

  <circle cx="${CENTER}" cy="${CENTER}" r="235" fill="white" stroke="black" stroke-width="6" />

  <image x="${CENTER - 200}" y="${CENTER - 200}" width="400" height="400" xlink:href="${qrDataUrl}" />

  <circle cx="${CENTER}" cy="${CENTER}" r="540" fill="none" stroke="black" stroke-width="3" opacity="0.2" />
</svg>`;

  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  const img = await loadImage('data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'));
  ctx.drawImage(img, 0, 0, SIZE, SIZE);

  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const { Image } = require('canvas');
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

async function processCsv(csvPath) {
  const csvContent = await fs.readFile(csvPath, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  });

  const outputDir = path.join(__dirname, 'output');
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`Processing ${records.length} badges...`);

  for (const record of records) {
    const { name, url } = record;

    if (!name || !url) {
      console.warn(`Skipping record with missing data:`, record);
      continue;
    }

    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const outputPath = path.join(outputDir, `${safeName}_badge.png`);

    console.log(`Generating badge for ${name}...`);
    await generateBadge(name, url, outputPath);
    console.log(`  → ${outputPath}`);
  }

  console.log(`\nDone! Generated ${records.length} badges in ${outputDir}`);
}

const csvPath = process.argv[2];

if (!csvPath) {
  console.error('Usage: node generate-badges.js <path-to-csv>');
  console.error('\nCSV format:');
  console.error('name,url');
  console.error('John Doe,https://example.com/john-doe');
  console.error('Jane Smith,https://example.com/jane-smith');
  process.exit(1);
}

processCsv(csvPath).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
