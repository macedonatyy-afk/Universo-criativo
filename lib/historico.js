export const HISTORY_PAGE_SIZE = 20;

export async function saveAnalysis(supabase, { campos, config, resposta }) {
  // user_id is supplied by auth.uid() in the database, never by form data.
  const entrada = config.campos.map(campo => `${campo.rotulo}:\n${campos[campo.id].trim()}`).join('\n\n');
  try {
    const { error } = await supabase.from('resposta').insert({ entrada, resposta });
    return !error;
  } catch {
    return false;
  }
}

export async function loadHistory(supabase, userId, page = 1) {
  const from = (page - 1) * HISTORY_PAGE_SIZE;
  // RLS is the database protection; this server-side filter also scopes the query.
  return supabase.from('resposta')
    .select('id, entrada, resposta, criado_em', { count: 'exact' })
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .order('id', { ascending: false })
    .range(from, from + HISTORY_PAGE_SIZE - 1);
}
