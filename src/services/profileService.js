import { supabase } from '../lib/supabaseClient';
import { handleSupabaseError } from '../utils/handleSupabaseError';

// "My profile" page: name, photo and email of the logged-in user.
// Name  -> profiles.full_name (column grant in 0002) + auth metadata.
// Photo -> Storage bucket `avatars` (0008), file `<user id>/avatar.jpg`, URL kept in auth metadata.
// Email -> Supabase sends a confirmation link; the change applies after the user clicks it.

const AVATAR_BUCKET = 'avatars';
const AVATAR_SIZE = 256;
export const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // what we accept from the picker (we shrink before upload)
export const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const currentUserId = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Your session has expired. Please log in again.');
  return data.user.id;
};

// Square-crop and shrink to 256px JPEG so uploads stay tiny (~20 KB).
const toSquareJpeg = (file) => new Promise((resolve, reject) => {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const side = Math.min(img.width, img.height);
    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_SIZE;
    canvas.height = AVATAR_SIZE;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
    URL.revokeObjectURL(url);
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read this image.'))), 'image/jpeg', 0.85);
  };
  img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read this image.')); };
  img.src = url;
});

export const profileService = {
  updateName: async (name) => {
    const clean = name.trim();
    if (!clean) throw new Error('Name cannot be empty.');
    const id = await currentUserId();
    const { error } = await supabase.from('profiles').update({ full_name: clean }).eq('id', id);
    if (error) throw handleSupabaseError(error, { table: 'profiles', action: 'update' });
    // Keep auth metadata in step (used as a fallback and by Supabase emails).
    await supabase.auth.updateUser({ data: { full_name: clean } });
    return clean;
  },

  // Sends a confirmation link. Returns the address waiting for confirmation.
  requestEmailChange: async (email) => {
    const clean = email.trim().toLowerCase();
    const { data, error } = await supabase.auth.updateUser(
      { email: clean },
      { emailRedirectTo: `${window.location.origin}/account/profile` }
    );
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'update_email' });
    return data.user?.new_email || clean;
  },

  uploadAvatar: async (file) => {
    if (!AVATAR_TYPES.includes(file.type)) throw new Error('Use a JPG, PNG or WebP image.');
    if (file.size > AVATAR_MAX_BYTES) throw new Error('Image is too large. Pick one under 2 MB.');
    const id = await currentUserId();
    const blob = await toSquareJpeg(file);
    const path = `${id}/avatar.jpg`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
    if (error) throw handleSupabaseError(error, { table: 'storage.avatars', action: 'upload' });
    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    const avatarUrl = `${data.publicUrl}?v=${Date.now()}`; // bust the browser cache after a change
    const { error: metaErr } = await supabase.auth.updateUser({ data: { avatar_url: avatarUrl } });
    if (metaErr) throw handleSupabaseError(metaErr, { table: 'auth', action: 'update_avatar' });
    return avatarUrl;
  },

  removeAvatar: async () => {
    const id = await currentUserId();
    await supabase.storage.from(AVATAR_BUCKET).remove([`${id}/avatar.jpg`]);
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: null, picture: null } });
    if (error) throw handleSupabaseError(error, { table: 'auth', action: 'remove_avatar' });
  },
};
