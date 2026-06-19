const { createCanvas } = require('canvas');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
const path = require('path');

const SIZE = 1200;
const CENTER = SIZE / 2;
const OUTER_RADIUS = SIZE / 2 - 40;
const INNER_RADIUS = OUTER_RADIUS - 80;
const QR_SIZE = 400;

async function generateQRCode(url) {
  return await QRCode.toDataURL(url, {
    width: QR_SIZE,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

function drawCircularText(ctx, text, radius, startAngle, fontSize) {
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const angleStep = (Math.PI * 1.5) / text.length;

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + (i * angleStep);
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

function drawTechPattern(ctx, radius, spacing) {
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;

  const numElements = 24;
  const angleStep = (Math.PI * 2) / numElements;

  for (let i = 0; i < numElements; i++) {
    const angle = i * angleStep;
    const x = CENTER + Math.cos(angle) * radius;
    const y = CENTER + Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    if (i % 4 === 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (i % 2 === 0) {
      ctx.fillRect(-3, -8, 6, 16);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 10);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  const circuitRadius = radius - 20;
  const numCircuits = 16;
  const circuitStep = (Math.PI * 2) / numCircuits;

  for (let i = 0; i < numCircuits; i++) {
    const angle = i * circuitStep;
    const x1 = CENTER + Math.cos(angle) * circuitRadius;
    const y1 = CENTER + Math.sin(angle) * circuitRadius;
    const x2 = CENTER + Math.cos(angle + circuitStep) * circuitRadius;
    const y2 = CENTER + Math.sin(angle + circuitStep) * circuitRadius;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

async function generateBadge(name, profileUrl, outputPath) {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, SIZE, SIZE);

  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, OUTER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, INNER_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#000000';
  drawCircularText(ctx, 'AI LEADER', OUTER_RADIUS - 40, -Math.PI * 0.75, 80);

  const nameUpper = name.toUpperCase();
  drawCircularText(ctx, nameUpper, INNER_RADIUS + 55, -Math.PI * 0.85, 45);

  drawTechPattern(ctx, INNER_RADIUS - 60, 15);

  const qrDataUrl = await generateQRCode(profileUrl);
  const qrImage = await loadImage(qrDataUrl);

  const qrX = CENTER - QR_SIZE / 2;
  const qrY = CENTER - QR_SIZE / 2;
  ctx.drawImage(qrImage, qrX, qrY, QR_SIZE, QR_SIZE);

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, OUTER_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(CENTER, CENTER, INNER_RADIUS, 0, Math.PI * 2);
  ctx.stroke();

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
