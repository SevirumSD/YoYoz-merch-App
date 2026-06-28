import React from 'react';
import { AlertTriangle } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-5">
      <div className="max-w-md w-full p-8 bg-zinc-950 rounded-2xl border border-red-600/30 shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-950/40 border border-red-900/50 animate-pulse">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-4 uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Access Restricted</h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            You are not registered to use this application. Please contact the app administrator to request access.
          </p>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-left text-sm text-zinc-400">
            <p className="font-bold text-white mb-2 uppercase tracking-wide text-xs">If you believe this is an error:</p>
            <ul className="list-disc list-inside space-y-2 text-zinc-400">
              <li>Verify you are logged in with the correct account</li>
              <li>Contact the app administrator for access</li>
              <li>Try logging out and back in again</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;
