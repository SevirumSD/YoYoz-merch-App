export default function AgentsScreen() {
  const agents = [
    { name: 'Programming Agent', confidence: '94%', text: 'Shift to a 5×16 scheme this week. Your rep quality drops after set 4, so trading one heavy set for an incline burnout should raise weekly volume without hurting form.' },
    { name: 'Recovery Agent', confidence: '88%', text: 'Resting heart rate is up 6 bpm over three days. Keep today light and push your next max-effort test to Thursday.' },
    { name: 'Form Agent', confidence: '91%', text: "Your elbows flare past 60° when fatigued. Try a slightly narrower hand position on the last two sets—it kept your form score above 90 last week." },
  ];

  return (
    <div className="bg-black min-h-screen pb-20 p-6">
      <h1 className="text-2xl font-serif font-bold text-white mb-2">Recommendations</h1>
      <p className="text-xs text-gray-500 mb-6">3 agents · updated 2 min ago</p>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.name} className="bg-dark-gray border border-dark-gray rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gold text-sm">{agent.name}</h3>
              <span className="text-xs bg-gold text-black px-2 py-1 rounded font-bold">{agent.confidence} conf</span>
            </div>
            <p className="text-sm text-gray-300 mb-4">{agent.text}</p>
            <div className="flex gap-3">
              <button className="flex-1 border border-gold text-gold py-2 rounded-lg text-xs font-bold uppercase hover:bg-gold hover:text-black transition">
                Apply to plan
              </button>
              <button className="flex-1 border border-gray-600 text-gray-400 py-2 rounded-lg text-xs font-bold uppercase hover:bg-gray-900 transition">
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
