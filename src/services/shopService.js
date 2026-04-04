import { supabase } from '../lib/supabaseClient'

export const shopService = {
  /** Updates DB and returns the new row so UI matches server (RLS errors surface here). */
  toggleShopAcceptingOrders: async (shopId, current) => {
    if (!shopId) {
      return { data: null, error: new Error('Missing shop ID') }
    }
    const next = !current
    const { data, error } = await supabase
      .from('shops')
      .update({ is_accepting_orders: next })
      .eq('id', shopId)
      .select('id, is_accepting_orders')
      .single()
    return { data, error }
  },

  getShopData: async (shopId) => {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .eq('id', shopId)
      .single()
    return { data, error }
  }
}
