import { supabase } from '../lib/supabaseClient'

export const shopService = {
  toggleShopAcceptingOrders: async (shopId, current) => {
    const { error } = await supabase
      .from('shops')
      .update({ is_accepting_orders: !current })
      .eq('id', shopId)
    return error
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
