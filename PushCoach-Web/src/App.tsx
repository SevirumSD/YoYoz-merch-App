import { useState } from 'react';
import HomeScreen from './components/HomeScreen';
import ChatScreen from './components/ChatScreen';
import AgentsScreen from './components/AgentsScreen';
import ProgressScreen from './components/ProgressScreen';
import SettingsScreen from './components/SettingsScreen';
import { Home, MessageSquare, Zap, BarChart3, Settings } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, component: HomeScreen },
    { id: 'chat', label: 'Coach', icon: MessageSquare, component: ChatScreen },
    { id: 'agents', label: 'Agents', icon: Zap, component: AgentsScreen },
    { id: 'progress', label: 'Progress', icon: BarChart3, component: ProgressScreen },
    { id: 'settings', label: 'Settings', icon: Settings, component: SettingsScreen },
  ];

  const ActiveComponent = tabs.find((t) => t.id === activeTab)?.component || HomeScreen;

  return (
    <div className="bg-black min-h-screen">
      <ActiveComponent />

      {/* Tab Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-dark-gray border-t border-dark-gray px-6 py-4">
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition ${
                  isActive ? 'text-gold' : 'text-gray-500'
                }`}
                style={
                  isActive
                    ? {
                        textShadow: '0 0 12px rgba(200, 168, 75, 0.8)',
                        filter: 'drop-shadow(0 0 12px rgba(200, 168, 75, 0.5))',
                      }
                    : {}
                }
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-serif font-bold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
