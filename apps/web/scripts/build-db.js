import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/rulebooks');
const dbPath = path.join(__dirname, '../public/data/content.db');

// Create database
const db = new Database(dbPath);

// Create rulebooks table
db.exec(`
  CREATE TABLE IF NOT EXISTS rulebooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    content TEXT NOT NULL
  )
`);

// Function to extract frontmatter and content
function parseMD(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extract frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    return { name: '', content: content };
  }
  
  const frontmatter = frontmatterMatch[1];
  const mdContent = frontmatterMatch[2];
  
  // Parse frontmatter
  const nameMatch = frontmatter.match(/name:\s*["'](.+?)["']/);
  const name = nameMatch ? nameMatch[1] : '';
  
  return { name, content: mdContent.trim() };
}

// Insert rulebooks
const insert = db.prepare('INSERT OR REPLACE INTO rulebooks (slug, name, content) VALUES (?, ?, ?)');

const rulebookFiles = fs.readdirSync(contentDir).filter(file => file.endsWith('.md'));

rulebookFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  const slug = file.replace('.md', '');
  const { name, content } = parseMD(filePath);
  
  insert.run(slug, name, content);
  console.log(`✅ Added rulebook: ${name} (${slug})`);
});

db.close();

console.log(`\n🎉 Database created successfully at: ${dbPath}`);
