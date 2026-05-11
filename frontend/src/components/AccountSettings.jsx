import React, { useState } from 'react';
import { authClient } from '../lib/auth.js';
import { useToast } from './Toast.jsx';

export default function AccountSettings({ user, onCleared }) {
  const toast = useToast();
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const email = user?.email || '';
  const canDelete =
    confirmInput.trim().toLowerCase() === email.trim().toLowerCase() && !!email;

  function goHome() {
    if (typeof onCleared === 'function') onCleared();
    window.location.hash = '#/';
  }

  async function handleLogoutAll() {
    if (loggingOutAll) return;
    if (!window.confirm('Sign out on all devices? You will need to log in again.')) return;
    setLoggingOutAll(true);
    try {
      // Better Auth's revokeOtherSessions kills every other session; signOut
      // closes the current one. Combined, the user is fully signed out everywhere.
      if (typeof authClient.revokeOtherSessions === 'function') {
        await authClient.revokeOtherSessions();
      } else if (authClient.multiSession?.revokeOtherSessions) {
        await authClient.multiSession.revokeOtherSessions();
      }
      await authClient.signOut();
      toast.push('Signed out on all devices.', 'success');
      goHome();
    } catch (e) {
      toast.push(e.message || 'Could not sign out everywhere.', 'error');
    } finally {
      setLoggingOutAll(false);
    }
  }

  async function handleDelete() {
    if (!canDelete || deleting) return;
    setDeleting(true);
    try {
      // Better Auth's deleteUser. If the server requires a fresh password
      // confirm, we forward it. Sending an empty password when not required
      // is harmless (Better Auth ignores unknown fields).
      const payload = confirmPassword ? { password: confirmPassword } : {};
      const result = await authClient.deleteUser(payload);
      if (result?.error) {
        throw new Error(result.error.message || result.error.code || 'delete_failed');
      }
      toast.push('Account deleted.', 'success');
      goHome();
    } catch (e) {
      toast.push(e.message || 'Could not delete account.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
        <h1 className="font-heading text-2xl font-bold text-gray-900 mb-1">Account</h1>
        <p className="text-gray-500 text-sm">
          Signed in as <span className="font-medium text-gray-700">{user?.name || user?.displayName || email}</span>
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-gray-100 p-6">
        <h2 className="font-heading text-lg font-bold text-gray-900 mb-2">Sessions</h2>
        <p className="text-gray-600 text-sm mb-4">
          Sign out from every device you've used. Useful if you lost a phone or
          shared this account temporarily.
        </p>
        <button
          data-testid="logout-all-btn"
          onClick={handleLogoutAll}
          disabled={loggingOutAll}
          className="bg-gray-200 hover:bg-gray-300 disabled:opacity-60 text-gray-800 font-semibold py-2.5 px-5 rounded-lg transition-all"
        >
          {loggingOutAll ? 'Signing out…' : 'Sign out everywhere'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card border border-red-200 p-6">
        <h2 className="font-heading text-lg font-bold text-red-700 mb-2">Danger zone</h2>
        <p className="text-gray-700 text-sm mb-4">
          Deleting your account permanently removes your progress, mastery,
          practice history, and the account itself. This cannot be undone.
        </p>

        {!confirmOpen ? (
          <button
            data-testid="delete-account-btn"
            onClick={() => setConfirmOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
          >
            Delete account
          </button>
        ) : (
          <div className="space-y-3 border-t border-red-100 pt-4">
            <p className="text-sm text-gray-700">
              Type your email <code className="px-1.5 py-0.5 bg-gray-100 rounded">{email}</code> to confirm.
            </p>
            <input
              data-testid="delete-account-confirm-input"
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={email}
              autoComplete="off"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <p className="text-xs text-gray-500">
              If your account uses a password, enter it to confirm. Leave blank for Google-only accounts.
            </p>
            <input
              data-testid="delete-account-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Current password (if any)"
              autoComplete="current-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                data-testid="delete-account-confirm-btn"
                onClick={handleDelete}
                disabled={!canDelete || deleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-lg transition-all"
              >
                {deleting ? 'Deleting…' : 'Permanently delete'}
              </button>
              <button
                onClick={() => { setConfirmOpen(false); setConfirmInput(''); setConfirmPassword(''); }}
                disabled={deleting}
                className="bg-transparent hover:bg-gray-100 text-gray-600 font-medium py-2.5 px-5 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
