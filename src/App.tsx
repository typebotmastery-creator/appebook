import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { WelcomeSection } from './components/WelcomeSection'
import { AuthSection } from './components/AuthSection'
import { Dashboard } from './components/Dashboard'
import type { User } from '@supabase/supabase-js'

type AppState = 'welcome' | 'auth' | 'dashboard'

function App() {
  const [currentState, setCurrentState] = useState<AppState>('welcome')
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading === false) {
      if (user) {
        setCurrentState('dashboard');
      } else {
        setCurrentState('welcome');
      }
    }
  }, [user, loading]);

  const handleStartJourney = () => {
    setCurrentState('auth')
  }

  const handleBackToWelcome = () => {
    setCurrentState('welcome')
  }

  const handleAuthSuccess = () => {
    // A transição de estado agora é gerenciada pelo useEffect
  }

  const handleLogout = () => {
    // A transição de estado agora é gerenciada pelo useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {currentState === 'welcome' && (
          <WelcomeSection onStartJourney={handleStartJourney} />
        )}
        
        {currentState === 'auth' && (
          <AuthSection 
            onBack={handleBackToWelcome}
            onSuccess={handleAuthSuccess}
          />
        )}
        
        {currentState === 'dashboard' && user && (
          <Dashboard onLogout={handleLogout} />
        )}
      </div>
    </Router>
  )
}

export default App
