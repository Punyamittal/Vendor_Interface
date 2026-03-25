import { supabase } from '../lib/supabaseClient'

export const earningsService = {
  getEarnings: async (shopId, period) => {
    // period: 'day' | 'week' | 'month'
    const daysBack = { day: 1, week: 7, month: 30 }[period] || 7
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)

    const { data, error } = await supabase
      .from('v_shop_daily_revenue')
      .select('day, total_revenue, order_count, avg_order_value')
      .eq('shop_id', shopId)
      .gte('day', fromDate.toISOString())
      .order('day', { ascending: true })

    return { data, error }
  },

  getTopEarningItems: async (shopId) => {
    const { data, error } = await supabase
      .from('v_top_items')
      .select('*')
      .eq('shop_id', shopId)
      .order('total_revenue', { ascending: false })
      .limit(5)
    
    return { data, error }
  }
}
