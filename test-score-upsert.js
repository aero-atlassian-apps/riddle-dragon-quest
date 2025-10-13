import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://jmpmucdoqkcpetdfnxrj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcG11Y2RvcWtjcGV0ZGZueHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjAxNTcsImV4cCI6MjA3NTQ5NjE1N30.9DkLxkZNXz7G1zxK_ZiYWhpDzUIyI6wBcTfjCDA41Gg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('=== Supabase Scores Upsert Test ===');
  try {
    const { data: uniData, error: uniError } = await supabase
      .from('universes')
      .select('id, name')
      .limit(1);

    if (uniError) throw uniError;
    if (!uniData || uniData.length === 0) throw new Error('No universes found to attach universe_id');

    const universeId = uniData[0].id;
    console.log('Using universeId:', universeId, '(', uniData[0].name, ')');

    const now = Date.now();
    const scoreData = {
      room_id: `test-room-${now}`,
      session_id: `test-session-${now}`,
      universe_id: universeId,
      room_name: 'Test Room From Script',
      total_score: 123
    };

    console.log('\n-- Upserting into scores --');
    const { data: upsertData, error: upsertError } = await supabase
      .from('scores')
      .upsert([scoreData], { onConflict: 'room_id' })
      .select();

    if (upsertError) {
      console.error('Upsert error:', upsertError);
    } else {
      console.log('Upsert success:', upsertData);
    }

    console.log('\n-- Verifying inserted row by room_id --');
    const { data: verifyData, error: verifyError } = await supabase
      .from('scores')
      .select('*')
      .eq('room_id', scoreData.room_id)
      .limit(1);

    if (verifyError) {
      console.error('Verify select error:', verifyError);
    } else {
      console.log('Verify select success:', verifyData);
    }
  } catch (err) {
    console.error('Unexpected error during scores upsert test:', err);
  }

  console.log('\n=== Test complete ===');
}

run();