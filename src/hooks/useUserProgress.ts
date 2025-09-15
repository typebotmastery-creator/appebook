import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { UserProgress, Achievement, AppNotification } from '../types'

export interface UserProfile {
  id: string
  email: string
  name: string
  subscription_status: 'free' | 'premium' | 'trial'
  level: 'iniciante' | 'praticante' | 'avancado'
  total_completed_chapters: number
}

export const useUserProgress = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userProgress, setUserProgress] = useState<Record<number, UserProgress>>({})
  const [exerciseResponses, setExerciseResponses] = useState<Record<string, any>>({})
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setLoading(false)
        return
      }

      // Carregar perfil, progresso, respostas, conquistas e notificações em paralelo
      const [
        { data: profile, error: profileError },
        { data: progress, error: progressError },
        { data: responses, error: responsesError },
        { data: achievementsData, error: achievementsError },
        { data: notificationsData, error: notificationsError },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_progress').select('*').eq('user_id', user.id),
        supabase.from('exercise_responses').select('*').eq('user_id', user.id),
        supabase.from('achievements').select('*').eq('user_id', user.id),
        supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      if (progressError) throw progressError;
      if (responsesError) throw responsesError;
      if (achievementsError) throw achievementsError;
      if (notificationsError) throw notificationsError;
      
      if (profile) setUserProfile(profile);
      if (achievementsData) setAchievements(achievementsData);
      if (notificationsData) setNotifications(notificationsData);

      const progressMap: Record<number, UserProgress> = {}
      progress?.forEach(p => {
        progressMap[p.chapter_id] = {
          userId: p.user_id,
          chapterId: p.chapter_id,
          completed: p.is_completed,
          progress: p.progress_percentage,
          exercisesCompleted: [],
          lastAccessed: new Date(p.last_accessed_at)
        }
      })
      setUserProgress(progressMap)

      const responsesMap: Record<string, any> = {}
      responses?.forEach(r => {
        const key = `${r.chapter_id}-${r.exercise_id}`
        responsesMap[key] = r.response_data
      })
      setExerciseResponses(responsesMap)

    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveChapterProgress = async (chapterId: number, progressData: Partial<UserProgress>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const updateData = {
        user_id: user.id,
        chapter_id: chapterId,
        is_completed: progressData.completed,
        progress_percentage: progressData.progress,
        last_accessed_at: new Date().toISOString(),
        ...(progressData.completed && { completed_at: new Date().toISOString() })
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(updateData, { 
          onConflict: 'user_id,chapter_id'
        })

      if (error) throw error
      
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const saveExerciseResponse = async (chapterId: number, exerciseId: string, exerciseType: string, responseData: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não autenticado')

      const { error } = await supabase
        .from('exercise_responses')
        .upsert({
          user_id: user.id,
          chapter_id: chapterId,
          exercise_id: exerciseId,
          exercise_type: exerciseType,
          response_data: responseData,
          is_completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,chapter_id,exercise_id'
        })

      if (error) throw error

    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const isExerciseCompleted = (chapterId: number, exerciseId: string): boolean => {
    const key = `${chapterId}-${exerciseId}`
    return !!exerciseResponses[key]
  }

  const getExerciseResponse = (chapterId: number, exerciseId: string): any => {
    const key = `${chapterId}-${exerciseId}`
    return exerciseResponses[key]
  }

  const hasProfileAccess = useCallback((profile: UserProfile | null): boolean => {
    if (!profile) return false
    return profile.subscription_status === 'premium' || profile.subscription_status === 'trial';
  }, [])

  const isChapterUnlocked = useCallback((chapterId: number, isPremium: boolean): boolean => {
    if (chapterId === 1) return true
    if (isPremium && !hasProfileAccess(userProfile)) return false
    
    const previousChapterProgress = userProgress[chapterId - 1]
    return previousChapterProgress?.completed || false
  }, [userProgress, userProfile, hasProfileAccess])

  const markNotificationsAsRead = async (notificationIds: number[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notificationIds)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(n => notificationIds.includes(n.id) ? { ...n, is_read: true } : n)
      );

    } catch(err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  return {
    userProfile,
    userProgress,
    exerciseResponses,
    achievements,
    notifications,
    loading,
    error,
    saveChapterProgress,
    saveExerciseResponse,
    isExerciseCompleted,
    getExerciseResponse,
    hasProfileAccess,
    isChapterUnlocked,
    markNotificationsAsRead,
    refreshData: loadUserData
  }
}
