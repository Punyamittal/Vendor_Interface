import { supabase } from '../lib/supabaseClient'

export const orderService = {
  acceptOrder: async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', orderId)
    return error
  },

  rejectOrder: async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString()
      })
      .eq('id', orderId)
    return error
  },

  completeOrder: async (orderId) => {
    const { error } = await supabase
      .from('orders')
      .update({
        status: 'completed',
        payment_status: 'paid',
        completed_at: new Date().toISOString()
      })
      .eq('id', orderId)
    return error
  },

  getPastOrders: async (shopId, filters = {}) => {
    let query = supabase
      .from('orders')
      .select('*, student:profiles!student_id(full_name), order_items(*)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })

    if (filters.status && filters.status !== 'All') {
      query = query.eq('status', filters.status.toLowerCase())
    }

    const { data, error } = await query
    return { data, error }
  }
}
