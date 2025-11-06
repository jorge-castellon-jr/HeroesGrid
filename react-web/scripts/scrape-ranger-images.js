import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read HTML file
const htmlFile = process.argv[2] || path.join(__dirname, '../data/rangers-page.html');

if (!fs.existsSync(htmlFile)) {
	console.error('HTML file not found:', htmlFile);
	console.error('Usage: node scrape-ranger-images.js <path-to-html-file>');
	process.exit(1);
}

console.log(`Reading from: ${htmlFile}`);
const html = fs.readFileSync(htmlFile, 'utf-8');

// Extract ranger cards with name, title, ability, and image
const rangerCardRegex = /<a[\s\S]*?href="\/[^\/]+\/[^"]+"[\s\S]*?<img[\s\S]*?alt="([^"]+)"[\s\S]*?src="([^"]+)"[\s\S]*?<p class="items-center font-bold text-gray-900 uppercase text-md">\s*([^<]+)\s*<\/p>[\s\S]*?<p class="flex items-center text-sm text-gray-600">\s*([^<]+)\s*<\/p>[\s\S]*?<div class="mb-2 text-xl font-bold text-gray-900">\s*([^<]+)\s*<\/div>/g;

const rangerImages = [];
let match;

while ((match = rangerCardRegex.exec(html)) !== null) {
	const [, altText, imageUrl, name, title, ability] = match;
	
	// Only include Sanity CDN images
	if (imageUrl.includes('cdn.sanity.io')) {
		rangerImages.push({
			name: name.trim(),
			title: title.trim(),
			ability: ability.trim(),
			imageUrl: imageUrl.split('?')[0], // Remove query params
		});
	}
}

console.log(`Found ${rangerImages.length} ranger images`);

// Save to JSON
const outputPath = path.join(__dirname, '../data/export/ranger_images.json');
fs.writeFileSync(outputPath, JSON.stringify(rangerImages, null, 2));

console.log(`✅ Saved ranger images to ${outputPath}`);

// Create a mapping by name+ability for unique lookup
const imageMap = {};
rangerImages.forEach(ranger => {
	const key = `${ranger.name}|${ranger.ability}`;
	imageMap[key] = ranger.imageUrl;
});

const mapPath = path.join(__dirname, '../data/export/ranger_image_map.json');
fs.writeFileSync(mapPath, JSON.stringify(imageMap, null, 2));

console.log(`✅ Saved image map to ${mapPath}`);
