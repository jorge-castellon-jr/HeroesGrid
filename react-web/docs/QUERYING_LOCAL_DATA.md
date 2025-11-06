# Querying Local Data with WatermelonDB

## Overview
This guide shows how to query the local WatermelonDB database in the Power Rangers: Heroes of the Grid companion app.

---

## Basic Setup

### Import Database
```javascript
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
```

### Initialize Database
```javascript
import { initializeDatabase } from '../database/seed';

// Call once when component mounts
await initializeDatabase();
```

---

## Basic Queries

### Get All Records
```javascript
const rangersCollection = database.get('rangers');
const allRangers = await rangersCollection.query().fetch();
```

### Get Single Record by ID
```javascript
const rangersCollection = database.get('rangers');
const ranger = await rangersCollection.find('ranger-123');
```

---

## Filtering

### Filter by Published Status
```javascript
const rangersCollection = database.get('rangers');
const publishedRangers = await rangersCollection
  .query(Q.where('published', true))
  .fetch();
```

### Filter by Single Value
```javascript
// Get rangers by team
const rangers = await database.get('rangers')
  .query(Q.where('team_id', 'team-mmpr'))
  .fetch();

// Get rangers by color
const redRangers = await database.get('rangers')
  .query(Q.where('color', 'Red'))
  .fetch();
```

### Filter by Multiple Values (OR)
```javascript
// Get enemies of specific types
const enemies = await database.get('enemies')
  .query(Q.where('monster_type', Q.oneOf(['monster', 'boss'])))
  .fetch();
```

### Multiple Filters (AND)
```javascript
// Get published red rangers from a specific team
const rangers = await database.get('rangers')
  .query(
    Q.where('team_id', 'team-mmpr'),
    Q.where('color', 'Red'),
    Q.where('published', true)
  )
  .fetch();
```

---

## Relationships

### Fetch Related Records
```javascript
// Get ranger and its team
const ranger = await database.get('rangers').find('ranger-123');
const team = await ranger.team.fetch();

console.log(team.name); // "Mighty Morphin"
```

### Query with Multiple Relationships
```javascript
// Get ranger with team and expansion
const ranger = await database.get('rangers').find('ranger-123');
const team = await ranger.team.fetch();
const expansion = await ranger.expansion.fetch();

console.log({
  rangerName: ranger.name,
  teamName: team.name,
  expansionName: expansion.name
});
```

---

## Sorting

### Sort by Field
```javascript
// Sort seasons by order
const seasons = await database.get('seasons')
  .query(Q.sortBy('order', Q.asc))
  .fetch();

// Sort rangers by name (descending)
const rangers = await database.get('rangers')
  .query(Q.sortBy('name', Q.desc))
  .fetch();
```

---

## JSON Fields

### Access @json Decorated Fields
JSON fields are automatically parsed by WatermelonDB:

```javascript
const ranger = await database.get('rangers').find('ranger-123');

// Deck is already a parsed array
ranger.deck.forEach(card => {
  console.log(card.card_name, card.count);
});

// Tags is already a parsed array
ranger.tags.forEach(tag => {
  console.log(tag.name);
});
```

---

## Common Query Patterns

### All Rangers Page
```javascript
const rangersCollection = database.get('rangers');
const rangers = await rangersCollection
  .query(Q.where('published', true))
  .fetch();

// Get teams for filter dropdown
const teamsCollection = database.get('teams');
const teams = await teamsCollection
  .query(Q.where('published', true))
  .fetch();
```

### Randomizer Page
```javascript
// Get all published rangers
const rangers = await database.get('rangers')
  .query(Q.where('published', true))
  .fetch();

// Get enemies by type
const footsoldiers = await database.get('enemies')
  .query(
    Q.where('monster_type', 'footsoldier'),
    Q.where('published', true)
  )
  .fetch();

const monsters = await database.get('enemies')
  .query(
    Q.where('monster_type', 'monster'),
    Q.where('published', true)
  )
  .fetch();

const bosses = await database.get('enemies')
  .query(
    Q.where('monster_type', 'boss'),
    Q.where('published', true)
  )
  .fetch();

// Get expansions for filter
const expansions = await database.get('expansions')
  .query(Q.where('published', true))
  .fetch();
```

### Team Detail Page
```javascript
// Get team by slug
const teams = await database.get('teams')
  .query(
    Q.where('slug', teamSlug),
    Q.where('published', true)
  )
  .fetch();

const team = teams[0];

// Get rangers for this team
const rangers = await database.get('rangers')
  .query(
    Q.where('team_id', team.id),
    Q.where('published', true)
  )
  .fetch();
```

