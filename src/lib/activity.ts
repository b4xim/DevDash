import { supabase } from './supabase';

export async function logActivity() {
  const today = new Date().toISOString().split('T')[0];

  const { data: existingLog } = await supabase
    .from('activity_log')
    .select('id, count')
    .eq('log_date', today)
    .single();

  if (existingLog) {
    await supabase
      .from('activity_log')
      .update({ count: existingLog.count + 1 })
      .eq('id', existingLog.id);
  } else {
    await supabase
      .from('activity_log')
      .insert({ log_date: today, count: 1 });
  }
}
