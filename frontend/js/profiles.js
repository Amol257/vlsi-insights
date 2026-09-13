/**
 * VLSI Insights — Profiles Table Helper
 * Upserts user profile data (phone, full_name, email) into public.profiles table.
 * Call after any sign-up or phone collection flow.
 */

/**
 * Upsert a user's profile into the public.profiles table.
 * @param {object} client - Supabase client (window.sb)
 * @param {object} params
 * @param {string} params.id        - User UUID from session.user.id
 * @param {string} params.email     - User email
 * @param {string} [params.full_name] - Optional full name
 * @param {string} [params.phone]   - Phone number with country code
 * @returns {Promise<{error: Error|null}>}
 */
async function upsertProfile(client, { id, email, full_name, phone }) {
  if (!client || !id) return { error: new Error('Missing client or user id') };

  const profile = {
    id,
    email:      email     || null,
    full_name:  full_name || null,
    phone:      phone     || null,
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await client
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });

    if (error) {
      console.warn('[profiles] upsert error:', error.message);
    }
    return { error: error || null };
  } catch (err) {
    console.warn('[profiles] upsert exception:', err.message);
    return { error: err };
  }
}

window.upsertProfile = upsertProfile;
