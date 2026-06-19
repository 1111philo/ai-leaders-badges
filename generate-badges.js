const { createCanvas, loadImage: canvasLoadImage } = require('canvas');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const { parse } = require('csv-parse/sync');
const path = require('path');

async function generateQRCode(url) {
  return await QRCode.toDataURL(url, {
    width: 500,
    margin: 0,
    errorCorrectionLevel: 'M',
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });
}

function createCircularText(ctx, text, centerX, centerY, radius, startAngle, endAngle, fontSize, fontWeight = 'bold', withBackground = false) {
  ctx.font = `${fontWeight} ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalAngle = endAngle - startAngle;
  const angleStep = totalAngle / (text.length - 1);

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle + (i * angleStep);
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);

    if (withBackground) {
      const metrics = ctx.measureText(text[i]);
      const padding = 4;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(
        -metrics.width / 2 - padding,
        -fontSize / 2 - padding,
        metrics.width + padding * 2,
        fontSize + padding * 2
      );
    }

    ctx.fillStyle = '#000000';
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}

async function generateBadge(name, profileUrl, outputPath) {
  const mockupPath = path.join(__dirname, 'mockup.png');
  const mockupImg = await canvasLoadImage(mockupPath);

  const width = mockupImg.width;
  const height = mockupImg.height;
  const centerX = width / 2;
  const centerY = height / 2;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(mockupImg, 0, 0, width, height);

  const qrDataUrl = await generateQRCode(profileUrl);
  const qrImg = await canvasLoadImage(qrDataUrl);
  const qrSize = Math.floor(width * 0.35);
  const qrX = centerX - qrSize / 2;
  const qrY = centerY - qrSize / 2;
  ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

  const nameUpper = name.toUpperCase();
  const nameRadius = width * 0.255;
  const nameFontSize = Math.floor(width * 0.032);
  const nameLength = nameUpper.length;
  const totalAngle = Math.PI * 0.55;
  const startAngle = -Math.PI / 2 - totalAngle / 2;
  const endAngle = -Math.PI / 2 + totalAngle / 2;

  createCircularText(
    ctx,
    nameUpper,
    centerX,
    centerY,
    nameRadius,
    startAngle,
    endAngle,
    nameFontSize,
    'bold',
    true
  );

  const buffer = canvas.toBuffer('image/png');
  await fs.writeFile(outputPath, buffer);
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
