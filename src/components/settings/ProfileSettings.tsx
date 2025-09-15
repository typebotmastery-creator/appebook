import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../hooks/useUserProgress';
import { supabase } from '../../lib/supabase';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Crown, Star } from 'lucide-react';

interface ProfileSettingsProps {
  userProfile: UserProfile | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userProfile }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    setLoading(true);
    setMessage('');
    const { error } = await supabase
      .from('profiles')
      .update({ name })
      .eq('id', userProfile.id);

    if (error) {
      setMessage('Erro ao atualizar o perfil.');
    } else {
      setMessage('Perfil atualizado com sucesso!');
    }
    setLoading(false);
  };

  if (!userProfile) {
    return <div>Carregando perfil...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Meu Perfil</h2>
        <p className="text-gray-600 mt-1">Gerencie suas informações pessoais.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Email</p>
          <p className="text-gray-800">{userProfile.email}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Nível</p>
          <p className="text-gray-800 capitalize flex items-center"><Star className="w-4 h-4 mr-2 text-yellow-500"/>{userProfile.level}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Assinatura</p>
          <p className="text-gray-800 capitalize flex items-center"><Crown className="w-4 h-4 mr-2 text-yellow-600"/>{userProfile.subscription_status}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500">Capítulos Concluídos</p>
          <p className="text-gray-800">{userProfile.total_completed_chapters}</p>
        </div>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <Input
          label="Nome Completo"
          value={name}
          onChange={setName}
          placeholder="Seu nome completo"
          required
        />
        <div className="flex items-center space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          {message && <p className="text-sm text-green-600">{message}</p>}
        </div>
      </form>
    </div>
  );
};
