import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Exercise } from '../types'
import { Button } from './ui/Button'
import { CheckCircle, Circle, BookOpen, Brain, Heart, Activity } from 'lucide-react'

interface ExerciseComponentProps {
  exercise: Exercise
  isCompleted: boolean
  initialResponse?: any
  onComplete: (responseData: any) => void
}

export const ExerciseComponent: React.FC<ExerciseComponentProps> = ({
  exercise,
  isCompleted,
  initialResponse,
  onComplete
}) => {
  const [responses, setResponses] = useState<Record<string, any>>(initialResponse?.responses || {})
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(initialResponse?.checkedItems || {})

  // Atualizar estado quando initialResponse mudar
  useEffect(() => {
    if (initialResponse) {
      setResponses(initialResponse.responses || {})
      setCheckedItems(initialResponse.checkedItems || {})
    }
  }, [initialResponse])

  const getExerciseIcon = () => {
    switch (exercise.type) {
      case 'checklist':
        return <CheckCircle className="w-6 h-6" />
      case 'quiz':
        return <Brain className="w-6 h-6" />
      case 'reflection':
        return <Heart className="w-6 h-6" />
      case 'practice':
        return <Activity className="w-6 h-6" />
      default:
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getExerciseColor = () => {
    switch (exercise.type) {
      case 'checklist':
        return 'from-green-500 to-emerald-500'
      case 'quiz':
        return 'from-blue-500 to-indigo-500'
      case 'reflection':
        return 'from-purple-500 to-pink-500'
      case 'practice':
        return 'from-orange-500 to-red-500'
      default:
        return 'from-gray-500 to-gray-600'
    }
  }

  const handleChecklistItem = (index: number) => {
    const newCheckedItems = {
      ...checkedItems,
      [index]: !checkedItems[index]
    }
    setCheckedItems(newCheckedItems)
  }

  const handleReflectionResponse = (questionIndex: number, response: string) => {
    const newResponses = {
      ...responses,
      [questionIndex]: response
    }
    setResponses(newResponses)
  }

  const canComplete = () => {
    switch (exercise.type) {
      case 'checklist':
        return exercise.data.steps?.every((_: any, index: number) => checkedItems[index])
      case 'reflection':
        return exercise.data.questions?.every((_: any, index: number) => 
          responses[index] && responses[index].trim().length > 10
        )
      case 'practice':
        return Object.keys(checkedItems).length > 0
      case 'quiz':
        return true
      default:
        return true
    }
  }

  const handleComplete = () => {
    const responseData = {
      responses,
      checkedItems,
      completedAt: new Date().toISOString()
    }
    onComplete(responseData)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-sm border-l-4 ${
        isCompleted ? 'border-green-500' : 'border-gray-200'
      } overflow-hidden`}
    >
      {/* Header */}
      <div className={`bg-gradient-to-r ${getExerciseColor()} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getExerciseIcon()}
            <div>
              <h3 className="text-lg font-semibold">{exercise.title}</h3>
              <p className="text-white/90 text-sm">{exercise.description}</p>
            </div>
          </div>
          {isCompleted && (
            <div className="bg-white/20 rounded-full p-2">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {/* Checklist */}
        {exercise.type === 'checklist' && exercise.data.steps && (
          <div className="space-y-3">
            {exercise.data.steps.map((step: string, index: number) => (
              <div key={index} className="flex items-center space-x-3">
                <button
                  onClick={() => handleChecklistItem(index)}
                  disabled={isCompleted}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    checkedItems[index]
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-gray-300 hover:border-green-400'
                  } ${isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {checkedItems[index] && <CheckCircle className="w-3 h-3" />}
                </button>
                <label className={`text-sm ${checkedItems[index] ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                  {step}
                </label>
              </div>
            ))}
          </div>
        )}

        {/* Practice */}
        {exercise.type === 'practice' && exercise.data.steps && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Instruções:</h4>
              <ul className="space-y-2">
                {exercise.data.steps.map((step: string, index: number) => (
                  <li key={index} className="text-sm text-blue-700 flex items-center">
                    <Circle className="w-2 h-2 mr-2 fill-current" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
            {exercise.data.duration && (
              <div className="text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  ⏱️ Duração: {exercise.data.duration}
                </span>
              </div>
            )}
            <div className="text-center">
              <button
                onClick={() => handleChecklistItem(0)}
                disabled={isCompleted}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  checkedItems[0]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                } ${isCompleted ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                {checkedItems[0] ? '✅ Prática Realizada' : '🧘‍♀️ Marcar como Praticado'}
              </button>
            </div>
          </div>
        )}

        {/* Reflection */}
        {exercise.type === 'reflection' && exercise.data.questions && (
          <div className="space-y-6">
            {exercise.data.questions.map((question: string, index: number) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {index + 1}. {question}
                </label>
                <textarea
                  value={responses[index] || ''}
                  onChange={(e) => handleReflectionResponse(index, e.target.value)}
                  placeholder="Compartilhe suas reflexões..."
                  disabled={isCompleted}
                  className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px] resize-y ${
                    isCompleted ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
                <div className="text-xs text-gray-500">
                  {responses[index]?.length || 0} caracteres (mínimo 10)
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botão de Conclusão */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Button
            onClick={handleComplete}
            disabled={isCompleted || !canComplete()}
            className="w-full"
            variant={isCompleted ? 'secondary' : 'primary'}
          >
            {isCompleted ? '✅ Exercício Concluído' : '🎯 Concluir Exercício'}
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
