import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Chapter } from '../types'
import { Button } from './ui/Button'
import { ArrowLeft, Play, Pause, CheckCircle, Clock, BookOpen } from 'lucide-react'
import { ExerciseComponent } from './ExerciseComponent'

interface ChapterDetailProps {
  chapter: Chapter
  onBack: () => void
  onComplete: (chapterId: number) => void
  onExerciseComplete: (chapterId: number, exerciseId: string, exerciseType: string, responseData: any) => void
  isExerciseCompleted: (chapterId: number, exerciseId: string) => boolean
  getExerciseResponse: (chapterId: number, exerciseId: string) => any
}

export const ChapterDetail: React.FC<ChapterDetailProps> = ({ 
  chapter, 
  onBack, 
  onComplete,
  onExerciseComplete,
  isExerciseCompleted,
  getExerciseResponse
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'exercises'>('content')
  const [isPlaying, setIsPlaying] = useState(false)

  const getCompletedExercises = () => {
    return chapter.exercises.filter(ex => isExerciseCompleted(chapter.id, ex.id))
  }

  const completedExercisesCount = getCompletedExercises().length
  const canCompleteChapter = completedExercisesCount === chapter.exercises.length
  const progressPercentage = chapter.exercises.length > 0 
    ? (completedExercisesCount / chapter.exercises.length) * 100 
    : 100

  const handleCompleteChapter = () => {
    if (canCompleteChapter) {
      onComplete(chapter.id)
    }
  }

  const handleExerciseComplete = (exerciseId: string, exerciseType: string, responseData: any) => {
    onExerciseComplete(chapter.id, exerciseId, exerciseType, responseData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center text-purple-600 hover:text-purple-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar ao Mapa
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{chapter.icon}</span>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{chapter.title}</h1>
                  <p className="text-purple-600 font-medium">{chapter.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{chapter.estimatedTime}</span>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'content'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <BookOpen className="w-4 h-4 inline mr-2" />
            Conteúdo
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
              activeTab === 'exercises'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <CheckCircle className="w-4 h-4 inline mr-2" />
            Exercícios ({completedExercisesCount}/{chapter.exercises.length})
          </button>
        </div>

        {/* Conteúdo */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Resumo Narrado */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Resumo Narrado</h2>
              
              {/* Player de Áudio */}
              {chapter.content.audioUrl && (
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center hover:bg-purple-700 transition-colors"
                      >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
                      </button>
                      <div>
                        <p className="font-medium text-purple-800">Áudio Guiado</p>
                        <p className="text-sm text-purple-600">Ouça enquanto lê ou medita</p>
                      </div>
                    </div>
                    <div className="text-sm text-purple-600">
                      {chapter.estimatedTime}
                    </div>
                  </div>
                </div>
              )}

              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed">
                  {chapter.content.summary}
                </p>
              </div>
            </div>

            {/* Seções de Conteúdo */}
            <div className="space-y-6">
              {chapter.content.sections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`rounded-2xl shadow-sm p-6 ${
                    section.type === 'quote' ? 'bg-gradient-to-r from-purple-100 to-pink-100' :
                    section.type === 'practice' ? 'bg-gradient-to-r from-green-100 to-blue-100' :
                    section.type === 'reflection' ? 'bg-gradient-to-r from-yellow-100 to-orange-100' :
                    'bg-white'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {section.title}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Exercícios */}
        {activeTab === 'exercises' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {chapter.exercises.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                <div className="text-6xl mb-4">🧘‍♀️</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Exercícios em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                  Os exercícios práticos para este capítulo estarão disponíveis em breve.
                </p>
              </div>
            ) : (
              chapter.exercises.map((exercise) => (
                <ExerciseComponent
                  key={exercise.id}
                  exercise={exercise}
                  isCompleted={isExerciseCompleted(chapter.id, exercise.id)}
                  initialResponse={getExerciseResponse(chapter.id, exercise.id)}
                  onComplete={(responseData) => handleExerciseComplete(exercise.id, exercise.type, responseData)}
                />
              ))
            )}
          </motion.div>
        )}

        {/* Botão de Conclusão */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Concluir Capítulo
              </h3>
              <p className="text-gray-600 mb-6">
                {canCompleteChapter 
                  ? "Parabéns! Você completou todos os exercícios. Clique para finalizar este capítulo e desbloquear o próximo."
                  : `Complete todos os exercícios (${completedExercisesCount}/${chapter.exercises.length}) para finalizar este capítulo.`
                }
              </p>
              <Button
                onClick={handleCompleteChapter}
                disabled={!canCompleteChapter}
                size="lg"
                className="w-full"
              >
                {chapter.isCompleted ? '✅ Capítulo Concluído' : '🎉 Concluir Capítulo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
