export default function ProgressScreen() {
  return (
    <div className="bg-black min-h-screen pb-20 p-6">
      <h1 className="text-2xl font-serif font-bold text-white mb-6">Progress</h1>

      {/* Time Period Tabs */}
      <div className="flex gap-3 mb-6">
        {['Week', 'Month', 'Year'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${
              period === 'Week'
                ? 'bg-gold text-black'
                : 'bg-dark-gray text-gray-400'
            }`}
          >
            {period}
          </button>
        ))}
      </div>

      {/* Chart Card */}
      <div className="bg-dark-gray border border-dark-gray rounded-lg p-6 mb-6">
        <h3 className="text-sm uppercase text-gray-400 mb-4">Reps this week</h3>
        <div className="flex items-end justify-around h-40 gap-2">
          {[45, 52, 38, 60, 58, 65, 85].map((height, i) => (
            <div key={i} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t ${height === 85 ? 'bg-gold' : 'bg-gray-600'}`}
                style={{ height: `${height}%` }}
              />
              <span className="text-xs text-gray-500 mt-2">{'MTWTFSS'[i]}</span>
            </div>
          ))}
        </div>
        <p className="text-gold text-2xl font-bold mt-6">612 <span className="text-xs text-green-400">+18%</span></p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-dark-gray border border-dark-gray rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase mb-2">Sessions</p>
          <p className="text-2xl font-bold text-white">12 <span className="text-xs text-green-400">+2 vs last week</span></p>
        </div>
        <div className="bg-dark-gray border border-dark-gray rounded-lg p-4">
          <p className="text-gray-500 text-xs uppercase mb-2">Avg Form</p>
          <p className="text-2xl font-bold text-white">91 <span className="text-xs text-green-400">+3 pts</span></p>
        </div>
      </div>

      {/* Personal Record */}
      <div className="mt-4 bg-dark-gray border border-gold rounded-lg p-6">
        <p className="text-xs uppercase text-gray-500 mb-2">Personal Record</p>
        <div className="flex items-center justify-between">
          <p className="text-white text-sm">41 reps in one set</p>
          <div className="w-16 h-16 rounded-full border-4 border-gold flex items-center justify-center">
            <span className="text-2xl font-bold text-gold">41</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Set Saturday · previous best 38</p>
      </div>
    </div>
  );
}
