// Called only after webhook authentication and payment validation.
export async function dispatchPaidCsv(supabase, orderId, env, fetcher = fetch) {
  const read = async () => {
    const { data, error } = await supabase.from('orders')
      .select('id,status,payment_confirmed_at,file_path,services(slug)').eq('id', orderId).maybeSingle();
    if (error) throw new Error('Could not read processing status.');
    return data;
  };
  const order = await read();
  if (!order || order.status !== 'paid' || !order.payment_confirmed_at ||
      order.services?.slug !== 'spreadsheet-cleanup' ||
      !order.file_path?.toLowerCase().endsWith('.csv')) return;
  if (!env.url || !env.key) throw new Error('Processor configuration missing.');
  const response = await fetcher(env.url + '/functions/v1/process-csv-order', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + env.key, 'content-type': 'application/json' },
    body: JSON.stringify({ order_id: order.id }),
    signal: AbortSignal.timeout(20000)
  });
  if (response.ok) return;
  // A concurrent invocation may have claimed it, or a bad CSV may be held for review.
  const current = await read();
  if (current && ['processing', 'needs_review', 'delivered', 'rejected'].includes(current.status)) return;
  throw new Error('CSV dispatch failed; retry webhook.');
}
