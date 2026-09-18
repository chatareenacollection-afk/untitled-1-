import React, { useState } from 'react';
import { Lock, ArrowRight, X, ShieldAlert } from 'lucide-react';

interface SecretPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SECRET_PASSKEY = 'Gujjarfamily19109$$Gujjarfamily19109$$';

export const SecretPortalModal: React.FC<SecretPortalModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(false);

    try {
      // Check locally or against backend auth endpoint
      const trimmed = passkey.trim();
      if (trimmed === SECRET_PASSKEY) {
        sessionStorage.setItem('ar_executive_auth', 'true');
        setPasskey('');
        onSuccess();
        return;
      }

      // Also verify with server endpoint
      const res = await fetch('/api/auth/verify-passkey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: trimmed }),
      });
      const data = await res.json();
      if (data.success) {
        sessionStorage.setItem('ar_executive_auth', 'true');
        setPasskey('');
        onSuccess();
      } else {
        setError(true);
      }
    } catch {
      if (passkey.trim() === SECRET_PASSKEY) {
        sessionStorage.setItem('ar_executive_auth', 'true');
        setPasskey('');
        onSuccess();
      } else {
        setError(true);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#1A1817] border border-[#C5A059]/40 rounded-xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-stone-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-12 h-12 rounded-full border border-[#C5A059]/60 bg-stone-900 flex items-center justify-center mx-auto text-[#C5A059]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-xl font-bold text-white tracking-wide">
            Private Portal Access
          </h3>
          <p className="text-xs text-stone-400 font-light">
            Please enter your authorized security key to proceed.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              autoFocus
              placeholder="Enter Access Key"
              value={passkey}
              onChange={(e) => {
                setPasskey(e.target.value);
                setError(false);
                // Instant auto-unlock if user pastes or types the exact key
                if (e.target.value.trim() === SECRET_PASSKEY) {
                  sessionStorage.setItem('ar_executive_auth', 'true');
                  onSuccess();
                }
              }}
              className="w-full bg-stone-900 border border-stone-700 focus:border-[#C5A059] rounded-lg px-4 py-3 text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-[#C5A059] transition-all"
            />
            {error && (
              <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Invalid access credentials. Please check your key.</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifying || !passkey}
            className="w-full py-3 bg-[#C5A059] hover:bg-[#A37F37] text-stone-950 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            <span>{verifying ? 'Verifying...' : 'Authenticate'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
