import { createClient } from '@libsql/client';
import fs from 'fs';

const DATABASE_URI = process.env.TURSO_DATABASE_URL;
const DATABASE_TOKEN = process.env.TURSO_AUTH_TOKEN;

async function inspectDatabase() {
  console.log('🔍 Connecting to Turso database...\n');
  
  const client = createClient({
    url: DATABASE_URI,
    authToken: DATABASE_TOKEN
  });

  try {
    // Get all tables
    console.log('📊 Fetching tables...\n');
    const tablesResult = await client.execute({
      sql: "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name",
      args: []
    });

    console.log(`Found ${tablesResult.rows.length} tables:\n`);
    
    const tables = tablesResult.rows.map(row => row.name);
    const schemaInfo = {};

    // Get schema for each table
    for (const tableName of tables) {
      console.log(`\n📋 Table: ${tableName}`);
      console.log('─'.repeat(50));
      
      // Get table info
      const tableInfo = await client.execute({
        sql: `PRAGMA table_info(${tableName})`,
        args: []
      });

      console.log('Columns:');
      tableInfo.rows.forEach(col => {
        console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.dflt_value ? ` DEFAULT ${col.dflt_value}` : ''}`);
      });

      // Get row count
      const countResult = await client.execute({
        sql: `SELECT COUNT(*) as count FROM ${tableName}`,
        args: []
      });
      console.log(`\nRows: ${countResult.rows[0].count}`);

      // Sample data (first row)
      const sampleResult = await client.execute({
        sql: `SELECT * FROM ${tableName} LIMIT 1`,
        args: []
      });

      if (sampleResult.rows.length > 0) {
        console.log('\nSample row:');
        console.log(JSON.stringify(sampleResult.rows[0], null, 2));
      }

      schemaInfo[tableName] = {
        columns: tableInfo.rows.map(col => ({
          name: col.name,
          type: col.type,
          notNull: col.notnull,
          defaultValue: col.dflt_value
        })),
        rowCount: countResult.rows[0].count,
        sample: sampleResult.rows[0] || null
      };
    }

    // Save schema info to file
    console.log('\n\n💾 Saving schema info to data/turso-schema.json...');
    fs.writeFileSync(
      './data/turso-schema.json',
      JSON.stringify(schemaInfo, null, 2)
    );

    console.log('✅ Schema inspection complete!');
    console.log('\nKey tables to export:');
    console.log('  - rangers');
    console.log('  - teams');
    console.log('  - expansions');
    console.log('  - enemies');
    console.log('  - zords');
    console.log('  - megazords');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

inspectDatabase();
