import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useMenuSync(shopId) {
  const [menuItems, setMenuItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!shopId) return
    fetchMenu()

    const channel = supabase
      .channel(`vendor-menu-${shopId}`)
      .on(
        'postgres_changes',
        {
          event: '*',   // INSERT + UPDATE + DELETE
          schema: 'public',
          table: 'menu_items',
          filter: `shop_id=eq.${shopId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMenuItems(prev => [payload.new, ...prev])
          }
          if (payload.eventType === 'UPDATE') {
            setMenuItems(prev =>
              prev.map(item =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            )
          }
          if (payload.eventType === 'DELETE') {
            setMenuItems(prev =>
              prev.filter(item => item.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [shopId])

  async function fetchMenu() {
    setLoading(true)
    try {
      const { data, error } = await supabase
      .from('menu_items')
      // Avoid clobbering the `menu_items.category` column by aliasing joined data.
      // There are (at least) two FK relationships between `menu_items` and `categories`
      // (menu_items_category_fkey and menu_items_category_id_fkey). Make it explicit.
      .select('*, category_info:categories!menu_items_category_id_fkey(name, emoji)')
      .eq('shop_id', shopId)
      .order('created_at', { ascending: false })
      
      if (error) {
        console.error('fetchMenu failed:', error)
        setMenuItems([])
      } else {
        setMenuItems(data || [])
      }
    } catch (err) {
      console.error('fetchMenu crashed:', err)
      setMenuItems([])
    } finally {
      setLoading(false)
    }
  }

  async function addItem(itemData) {
    try {
      const categoryName = typeof itemData?.category === 'string' ? itemData.category : null

      let categoryId = null
      if (categoryName) {
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .maybeSingle()

        if (catErr) return catErr
        if (catData?.id) categoryId = catData.id
      }

      const payload = {
        ...itemData,
        price: itemData?.price === '' ? null : Number(itemData.price),
        category_id: categoryId,
        shop_id: shopId,
      }
      // `menu_items` uses category_id (UUID). Remove `category` name to avoid wrong-column inserts.
      delete payload.category

      const { error } = await supabase.from('menu_items').insert(payload)
      return error
    } catch (err) {
      console.error('addItem crashed:', err)
      throw err
    }
  }

  async function updateItem(itemId, updates) {
    try {
      const categoryName = typeof updates?.category === 'string' ? updates.category : null

      let categoryId = null
      if (categoryName) {
        const { data: catData, error: catErr } = await supabase
          .from('categories')
          .select('id')
          .eq('name', categoryName)
          .maybeSingle()

        if (catErr) return catErr
        if (catData?.id) categoryId = catData.id
      }

      const payload = {
        ...updates,
        price: updates?.price === '' ? null : Number(updates.price),
        category_id: categoryId,
      }
      delete payload.category

      const { error } = await supabase.from('menu_items').update(payload).eq('id', itemId)
      return error
    } catch (err) {
      console.error('updateItem crashed:', err)
      throw err
    }
  }

  async function deleteItem(itemId) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', itemId)
    return error
  }

  async function toggleAvailability(itemId, currentValue) {
    return updateItem(itemId, { is_available: !currentValue })
  }

  async function updateQuantity(itemId, quantity) {
    return updateItem(itemId, { quantity_available: quantity })
  }

  return {
    menuItems,
    loading,
    addItem,
    updateItem,
    deleteItem,
    toggleAvailability,
    updateQuantity
  }
}
