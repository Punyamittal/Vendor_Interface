import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext();

// React StrictMode (dev) can mount/unmount components twice, which may attach
// multiple auth listeners and trigger Supabase session recovery concurrently.
// A module-level guard prevents duplicate listeners.
let authListenerAttached = false;

const VENDOR_LOGIN_NOTICE_KEY = 'vendor_login_notice';

function setVendorLoginNotice(message) {
  try {
    sessionStorage.setItem(VENDOR_LOGIN_NOTICE_KEY, message);
  } catch {
    /* ignore */
  }
}

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

  // After a background tab is resumed, refresh Realtime auth (WS JWT) and session from storage.
  useEffect(() => {
    const onVisibility = async () => {
      if (document.visibilityState !== 'visible') return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (token) {
        void supabase.realtime.setAuth(token).catch(() => {});
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  async function loadVendorData(authUser) {
    if (vendorDataRequestInFlight.current) return;
    vendorDataRequestInFlight.current = true;
    setUser(authUser);
    setLoading(true);

    try {
      // 1. Get profile details (.maybeSingle avoids 406 when 0 or 2+ rows)
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (profileErr) {
        console.error('Profile fetch failed:', profileErr);
        setVendorLoginNotice('Could not load your profile. Try again or contact support.');
        await supabase.auth.signOut();
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      if (!profileData) {
        setVendorLoginNotice('No profile exists for this account. Contact the campus administrator.');
        await supabase.auth.signOut();
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      // 2. Validate role and active status (role may be stored with different casing)
      const role = String(profileData.role || '').toLowerCase().trim();
      const isActive = profileData.is_active !== false;

      if (role !== 'vendor') {
        setVendorLoginNotice(
          'This portal is for vendor accounts only. Super admin and college admin accounts use the admin dashboard—not this app. Sign in with a vendor email (e.g. vendor.a@vit-chennai.seed).'
        );
        await supabase.auth.signOut();
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      if (!isActive) {
        setVendorLoginNotice('Your vendor account is inactive. Contact the campus administrator.');
        await supabase.auth.signOut();
        setProfile(null);
        setShop(null);
        setMustChangePassword(false);
        return;
      }

      setProfile(profileData);
      setMustChangePassword(!!profileData.must_change_password);

      // 3. Get assigned shop (maybeSingle: no 406 when missing; limit 1 if duplicates exist)
      const { data: shopData, error: shopErr } = await supabase
        .from('shops')
        .select(`
          *,
          location:locations(name),
          category:categories(name, emoji)
        `)
        .eq('owner_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (shopErr) {
        console.warn('Shop fetch failed:', shopErr);
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

  /** Merge server fields into the loaded shop (keeps nested location/category from the initial select). */
  const applyShopPatch = useCallback((patch) => {
    setShop((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  useEffect(() => {
    const id = shop?.id;
    if (!id) return;

    const channel = supabase
      .channel(`vendor-shop-realtime-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shops',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row || row.id !== id) return;
          setShop((prev) => (prev ? { ...prev, ...row } : null));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shop?.id]);

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
      applyShopPatch,
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
