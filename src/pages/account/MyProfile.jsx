import React, { useRef, useState } from 'react';
import { Camera, Trash2, Mail, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/feedback/Alert';
import { useToast } from '../../components/feedback/Toast';
import { Avatar } from '../../components/shell/ProfileRow';
import { useAuthStore } from '../../store/authStore';
import { profileService, AVATAR_TYPES } from '../../services/profileService';

const INPUT = 'w-full border border-bb rounded p-2.5 text-sm outline-none focus:border-navy transition-colors bg-white disabled:bg-row-alt disabled:text-ink2';
const SECTION = 'text-[13px] font-bold text-navy uppercase tracking-wider mb-5 pb-2 border-b border-bb2';
const LABEL = 'block text-[13px] font-bold text-navy mb-1.5';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MyProfile = () => {
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [savingName, setSavingName] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const nameChanged = name.trim() && name.trim() !== (user?.name || '');

  const saveName = async (e) => {
    e.preventDefault();
    if (!nameChanged || savingName) return;
    setSavingName(true);
    try {
      const saved = await profileService.updateName(name);
      updateUser({ name: saved });
      setName(saved);
      toast.success('Name updated.');
    } catch (err) {
      toast.error(err.message || 'Could not update your name. Please try again.');
    } finally {
      setSavingName(false);
    }
  };

  const onPickPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;
    setPhotoBusy(true);
    try {
      const avatarUrl = await profileService.uploadAvatar(file);
      updateUser({ avatarUrl });
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error(err.message || 'Could not upload the photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoBusy(true);
    try {
      await profileService.removeAvatar();
      updateUser({ avatarUrl: null });
      toast.success('Profile photo removed.');
    } catch (err) {
      toast.error(err.message || 'Could not remove the photo. Please try again.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const sendEmailChange = async (e) => {
    e.preventDefault();
    const next = email.trim().toLowerCase();
    if (!EMAIL_RE.test(next)) { setEmailError('Enter a valid email address.'); return; }
    if (next === (user?.email || '').toLowerCase()) { setEmailError('This is already your email.'); return; }
    setSendingEmail(true);
    try {
      const pending = await profileService.requestEmailChange(next);
      updateUser({ pendingEmail: pending });
      setEditingEmail(false);
      setEmail('');
      toast.success('Confirmation link sent. Check your inbox.');
    } catch (err) {
      setEmailError(err.message || 'Could not start the email change. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader />

      <div className="grid lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* Photo */}
        <Card className="p-6 flex flex-col items-center text-center">
          <Avatar name={user?.name} src={user?.avatarUrl} size={104} />
          <p className="mt-3 text-[16px] font-bold text-navy-900 break-all">{user?.name || 'User'}</p>
          <p className="text-[13px] text-ink2 break-all">{user?.email}</p>

          <input ref={fileRef} type="file" accept={AVATAR_TYPES.join(',')} className="hidden" onChange={onPickPhoto} />
          <div className="flex flex-wrap justify-center gap-2 mt-5">
            <Button variant="outline" onClick={() => fileRef.current?.click()} isLoading={photoBusy}>
              <Camera size={15} /> {user?.avatarUrl ? 'Change photo' : 'Upload photo'}
            </Button>
            {user?.avatarUrl && (
              <Button variant="ghost-danger" onClick={removePhoto} disabled={photoBusy}>
                <Trash2 size={15} /> Remove
              </Button>
            )}
          </div>
          <p className="text-[12px] text-ink3 mt-3">JPG, PNG or WebP, up to 2 MB. We crop it to a square.</p>
        </Card>

        <div className="flex flex-col gap-4">
          {/* Name */}
          <Card className="p-6">
            <h2 className={SECTION}>Personal details</h2>
            <form onSubmit={saveName} className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label htmlFor="profile-name" className={LABEL}>Full name</label>
                <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} autoComplete="name" className={INPUT} />
              </div>
              <Button type="submit" variant="primary" className="h-[42px]" disabled={!nameChanged} isLoading={savingName}>Save name</Button>
            </form>
            <p className="text-[12px] text-ink3 mt-2">Shown in the sidebar and on your account. If you never set one, we use the name from your sign-up or Google account.</p>
          </Card>

          {/* Email */}
          <Card className="p-6">
            <h2 className={SECTION}>Email address</h2>
            <label htmlFor="profile-email" className={LABEL}>Login email</label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <input id="profile-email" value={user?.email || ''} disabled className={INPUT} />
              {!editingEmail && (
                <Button variant="outline" className="h-[42px]" onClick={() => { setEditingEmail(true); setEmailError(''); }}>
                  <Mail size={15} /> Change email
                </Button>
              )}
            </div>

            {user?.pendingEmail && !editingEmail && (
              <div className="mt-4">
                <Alert variant="info" message={`Waiting for confirmation: ${user.pendingEmail}. Open the link we emailed to finish the change.`} />
              </div>
            )}

            {editingEmail && (
              <form onSubmit={sendEmailChange} className="mt-4 p-4 rounded-lg bg-row-alt border border-bb2">
                <label htmlFor="profile-new-email" className={LABEL}>New email</label>
                <input
                  id="profile-new-email"
                  type="email"
                  autoFocus
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  placeholder="name@business.com"
                  autoComplete="email"
                  className={INPUT}
                />
                {emailError && <p className="text-[12px] text-red mt-1.5" role="alert">{emailError}</p>}
                <p className="text-[12px] text-ink2 mt-2 flex items-start gap-1.5">
                  <CheckCircle2 size={14} className="text-green mt-0.5 shrink-0" />
                  We'll email a confirmation link. Your login email changes only after you click it.
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="ghost" onClick={() => { setEditingEmail(false); setEmail(''); setEmailError(''); }}>Cancel</Button>
                  <Button type="submit" variant="primary" isLoading={sendingEmail}>Send confirmation link</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
