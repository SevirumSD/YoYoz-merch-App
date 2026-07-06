import { Flame } from 'lucide-react';

export default function HomeScreen() {
  return (
    <div className="bg-black min-h-screen pb-32 p-6">
      {/* Header */}
      <div className="mb-8">
        <p className="text-gold text-xs font-serif uppercase tracking-wider">MONDAY, JULY 6</p>
        <h1 className="text-4xl font-serif font-bold text-white mt-2">Good morning,<br />Dana</h1>
      </div>

      {/* Stat Rings */}
      <div className="grid grid-cols-3 gap-6 mb-10">
        {[
          { label: 'PUSH-UPS', value: 84, total: 100, color: 'from-gold to-gold' },
          { label: 'STREAK', value: 21, total: 30, color: 'from-gold to-gold' },
          { label: 'FORM', value: 92, total: 100, color: 'from-gold to-gold' },
        ].map((stat) => {
          const percentage = (stat.value / stat.total) * 100;
          const circumference = 2 * Math.PI * 45;
          const offset = circumference - (percentage / 100) * circumference;
          
          return (
            <div key={stat.label} className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2d2d2d"
                    strokeWidth="5"
                  />
                  {/* Progress ring with glow */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#c8a84b"
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(200, 168, 75, 0.8))',
                      transition: 'stroke-dashoffset 0.6s ease',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-gold">{stat.value}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase font-serif font-bold">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Today's Push */}
      <div className="bg-dark-gray border border-gray-800 rounded-lg p-6 mb-8">
        <p className="text-xs text-gray-500 uppercase mb-2">Today's push</p>
        <p className="text-xs text-gray-600 mb-4">5 sets · 16 reps · 90s rest</p>
        <button 
          className="w-full bg-gold text-black font-bold py-3 rounded-lg uppercase text-sm font-serif hover:shadow-xl transition"
          style={{ boxShadow: '0 0 12px rgba(200, 168, 75, 0.4)' }}
        >
          Start Session
        </button>
      </div>

      {/* For You Section */}
      <div>
        <h2 className="text-xs uppercase text-gold font-serif font-bold mb-4">For you</h2>
        <div className="space-y-3">
          {[
            { 
              agent: 'Programming Agent', 
              text: 'Add one incline set based on last 3 sessions',
              icon: '⚡'
            },
            { 
              agent: 'Recovery Agent', 
              text: 'Extend rest to 90 seconds based on heart-rate trend',
              icon: '❤️'
            },
          ].map((rec) => (
            <div key={rec.agent} className="bg-dark-gray border border-gray-800 rounded-lg p-4 hover:border-gold transition">
              <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0">⚡</span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-white">{rec.agent}</p>
                  <p className="text-xs text-gray-400 mt-1">{rec.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
