/**
 * Example: keep admin UI in sync when vendors toggle is_accepting_orders.
 * Requires: `shops` in supabase_realtime publication + RLS SELECT for admin users.
 *
 * Merge payload.new into your shops list state by id (or refetch).
 */
export function subscribeToShopUpdates(supabase, onShopRow) {
  const channel = supabase
    .channel('admin-shops-updates')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'shops' },
      (payload) => {
        onShopRow(payload.new, payload.old)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
