// Test database integrity
console.log('Testing database integrity...\n');

// This would run in browser context since WatermelonDB is browser-based
console.log('Run this in browser console:');
console.log(`
import database from './src/database/index.js';

async function testDatabase() {
  const counts = {};
  
  const collections = [
    'seasons', 'expansions', 'teams', 'rangers', 
    'enemies', 'zords', 'megazords', 'ranger_cards',
    'arsenal_cards', 'tags', 'locations', 'rulebooks'
  ];
  
  for (const collectionName of collections) {
    const collection = database.get(collectionName);
    const count = await collection.query().fetchCount();
    counts[collectionName] = count;
  }
  
  console.table(counts);
  
  // Test a relationship
  const rangers = await database.get('rangers').query().fetch();
  const firstRanger = rangers[0];
  
  if (firstRanger) {
    const team = await firstRanger.team.fetch();
    const expansion = await firstRanger.expansion.fetch();
    
    console.log('\\n✅ Sample Ranger:', {
      name: firstRanger.name,
      team: team.name,
      expansion: expansion.name,
      deckCount: firstRanger.deck.length
    });
  }
  
  console.log('\\n✅ Database integrity test passed!');
}

testDatabase();
`);
