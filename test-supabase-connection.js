import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? 'https://jmpmucdoqkcpetdfnxrj.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImptcG11Y2RvcWtjcGV0ZGZueHJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MjAxNTcsImV4cCI6MjA3NTQ5NjE1N30.9DkLxkZNXz7G1zxK_ZiYWhpDzUIyI6wBcTfjCDA41Gg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('=== Supabase Connectivity Test ===');
  console.log('Using URL:', SUPABASE_URL);

  try {
    console.log('\n-- Testing select from universes (limit 1) --');
    const { data: uniData, error: uniError } = await supabase
      .from('universes')
      .select('*')
      .limit(1);

    if (uniError) {
      console.error('Universes select error:', uniError);
    } else {
      console.log('Universes select success:', uniData);
    }

    console.log('\n-- Testing select from scores (limit 1) --');
    const { data: scoreData, error: scoreError } = await supabase
      .from('scores')
      .select('*')
      .limit(1);

    if (scoreError) {
      console.error('Scores select error:', scoreError);
    } else {
      console.log('Scores select success:', scoreData);
    }

    console.log('\n-- Testing count from scores (head:true) --');
    const { count, error: countError } = await supabase
      .from('scores')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Scores count error:', countError);
    } else {
      console.log('Scores count success:', count);
    }
  } catch (err) {
    console.error('Unexpected error during connectivity test:', err);
  }

  console.log('\n=== Test complete ===');
}

run();