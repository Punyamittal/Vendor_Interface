import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useLiveOrders(shopId) {
  const [liveOrders, setLiveOrders] = useState([])
  const [completedToday, setCompletedToday] = useState([])
  const [loading, setLoading] = useState(true)

  // Initial fetch on mount
  useEffect(() => {
    if (!shopId) return
    
    fetchActiveOrders()
    fetchCompletedToday()
    
    const unsubscribe = subscribeToOrders()
    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [shopId])

  async function fetchActiveOrders() {
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        student:profiles!student_id(full_name, college_id),
        order_items(*, menu_item:menu_items(name))
      `)
      .eq('shop_id', shopId)
      .in('status', ['pending', 'accepted'])
      .order('created_at', { ascending: true })

    setLiveOrders(data || [])
    setLoading(false)
  }

  async function fetchCompletedToday() {
    const todayStart = new Date()
    todayStart.setHours(0,0,0,0)

    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('shop_id', shopId)
      .eq('status', 'completed')
      .gte('created_at', todayStart.toISOString())
      .order('completed_at', { ascending: false })

    setCompletedToday(data || [])
  }

  function subscribeToOrders() {
    const channel = supabase
      .channel(`vendor-orders-${shopId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shopId}`
        },
        async (payload) => {
          // Fetch full order with items + student name
          const { data: fullOrder } = await supabase
            .from('orders')
            .select(`
              *,
              student:profiles!student_id(full_name, college_id),
              order_items(*, menu_item:menu_items(name))
            `)
            .eq('id', payload.new.id)
            .single()

          // Add to top of live list
          setLiveOrders(prev => [fullOrder, ...prev])

          // Play notification sound
          playOrderAlert()

          // Browser notification
          showBrowserNotification(fullOrder)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `shop_id=eq.${shopId}`
        },
        async (payload) => {
          const updated = payload.new

          if (updated.status === 'completed') {
            // Move from liveOrders to completedToday
            setLiveOrders(prev => prev.filter(o => o.id !== updated.id))
            
            // Re-fetch to get complete items list if needed, or use previous info
            fetchCompletedToday()
          } else if (updated.status === 'rejected') {
            setLiveOrders(prev => prev.filter(o => o.id !== updated.id))
          } else {
            // Update status in-place (e.g. pending → accepted)
            setLiveOrders(prev =>
              prev.map(o => o.id === updated.id
                ? { ...o, ...updated }
                : o
              )
            )
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }

  function playOrderAlert() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
    } catch (e) {
      console.log('Audio alert error:', e)
    }
  }

  function showBrowserNotification(order) {
    if (Notification.permission === 'granted') {
      new Notification('New order!', {
        body: `${order.student?.full_name || 'Generic Student'} — ₹${order.total_amount}`,
        icon: '/logo192.png'
      })
    }
  }

  return { liveOrders, completedToday, loading, refetch: fetchActiveOrders }
}
