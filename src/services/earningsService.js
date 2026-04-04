import { supabase } from '../lib/supabaseClient'
import { localDateKey } from '../utils/revenueTrends'

export const earningsService = {
  /** @param {string} shopId @param {'day'|'week'|'month'|number} periodOrDays — number = calendar days to load */
  getEarnings: async (shopId, periodOrDays) => {
    const daysBack =
      typeof periodOrDays === 'number'
        ? periodOrDays
        : { day: 1, week: 7, month: 30 }[periodOrDays] || 30
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - daysBack)
    const fromStr = localDateKey(fromDate)

    const { data, error } = await supabase
      .from('v_shop_daily_revenue')
      .select('day, total_revenue, order_count, avg_order_value')
      .eq('shop_id', shopId)
      .gte('day', fromStr)
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
