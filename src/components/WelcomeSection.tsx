import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'

interface WelcomeSectionProps {
  onStartJourney: () => void
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ onStartJourney }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Capa do Livro */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="w-64 h-80 bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-2xl border-4 border-amber-300 overflow-hidden">
                <div className="p-6 h-full flex flex-col justify-between">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-2xl text-white">🔮</span>
                    </div>
                    <h2 className="text-xl font-bold text-purple-800 mb-2">O Toque</h2>
                    <h1 className="text-2xl font-bold text-purple-900">TÂNTRICO</h1>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-purple-700 font-medium">Uma Jornada de</p>
                    <p className="text-sm text-purple-700 font-medium">Autoconhecimento</p>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-80"
              />
            </div>
          </motion.div>

          {/* Título Principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              O Toque <span className="text-pink-300">Tântrico</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-pink-400 to-purple-400 mx-auto mb-6"></div>
          </motion.div>

          {/* Mensagem de Boas-vindas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed mb-8">
              Bem-vindo(a) a uma jornada transformadora de autoconhecimento e despertar espiritual.
            </p>
            <p className="text-lg text-purple-200 leading-relaxed mb-8">
              Cada capítulo é uma fase de evolução, uma oportunidade de aprender, crescer e viver 
              uma experiência única de conexão consigo mesmo(a) e com o sagrado.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <p className="text-purple-100 italic">
                "O tantra não é apenas uma prática, é um caminho de vida que nos convida a despertar 
                para a beleza e o sagrado em cada momento."
              </p>
            </div>
          </motion.div>

          {/* Botão Principal */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Button
              onClick={onStartJourney}
              size="lg"
              className="text-xl px-12 py-4 shadow-xl"
            >
              ✨ Começar Jornada ✨
            </Button>
          </motion.div>

          {/* Elementos Decorativos */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-10 text-4xl opacity-30"
          >
            🌙
          </motion.div>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-20 right-10 text-4xl opacity-30"
          >
            ⭐
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
