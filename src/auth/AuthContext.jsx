import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

// React StrictMode (dev) can mount/unmount components twice, which may attach
// multiple auth listeners and trigger Supabase session recovery concurrently.
// A module-level guard prevents duplicate listeners.
let authListenerAttached = false;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const vendorDataRequestInFlight = useRef(false);

  useEffect(() => {
    if (authListenerAttached) return;
    authListenerAttached = true;

    // Listen for auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') {
          if (session) await loadVendorData(session.user);
          else setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' && session) {
          await loadVendorData(session.user);
          return;
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setShop(null);
          setMustChangePassword(false);
          setLoading(false);
        }
      }
    );

    // Intentionally do not unsubscribe: keeping a single listener avoids
    // concurrent Supabase auth recovery (navigator lock conflicts) in dev.
    return () => {};
  }, []);

  async function loadVendorData(authUser) {
    if (vendorDataRequestInFlight.current) return;
    vendorDataRequestInFlight.current = true;
    setUser(authUser);
    setLoading(true);

    try {
      // 1. Get profile details
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (profileErr || !profileData) {
        console.error('Profile fetch failed:', profileErr);
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      // 2. Validate role and active status
      if (profileData.role !== 'vendor' || !profileData.is_active) {
        console.error('Profile not eligible:', {
          role: profileData.role,
          is_active: profileData.is_active,
        });
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      setProfile(profileData);
      setMustChangePassword(!!profileData.must_change_password);

      // 3. Get assigned shop
      const { data: shopData, error: shopErr } = await supabase
        .from('shops')
        .select(`
          *,
          location:locations(name),
          category:categories(name, emoji)
        `)
        .eq('owner_id', authUser.id)
        .single();

      // If there is no assigned shop, .single() can produce a 406; treat as "no shop".
      if (shopErr) {
        console.warn('Shop fetch failed (treated as no-shop):', shopErr);
        setShop(null);
        return;
      }

      setShop(shopData || null);
    } catch (err) {
      console.error('loadVendorData crashed:', err);
      setProfile(null);
      setShop(null);
      setMustChangePassword(false);
    } finally {
      setLoading(false);
      vendorDataRequestInFlight.current = false;
    }
  }

  async function login(email, password) {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setLoading(false);
      if (error.message.includes('Invalid login')) {
        return { error: 'Incorrect email or password.' };
      }
      if (error.message.includes('Email not confirmed')) {
        return { error: 'Account not activated yet. Contact admin.' };
      }
      return { error: error.message || 'Login failed. Please try again.' };
    }

    return { error: null };
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      // Keep legacy naming used across pages/components.
      vendor: profile,
      shop,
      shopId: shop?.id,
      loading,
      login,
      logout,
      mustChangePassword,
      setMustChangePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
