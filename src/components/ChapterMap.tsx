import React from 'react'
import { motion } from 'framer-motion'
import { Chapter } from '../types'
import { Lock, CheckCircle, Clock, Star } from 'lucide-react'

interface ChapterMapProps {
  chapters: Chapter[]
  onChapterSelect: (chapter: Chapter) => void
}

export const ChapterMap: React.FC<ChapterMapProps> = ({ chapters, onChapterSelect }) => {
  const completedChapters = chapters.filter(ch => ch.isCompleted).length
  const totalChapters = chapters.length
  const progressPercentage = (completedChapters / totalChapters) * 100

  return (
    <div className="space-y-8">
      {/* Header com Progresso Geral */}
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Sua Jornada Tântrica
            </h2>
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-lg font-semibold text-purple-600">
                {completedChapters} de {totalChapters} capítulos
              </span>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="w-64 h-3 bg-gray-200 rounded-full mx-auto">
              <motion.div
                className="h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {progressPercentage.toFixed(0)}% completo
            </p>
          </div>
        </motion.div>
      </div>

      {/* Mapa dos Capítulos */}
      <div className="relative">
        {/* Linha de Conexão */}
        <div className="absolute left-1/2 transform -translate-x-0.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300"></div>
        
        <div className="space-y-12">
          {chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`w-full max-w-md ${index % 2 === 0 ? 'pr-8' : 'pl-8'}`}>
                <motion.div
                  whileHover={{ scale: chapter.isLocked ? 1 : 1.02 }}
                  className={`relative bg-white rounded-2xl shadow-lg p-6 cursor-pointer transition-all duration-200 ${
                    chapter.isLocked 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:shadow-xl'
                  }`}
                  onClick={() => !chapter.isLocked && onChapterSelect(chapter)}
                >
                  {/* Número do Capítulo */}
                  <div className={`absolute ${index % 2 === 0 ? '-right-4' : '-left-4'} top-6 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                    chapter.isCompleted 
                      ? 'bg-green-500' 
                      : chapter.isLocked 
                        ? 'bg-gray-400' 
                        : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {chapter.isCompleted ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : chapter.isLocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      chapter.id
                    )}
                  </div>

                  {/* Conteúdo do Card */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{chapter.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {chapter.title}
                        </h3>
                        <p className="text-purple-600 text-sm font-medium">
                          {chapter.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {chapter.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{chapter.estimatedTime}</span>
                      </div>
                      
                      {!chapter.isLocked && chapter.progress > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                              style={{ width: `${chapter.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{chapter.progress}%</span>
                        </div>
                      )}
                    </div>

                    {chapter.isLocked && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-500 text-xs text-center">
                          Complete os capítulos anteriores para desbloquear
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
