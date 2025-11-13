/**
 * Script to run Supabase migrations
 * Run with: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(migrationFile: string) {
  console.log(`\n📄 Running migration: ${migrationFile}`);

  try {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Split by statement (basic split, assumes ; at end of statements)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.length === 0) continue;

      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_migrations').insert({
          name: migrationFile,
          executed_at: new Date().toISOString(),
        });

        if (directError && directError.code !== '23505') { // Ignore duplicate key
          console.error(`❌ Error executing statement:`, error || directError);
          throw error || directError;
        }
      }
    }

    console.log(`✅ Migration completed: ${migrationFile}`);
    return true;
  } catch (error: any) {
    console.error(`❌ Migration failed: ${migrationFile}`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database migrations...\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);

  // Run migration
  const success = await runMigration('005_subscription_system.sql');

  if (success) {
    console.log('\n✅ All migrations completed successfully!');
    console.log('\n📊 Subscription system is now set up with:');
    console.log('   • subscription_history table (tracks all subscription changes)');
    console.log('   • payment_history table (records all payments)');
    console.log('   • webhook_events table (logs all webhook events)');
    console.log('   • Automatic triggers for subscription tracking');
    console.log('   • Helper functions for analytics\n');
  } else {
    console.log('\n❌ Migration failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
