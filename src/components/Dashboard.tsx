import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { supabase } from '../lib/supabase'
import { BookOpen, Star, Award, Map, Crown, Gift, ShoppingBag, Settings as SettingsIcon, Bell } from 'lucide-react'
import { ChapterMap } from './ChapterMap'
import { ChapterDetail } from './ChapterDetail'
import { useUserProgress } from '../hooks/useUserProgress'
import { Chapter } from '../types'
import { MonthlyGifts } from './MonthlyGifts'
import { Shop } from './Shop'
import { Settings } from './Settings'
import { NotificationDropdown } from './NotificationDropdown'
import { AchievementModal } from './AchievementModal'

interface DashboardProps {
  onLogout: () => void
}

type DashboardView = 'overview' | 'chapters' | 'chapter-detail' | 'monthly-gifts' | 'shop' | 'settings'

export const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview')
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [achievementUnlocked, setAchievementUnlocked] = useState<{title: string, icon: string} | null>(null)
  
  const {
    userProfile,
    userProgress,
    loading,
    saveChapterProgress,
    saveExerciseResponse,
    isExerciseCompleted,
    getExerciseResponse,
    hasProfileAccess,
    isChapterUnlocked,
    achievements,
    notifications,
    markNotificationsAsRead,
    refreshData
  } = useUserProgress()

  useEffect(() => {
    const loadChapters = async () => {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('order_index')

      if (error) {
        console.error('Erro ao carregar capítulos:', error)
        return
      }

      if (data && userProfile) {
        const mappedChapters = data.map(ch => ({
          id: ch.id,
          title: ch.title,
          subtitle: ch.subtitle || '',
          description: ch.description || '',
          content: ch.content || { summary: '', sections: [] },
          exercises: ch.exercises || [],
          estimatedTime: ch.estimated_time || '15 min',
          isLocked: !isChapterUnlocked(ch.id, ch.is_premium),
          isCompleted: userProgress[ch.id]?.completed || false,
          progress: userProgress[ch.id]?.progress || 0,
          icon: ch.icon || '📖',
          medal_icon: ch.medal_icon || '🏅'
        }))
        setChapters(mappedChapters)
      }
    }

    if (!loading) {
      loadChapters()
    }
  }, [userProgress, userProfile, loading, isChapterUnlocked, hasProfileAccess])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter)
    setCurrentView('chapter-detail')
  }

  const handleChapterComplete = async (chapterId: number) => {
    try {
      const justCompletedChapter = chapters.find(c => c.id === chapterId);
      const wasAlreadyCompleted = userProgress[chapterId]?.completed;

      await saveChapterProgress(chapterId, {
        completed: true,
        progress: 100
      })
      
      setCurrentView('chapters')
      setSelectedChapter(null)
      
      await refreshData()

      if (justCompletedChapter && !wasAlreadyCompleted) {
        setAchievementUnlocked({ title: justCompletedChapter.title, icon: justCompletedChapter.medal_icon });
      }

    } catch (error) {
      console.error('Erro ao completar capítulo:', error)
    }
  }

  const handleExerciseComplete = async (chapterId: number, exerciseId: string, exerciseType: string, responseData: any) => {
    try {
      await saveExerciseResponse(chapterId, exerciseId, exerciseType, responseData)
      await refreshData()
    } catch (error) {
      console.error('Erro ao salvar exercício:', error)
    }
  }

  const handleNotificationsToggle = () => {
    setShowNotifications(prev => !prev);
  }

  const handleMarkNotificationsRead = async (ids: number[]) => {
    await markNotificationsAsRead(ids);
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-600 text-lg">Carregando seu progresso...</p>
        </div>
      </div>
    )
  }

  const Header = () => (
    <div className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer" onClick={() => setCurrentView('overview')}>
            <span className="text-white font-bold">OT</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">O Toque Tântrico</h1>
            {userProfile && <p className="text-sm text-gray-600">Olá, {userProfile.name}!</p>}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {userProfile && hasProfileAccess(userProfile) && (
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              <Crown className="w-4 h-4 mr-1" /> Premium
            </span>
          )}
          <div className="relative">
            <button onClick={handleNotificationsToggle} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown 
                notifications={notifications} 
                onMarkAsRead={handleMarkNotificationsRead}
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          <button onClick={() => setCurrentView('settings')} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
            <SettingsIcon className="w-5 h-5" />
          </button>
          <Button onClick={handleLogout} variant="outline" size="sm">Sair</Button>
        </div>
      </div>
    </div>
  );

  if (currentView === 'settings') {
    return <Settings onBack={() => setCurrentView('overview')} userProfile={userProfile} />;
  }
  if (currentView === 'shop') {
    return <Shop onBack={() => setCurrentView('overview')} />;
  }
  if (currentView === 'monthly-gifts') {
    return <MonthlyGifts onBack={() => setCurrentView('overview')} />;
  }
  if (currentView === 'chapter-detail' && selectedChapter) {
    return <ChapterDetail chapter={selectedChapter} onBack={() => setCurrentView('chapters')} onComplete={handleChapterComplete} onExerciseComplete={handleExerciseComplete} isExerciseCompleted={isExerciseCompleted} getExerciseResponse={getExerciseResponse} />;
  }
  if (currentView === 'chapters') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ChapterMap chapters={chapters} onChapterSelect={handleChapterSelect} />
        </div>
      </div>
    );
  }

  const completedChaptersCount = achievements.length;
  const totalChapters = chapters.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <AchievementModal 
        isOpen={!!achievementUnlocked}
        onClose={() => setAchievementUnlocked(null)}
        chapterTitle={achievementUnlocked?.title || ''}
        medalIcon={achievementUnlocked?.icon || ''}
      />
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Bem-vindo(a) à sua Jornada! 🌟</h2>
              <p className="text-gray-600 mb-6">Continue explorando os capítulos e aprofunde sua conexão espiritual. Cada etapa é uma oportunidade única de crescimento.</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-purple-600"><Award className="w-5 h-5 mr-2" /><span className="text-sm font-medium">{completedChaptersCount} de {totalChapters} capítulos</span></div>
                <div className="flex items-center text-purple-600"><Star className="w-5 h-5 mr-2" /><span className="text-sm font-medium">Nível: {userProfile?.level || 'Iniciante'}</span></div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Seus Capítulos</h3>
                <Button onClick={() => setCurrentView('chapters')} variant="outline" size="sm"><Map className="w-4 h-4 mr-2" />Ver Mapa Completo</Button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {chapters.slice(0, 4).map((chapter, index) => (
                  <motion.div key={chapter.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className={`p-4 rounded-xl border-2 transition-all duration-200 ${chapter.isLocked ? 'bg-gray-50 border-gray-200 opacity-60' : chapter.isCompleted ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200 hover:border-purple-300 cursor-pointer'}`} onClick={() => !chapter.isLocked && handleChapterSelect(chapter)}>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{chapter.icon}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800 text-sm">{chapter.title}</h4>
                        <p className="text-xs text-gray-600">{chapter.estimatedTime}</p>
                        {!chapter.isLocked && chapter.progress > 0 && (<div className="w-full h-1 bg-gray-200 rounded-full mt-2"><div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${chapter.progress}%` }} /></div>)}
                      </div>
                      {chapter.isCompleted && (<div className="text-green-500"><Star className="w-4 h-4 fill-current" /></div>)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Minhas Conquistas</h3>
              <div className="flex flex-wrap gap-4">
                {chapters.map(chapter => {
                  const isAchieved = achievements.some(a => a.chapter_id === chapter.id);
                  return (
                    <div key={chapter.id} className={`text-center transition-opacity ${isAchieved ? 'opacity-100' : 'opacity-30'}`}>
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto ${isAchieved ? 'bg-yellow-100' : 'bg-gray-100'}`}>{chapter.medal_icon}</div>
                      <p className="text-xs text-gray-600 mt-2 w-16 truncate">{chapter.title}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Seu Progresso</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2"><span>Jornada Completa</span><span>{totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0}%</span></div>
                  <div className="w-full h-3 bg-gray-200 rounded-full"><div className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500" style={{ width: `${totalChapters > 0 ? (completedChaptersCount / totalChapters) * 100 : 0}%` }}></div></div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="text-center"><p className="text-2xl font-bold text-purple-600">{completedChaptersCount}</p><p className="text-sm text-gray-600">Concluídos</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-purple-600">{totalChapters - completedChaptersCount}</p><p className="text-sm text-gray-600">Restantes</p></div>
                </div>
              </div>
            </motion.div>

            {userProfile && !hasProfileAccess(userProfile) && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-6"><div className="flex items-center space-x-2 mb-4"><Crown className="w-5 h-5 text-yellow-600" /><h3 className="font-semibold text-gray-800">Acesso Premium</h3></div><p className="text-sm text-gray-600 mb-4">Desbloqueie todos os capítulos e tenha acesso completo ao conteúdo.</p><Button size="sm" className="w-full">Assinar Premium</Button></motion.div>)}
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4"><ShoppingBag className="w-5 h-5 text-pink-500" /><h3 className="font-semibold text-gray-800">Loja Sensual</h3></div>
              <p className="text-sm text-gray-600 mb-4">Explore produtos selecionados para aprimorar sua jornada.</p>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setCurrentView('shop')}>Explorar a Loja</Button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-2 mb-4"><Gift className="w-5 h-5 text-pink-500" /><h3 className="font-semibold text-gray-800">12 Presentes Mensais</h3></div>
              <p className="text-sm text-gray-600 mb-4">Um ebook extra desbloqueado a cada mês para aprofundar sua jornada.</p>
              <Button size="sm" variant="secondary" className="w-full" onClick={() => setCurrentView('monthly-gifts')}>Ver Meus Presentes</Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
