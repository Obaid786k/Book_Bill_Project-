import React, { useState, useEffect } from 'react';
import { accountService } from '../../services/accountService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { MonitorSmartphone, MapPin, Key, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { useToast } from '../../components/feedback/Toast';
import { Dialog } from '../../components/common/Dialog';
import { validatePassword } from '../../lib/validation';

export const AccountSecurity = () => {
  const [data, setData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const { toast } = useToast();
  
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [visibleFields, setVisibleFields] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const toggleVisible = (field) => setVisibleFields(v => ({ ...v, [field]: !v[field] }));

  const handleChange = (e) => {
    setPasswords(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.newPassword) {
      toast('Please enter a new password.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast('New passwords do not match!');
      return;
    }
    
    const validation = validatePassword(passwords.newPassword);
    if (!validation.isValid) {
      toast(validation.error);
      return;
    }

    setIsSubmitting(true);
    
    try {
      await settingsService.changePassword(passwords.oldPassword, passwords.newPassword);
      toast('Password changed successfully.');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast(err.message || 'Failed to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    accountService.getSecurityInfo().then(setData);
  }, []);

  if (!data) return <div className="p-8">Loading security info...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-ink">Account Security</h1>
        <p className="text-sm text-ink2 mt-1">Review active sessions and access settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-[13px] font-bold text-navy uppercase tracking-wider mb-6 pb-2 border-b border-bb2">
            Current Session
          </h2>
          
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded bg-navy-lt/10 flex items-center justify-center text-navy shrink-0">
              <MonitorSmartphone size={20} />
            </div>
            <div className="space-y-3 w-full">
              <div>
                <p className="text-sm font-bold text-ink">{data.currentSession.device}</p>
                <p className="text-xs text-green font-medium">Active Now</p>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-ink2">
                <MapPin size={14} />
                <span>{data.currentSession.location}</span>
              </div>
              
              <div className="pt-3 border-t border-bb2 flex justify-between items-center">
                <div>
                  <p className="text-[11px] font-bold text-ink2 uppercase tracking-wider mb-1">IP Address</p>
                  <p className="text-xs font-mono text-ink">{data.currentSession.ip}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-ink2 uppercase tracking-wider mb-1">Started</p>
                  <p className="text-xs text-ink">{data.currentSession.started}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded bg-gold/10 flex items-center justify-center text-gold shrink-0">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy mb-1">Password Management</h3>
                <p className="text-xs text-ink2 mb-4">
                  Last changed {data.lastPasswordChange}. We recommend updating your password every 90 days.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Change Password
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ink2/10 text-ink2 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-navy">Two-Factor Authentication (2FA)</h3>
                <p className="text-[13px] text-ink2 mt-1 leading-relaxed">
                  {data.twoFactorEnabled 
                    ? "2FA is currently enabled for this account." 
                    : "Not enabled. Add an extra layer of security to your account."}
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="opacity-50 cursor-not-allowed">
                    Enable 2FA (Coming Soon)
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Change Password"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Current Password</label>
            <div className="relative">
              <input 
                type={visibleFields.oldPassword ? 'text' : 'password'}
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handleChange}
                required
                className="w-full border border-bb rounded p-2.5 pr-9 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => toggleVisible('oldPassword')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-navy transition-colors"
                aria-label={visibleFields.oldPassword ? 'Hide password' : 'Show password'}
              >
                {visibleFields.oldPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">New Password</label>
            <div className="relative">
              <input 
                type={visibleFields.newPassword ? 'text' : 'password'}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handleChange}
                required
                className="w-full border border-bb rounded p-2.5 pr-9 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => toggleVisible('newPassword')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-navy transition-colors"
                aria-label={visibleFields.newPassword ? 'Hide password' : 'Show password'}
              >
                {visibleFields.newPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-[11px] text-ink3 mt-1">
              Must be at least 6 characters with uppercase, lowercase, number & symbol.
            </p>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-navy mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input 
                type={visibleFields.confirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                className="w-full border border-bb rounded p-2.5 pr-9 text-sm outline-none focus:border-navy transition-colors bg-white"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => toggleVisible('confirmPassword')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink3 hover:text-navy transition-colors"
                aria-label={visibleFields.confirmPassword ? 'Hide password' : 'Show password'}
              >
                {visibleFields.confirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          
          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Update Password
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};

export default AccountSecurity;