### Ranger Detail Page
```javascript
// Get ranger by slug
const rangers = await database.get('rangers')
  .query(
    Q.where('slug', rangerSlug),
    Q.where('published', true)
  )
  .fetch();

const ranger = rangers[0];

// Get team
const team = await ranger.team.fetch();

// Get full card details for deck
const rangerCardsCollection = database.get('ranger_cards');
const deckWithDetails = [];

for (const deckCard of ranger.deck) {
  const fullCards = await rangerCardsCollection
    .query(Q.where('name', deckCard.card_name))
    .fetch();
  
  if (fullCards.length > 0) {
    const fullCard = fullCards[0];
    deckWithDetails.push({
      card_id: deckCard.card_id,
      order: deckCard.order,
      name: deckCard.override_name || deckCard.card_name,
      cardInfo: {
        quantity: deckCard.count,
        amount: fullCard.energyCost,
        dice: fullCard.attackDice,
        static: fullCard.attackHit,
        shields: fullCard.shields
      },
      effects: {
        type: fullCard.type?.toLowerCase(),
        effect: fullCard.description
      }
    });
  }
}
```

---

## Admin Panel Queries

### Get All Records (Including Unpublished)
```javascript
// Don't filter by published for admin
const collection = database.get('rangers');
const allRecords = await collection.query().fetch();
```

### Search Records
```javascript
const searchTerm = 'jason';
const collection = database.get('rangers');
const allRecords = await collection.query().fetch();

// Filter in JavaScript since WatermelonDB doesn't support LIKE
const filtered = allRecords.filter(item => 
  item.name?.toLowerCase().includes(searchTerm) ||
  item.slug?.toLowerCase().includes(searchTerm) ||
  item.title?.toLowerCase().includes(searchTerm)
);
```

### Update Published Status
```javascript
const collection = database.get('rangers');
await database.write(async () => {
  const record = await collection.find(itemId);
  await record.update((r) => {
    r.published = !currentValue;
  });
});
```

---

## Performance Tips

1. **Always filter by `published: true`** on frontend pages to reduce result set
2. **Use indexed fields** for filtering (slug, team_id, expansion_id, color, type, published)
3. **Batch queries** when possible instead of querying in loops
4. **Initialize database once** at app startup
5. **Use `Q.where()`** instead of filtering in JavaScript for better performance

---

## Writing Data

### Create New Record
```javascript
await database.write(async () => {
  const collection = database.get('rangers');
  await collection.create((ranger) => {
    ranger._raw.id = 'ranger-new';
    ranger.name = 'New Ranger';
    ranger.slug = 'new-ranger';
    ranger.published = false;
    // ... other fields
  });
});
```

### Update Record
```javascript
await database.write(async () => {
  const ranger = await database.get('rangers').find('ranger-123');
  await ranger.update((r) => {
    r.name = 'Updated Name';
    r.published = true;
  });
});
```

### Delete Record
```javascript
await database.write(async () => {
  const ranger = await database.get('rangers').find('ranger-123');
  await ranger.destroyPermanently();
});
```

---

## Reset Database

### Clear All Data and Re-seed
```javascript
// Via UI button in FooterNav
await database.write(async () => {
  await database.unsafeResetDatabase();
});
window.location.reload();
```

---

## Error Handling

```javascript
try {
  await initializeDatabase();
  const rangers = await database.get('rangers')
    .query(Q.where('published', true))
    .fetch();
  setData(rangers);
} catch (error) {
  console.error('Database error:', error);
}
```

---

## React Integration

### With useState and useEffect
```javascript
import { useState, useEffect } from 'react';
import { database } from '../database';
import { initializeDatabase } from '../database/seed';
import { Q } from '@nozbe/watermelondb';

function AllRangers() {
  const [rangers, setRangers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await initializeDatabase();
        const rangersCollection = database.get('rangers');
        const data = await rangersCollection
          .query(Q.where('published', true))
          .fetch();
        setRangers(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      {rangers.map(ranger => (
        <div key={ranger.id}>{ranger.name}</div>
      ))}
    </div>
  );
}
```

---

## Reference

### Collections
- `seasons`
- `expansions`
- `teams`
- `rangers`
- `enemies`
- `zords`
- `megazords`
- `ranger_cards`
- `arsenal_cards`
- `tags`
- `locations`
- `rulebooks`

### Q Methods
- `Q.where(field, value)` - Exact match
- `Q.where(field, Q.oneOf([values]))` - Match any value
- `Q.sortBy(field, Q.asc | Q.desc)` - Sort results
- `Q.take(n)` - Limit results
- `Q.skip(n)` - Offset results

See [WatermelonDB documentation](https://watermelondb.dev/docs) for more advanced queries.
