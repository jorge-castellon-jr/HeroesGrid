import { createClient } from '@libsql/client';
import fs from 'fs';
import path from 'path';

const DATABASE_URI = process.env.TURSO_DATABASE_URL;
const DATABASE_TOKEN = process.env.TURSO_AUTH_TOKEN;

const OUTPUT_DIR = './data/export';

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper function to get team position text
function getTeamPosition(type, order) {
  const positions = {
    core: ['1st Ranger', '2nd Ranger', '3rd Ranger', '4th Ranger', '5th Ranger'],
    sixth: ['Sixth Ranger'],
    extra: ['Extra Ranger'],
    ally: ['Ally']
  };
  
  if (type === 'core' && order !== undefined && order !== null) {
    return positions.core[order - 1] || `${order}th Ranger`;
  }
  
  return positions[type]?.[0] || type;
}

async function exportData() {
  console.log('🚀 Starting Turso data export...\n');
  
  const client = createClient({
    url: DATABASE_URI,
    authToken: DATABASE_TOKEN
  });

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  try {
    // ===== EXPORT SEASONS =====
    console.log('📦 Exporting Seasons...');
    const seasonsResult = await client.execute({
      sql: `SELECT * FROM seasons WHERE source = 'official' ORDER BY "order"`,
      args: []
    });
    
    const seasons = seasonsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      order: row.order,
      slug: generateSlug(row.name)
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'seasons.json'),
      JSON.stringify(seasons, null, 2)
    );
    console.log(`✅ Exported ${seasons.length} seasons\n`);

    // ===== EXPORT EXPANSIONS =====
    console.log('📦 Exporting Expansions...');
    const expansionsResult = await client.execute({
      sql: `SELECT * FROM expansions WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const expansions = expansionsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: generateSlug(row.name)
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'expansions.json'),
      JSON.stringify(expansions, null, 2)
    );
    console.log(`✅ Exported ${expansions.length} expansions\n`);

    // ===== EXPORT TEAMS =====
    console.log('📦 Exporting Teams...');
    const teamsResult = await client.execute({
      sql: `
        SELECT t.*, s."order" as season_order 
        FROM teams t
        LEFT JOIN seasons s ON t.season_id = s.id
        WHERE t.source = 'official' 
        ORDER BY s."order", t.name
      `,
      args: []
    });
    
    const teams = teamsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: generateSlug(row.name),
      season_id: row.season_id,
      generation: row.season_order || null
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'teams.json'),
      JSON.stringify(teams, null, 2)
    );
    console.log(`✅ Exported ${teams.length} teams\n`);

    // ===== EXPORT RANGERS =====
    console.log('📦 Exporting Rangers (with deck data)...');
    const rangersResult = await client.execute({
      sql: `SELECT * FROM rangers WHERE source = 'official' ORDER BY team_id, id`,
      args: []
    });
    
    const rangers = [];
    for (const row of rangersResult.rows) {
      // Get deck for this ranger
      const deckResult = await client.execute({
        sql: `
          SELECT rd.*, rc.name as card_name, rc.type as card_type
          FROM rangers_deck rd
          LEFT JOIN ranger_cards rc ON rd.card_id = rc.id
          WHERE rd._parent_id = ?
          ORDER BY rd._order
        `,
        args: [row.id]
      });

      // Get tags for this ranger
      const tagsResult = await client.execute({
        sql: `
          SELECT t.id, t.name
          FROM rangers_rels rr
          JOIN tags t ON rr.tags_id = t.id
          WHERE rr.parent_id = ? AND rr.path = 'tags'
          ORDER BY rr."order"
        `,
        args: [row.id]
      });

      // Generate unique slug: name + ability for duplicates
      const baseSlug = generateSlug(row.name);
      const abilitySlug = row.ability_name ? generateSlug(row.ability_name) : '';
      const uniqueSlug = `${baseSlug}-${abilitySlug}`;

      rangers.push({
        id: row.id,
        name: row.name,
        slug: uniqueSlug,
        title: row.title,
        ability_name: row.ability_name,
        ability: row.ability,
        is_once_per_battle: row.is_once_per_battle === 1,
        color: row.color,
        type: row.type,
        team_position: getTeamPosition(row.type, null), // We don't have order field
        card_title: row.card_title,
        team_id: row.team_id,
        expansion_id: row.expansion_id,
        deck: deckResult.rows.map(d => ({
          card_id: d.card_id,
          card_name: d.card_name,
          card_type: d.card_type,
          count: d.count,
          override_name: d.override_name,
          order: d._order
        })),
        tags: tagsResult.rows.map(t => ({ id: t.id, name: t.name }))
      });
    }
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'rangers.json'),
      JSON.stringify(rangers, null, 2)
    );
    console.log(`✅ Exported ${rangers.length} rangers\n`);

    // ===== EXPORT ENEMIES =====
    console.log('📦 Exporting Enemies (with deck data)...');
    const enemiesResult = await client.execute({
      sql: `SELECT * FROM enemies WHERE source = 'official' ORDER BY monster_type, name`,
      args: []
    });
    
    const enemies = [];
    for (const row of enemiesResult.rows) {
      // Get deck for this enemy
      const deckResult = await client.execute({
        sql: `
          SELECT * FROM enemies_deck
          WHERE _parent_id = ?
          ORDER BY _order
        `,
        args: [row.id]
      });

      // Get locations for foot soldiers
      const locationsResult = await client.execute({
        sql: `
          SELECT l.id, l.name
          FROM enemies_rels er
          JOIN locations l ON er.locations_id = l.id
          WHERE er.parent_id = ? AND er.path = 'locations'
          ORDER BY er."order"
        `,
        args: [row.id]
      });

      enemies.push({
        id: row.id,
        name: row.name,
        slug: generateSlug(row.name),
        monster_type: row.monster_type,
        nemesis_effect: row.nemesis_effect,
        season_id: row.season_id,
        expansion_id: row.expansion_id,
        deck: deckResult.rows.map(d => ({
          name: d.name,
          health: d.health,
          description: d.description,
          count: d.count,
          order: d._order
        })),
        locations: locationsResult.rows.map(l => ({ id: l.id, name: l.name }))
      });
    }
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'enemies.json'),
      JSON.stringify(enemies, null, 2)
    );
    console.log(`✅ Exported ${enemies.length} enemies\n`);

    // ===== EXPORT ZORDS =====
    console.log('📦 Exporting Zords...');
    const zordsResult = await client.execute({
      sql: `SELECT * FROM zords WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const zords = [];
    for (const row of zordsResult.rows) {
      // Get compatible rangers
      const rangersResult = await client.execute({
        sql: `
          SELECT rangers_id FROM zords_rels
          WHERE parent_id = ? AND path = 'compatibleRangers' AND rangers_id IS NOT NULL
          ORDER BY "order"
        `,
        args: [row.id]
      });

      // Get compatible teams
      const teamsResult = await client.execute({
        sql: `
          SELECT teams_id FROM zords_rels
          WHERE parent_id = ? AND path = 'team' AND teams_id IS NOT NULL
          ORDER BY "order"
        `,
        args: [row.id]
      });

      zords.push({
        id: row.id,
        name: row.name,
        slug: generateSlug(row.name),
        ability: row.ability,
        subcategory: row.subcategory,
        expansion_id: row.expansion_id,
        compatible_ranger_ids: rangersResult.rows.map(r => r.rangers_id),
        compatible_team_ids: teamsResult.rows.map(t => t.teams_id)
      });
    }
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'zords.json'),
      JSON.stringify(zords, null, 2)
    );
    console.log(`✅ Exported ${zords.length} zords\n`);

    // ===== EXPORT MEGAZORDS =====
    console.log('📦 Exporting Megazords...');
    const megazordsResult = await client.execute({
      sql: `SELECT * FROM megazords WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const megazords = [];
    for (const row of megazordsResult.rows) {
      // Get compatible teams
      const teamsResult = await client.execute({
        sql: `
          SELECT teams_id FROM megazords_rels
          WHERE parent_id = ? AND path = 'team' AND teams_id IS NOT NULL
          ORDER BY "order"
        `,
        args: [row.id]
      });

      megazords.push({
        id: row.id,
        name: row.name,
        slug: generateSlug(row.name),
        ability: row.ability,
        expansion_id: row.expansion_id,
        compatible_team_ids: teamsResult.rows.map(t => t.teams_id)
      });
    }
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'megazords.json'),
      JSON.stringify(megazords, null, 2)
    );
    console.log(`✅ Exported ${megazords.length} megazords\n`);

    // ===== EXPORT RANGER CARDS =====
    console.log('📦 Exporting Ranger Cards...');
    const rangerCardsResult = await client.execute({
      sql: `SELECT * FROM ranger_cards WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const rangerCards = rangerCardsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      energy_cost: row.energy_cost,
      type: row.type,
      description: row.description,
      shields: row.shields,
      attack_dice: row.attack_dice,
      attack_hit: row.attack_hit,
      expansion_id: row.expansion_id
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'ranger_cards.json'),
      JSON.stringify(rangerCards, null, 2)
    );
    console.log(`✅ Exported ${rangerCards.length} ranger cards\n`);

    // ===== EXPORT ARSENAL CARDS =====
    console.log('📦 Exporting Arsenal Cards...');
    const arsenalCardsResult = await client.execute({
      sql: `SELECT * FROM arsenal_cards WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const arsenalCards = arsenalCardsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: generateSlug(row.name),
      cost: row.cost,
      type: row.type,
      description: row.description,
      uses: row.uses,
      expansion_id: row.expansion_id
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'arsenal_cards.json'),
      JSON.stringify(arsenalCards, null, 2)
    );
    console.log(`✅ Exported ${arsenalCards.length} arsenal cards\n`);

    // ===== EXPORT TAGS =====
    console.log('📦 Exporting Tags...');
    const tagsResult = await client.execute({
      sql: `SELECT * FROM tags ORDER BY name`,
      args: []
    });
    
    const tags = tagsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: generateSlug(row.name)
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'tags.json'),
      JSON.stringify(tags, null, 2)
    );
    console.log(`✅ Exported ${tags.length} tags\n`);

    // ===== EXPORT LOCATIONS =====
    console.log('📦 Exporting Locations...');
    const locationsResult = await client.execute({
      sql: `SELECT * FROM locations WHERE source = 'official' ORDER BY name`,
      args: []
    });
    
    const locations = locationsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: generateSlug(row.name),
      effect: row.effect,
      figure_limit: row.figure_limit,
      expansion_id: row.expansion_id
    }));
    
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'locations.json'),
      JSON.stringify(locations, null, 2)
    );
    console.log(`✅ Exported ${locations.length} locations\n`);

    console.log('🎉 Export complete!');
    console.log(`\nAll data exported to: ${OUTPUT_DIR}/`);
    console.log('\nExported files:');
    console.log('  - seasons.json');
    console.log('  - expansions.json');
    console.log('  - teams.json');
    console.log('  - rangers.json (with deck data)');
    console.log('  - enemies.json (with deck data)');
    console.log('  - zords.json');
    console.log('  - megazords.json');
    console.log('  - ranger_cards.json');
    console.log('  - arsenal_cards.json');
    console.log('  - tags.json');
    console.log('  - locations.json');

  } catch (error) {
    console.error('❌ Export error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

exportData();
