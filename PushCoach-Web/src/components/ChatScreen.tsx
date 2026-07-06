import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'coach', text: 'Morning. You hit 84 push-ups yesterday—12 above plan. How did the last set feel?' },
    { id: 2, role: 'user', text: 'Honestly rough. My arms were shaking by rep 12.' },
    { id: 3, role: 'coach', text: "That tracks with your heart-rate data. Let's cap today at 5 sets of 16 with 90 seconds rest, and focus on a full lockout at the top. I'll cue your tempo live during the session." },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, role: 'user', text: input }]);
      setInput('');
    }
  };

  return (
    <div className="bg-black min-h-screen pb-20 p-6">
      <h1 className="text-2xl font-serif font-bold text-white mb-6">Coach</h1>
      
      <div className="space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-gold text-black'
                  : 'bg-dark-gray text-white border border-dark-gray'
              }`}
            >
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 px-6 py-4 bg-black border-t border-dark-gray flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask your coach..."
          className="flex-1 bg-dark-gray text-white rounded-lg px-4 py-2 outline-none text-sm"
        />
        <button
          onClick={handleSend}
          className="bg-gold text-black p-2 rounded-lg hover:shadow-lg transition"
          style={{ boxShadow: '0 0 12px rgba(200, 168, 75, 0.5)' }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
