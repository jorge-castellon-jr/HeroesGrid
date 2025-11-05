import database from './index';

// Singleton to track initialization
let initializationPromise = null;

// Function to parse markdown frontmatter
function parseMD(content) {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
	
	if (!frontmatterMatch) {
		return { name: '', content: content };
	}
	
	const frontmatter = frontmatterMatch[1];
	const mdContent = frontmatterMatch[2];
	
	const nameMatch = frontmatter.match(/name:\s*["'](.+?)["']/);
	const name = nameMatch ? nameMatch[1] : '';
	
	return { name, content: mdContent.trim() };
}

// Seed rulebooks from markdown files
export async function seedRulebooks() {
	const rulebooksCollection = database.get('rulebooks');
	
	// Check if already seeded
	const existingCount = await rulebooksCollection.query().fetchCount();
	if (existingCount > 0) {
		console.log('Rulebooks already seeded');
		return;
	}

	// Fetch markdown files
	const rulebooks = [
		{
			slug: 'official-rulebook',
			file: '/content/rulebooks/official-rulebook.md',
		},
		{
			slug: 'faq',
			file: '/content/rulebooks/faq.md',
		},
	];

	await database.write(async () => {
		for (const book of rulebooks) {
			try {
				const response = await fetch(book.file);
				const text = await response.text();
				const { name, content } = parseMD(text);

				await rulebooksCollection.create((rulebook) => {
					rulebook._raw.slug = book.slug;
					rulebook._raw.name = name || book.slug;
					rulebook._raw.content = content;
				});

				console.log(`✅ Seeded rulebook: ${name}`);
			} catch (error) {
				console.error(`Error seeding ${book.slug}:`, error);
			}
		}
	});
}

// Initialize database with seed data
export async function initializeDatabase() {
	// Return existing promise if already initializing
	if (initializationPromise) {
		return initializationPromise;
	}

	// Create and store initialization promise
	initializationPromise = (async () => {
		try {
			await seedRulebooks();
			console.log('✅ Database initialized');
		} catch (error) {
			console.error('Error initializing database:', error);
			throw error;
		}
	})();

	return initializationPromise;
}

export default initializeDatabase;
