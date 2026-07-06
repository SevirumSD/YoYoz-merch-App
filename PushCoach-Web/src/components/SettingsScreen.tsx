import { ChevronRight } from 'lucide-react';

export default function SettingsScreen() {
  return (
    <div className="bg-black min-h-screen pb-20 p-6">
      <h1 className="text-2xl font-serif font-bold text-white mb-6">Settings</h1>

      {/* Profile Card */}
      <div className="bg-dark-gray border border-gold rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center text-black font-bold text-xl">
            DR
          </div>
          <div>
            <p className="font-bold text-white">Dana Reyes</p>
            <p className="text-xs text-gold">GOLD Member since 2024</p>
          </div>
        </div>
      </div>

      {/* Coaching Section */}
      <div className="mb-6">
        <p className="text-xs uppercase text-gray-500 font-bold mb-3">Coaching</p>
        <div className="space-y-2">
          {[
            { label: 'Daily reminder', enabled: true },
            { label: 'Live form feedback', enabled: true },
            { label: 'Coach voice cues', enabled: false },
          ].map((item) => (
            <div key={item.label} className="bg-dark-gray border border-dark-gray rounded-lg p-4 flex justify-between items-center">
              <p className="text-white text-sm">{item.label}</p>
              <div className={`w-10 h-6 rounded-full transition ${item.enabled ? 'bg-gold' : 'bg-gray-600'}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Data Section */}
      <div className="mb-6">
        <p className="text-xs uppercase text-gray-500 font-bold mb-3">Data</p>
        <div className="space-y-2">
          {['Health sync', 'Units', 'Export training data'].map((item) => (
            <div key={item} className="bg-dark-gray border border-dark-gray rounded-lg p-4 flex justify-between items-center">
              <p className="text-white text-sm">{item}</p>
              <ChevronRight className="w-5 h-5 text-gold" />
            </div>
          ))}
        </div>
      </div>

      {/* Account Section */}
      <div>
        <p className="text-xs uppercase text-gray-500 font-bold mb-3">Account</p>
        <div className="space-y-2">
          {['Privacy', 'Sign out'].map((item) => (
            <div key={item} className="bg-dark-gray border border-dark-gray rounded-lg p-4 flex justify-between items-center">
              <p className="text-white text-sm">{item}</p>
              {item === 'Privacy' && <ChevronRight className="w-5 h-5 text-gold" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
