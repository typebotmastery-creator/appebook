import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, History, Shield, LifeBuoy } from 'lucide-react';
import { UserProfile } from '../hooks/useUserProgress';
import { ProfileSettings } from './settings/ProfileSettings';
import { PurchaseHistory } from './settings/PurchaseHistory';
import { Support } from './settings/Support';
import { Legal } from './settings/Legal';

interface SettingsProps {
  onBack: () => void;
  userProfile: UserProfile | null;
}

type SettingsView = 'profile' | 'history' | 'support' | 'legal';

export const Settings: React.FC<SettingsProps> = ({ onBack, userProfile }) => {
  const [activeView, setActiveView] = useState<SettingsView>('profile');

  const menuItems = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'history', label: 'Histórico de Compras', icon: History },
    { id: 'support', label: 'Suporte', icon: LifeBuoy },
    { id: 'legal', label: 'Legal', icon: Shield },
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return <ProfileSettings userProfile={userProfile} />;
      case 'history':
        return <PurchaseHistory />;
      case 'support':
        return <Support />;
      case 'legal':
        return <Legal />;
      default:
        return <ProfileSettings userProfile={userProfile} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button onClick={onBack} className="flex items-center text-purple-600 hover:text-purple-800 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Dashboard
          </button>
          <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Menu Lateral */}
          <aside className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-2">
              {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as SettingsView)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    activeView === item.id
                      ? 'bg-purple-100 text-purple-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Conteúdo Principal */}
          <main className="md:col-span-3">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-sm p-8"
            >
              {renderContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};
