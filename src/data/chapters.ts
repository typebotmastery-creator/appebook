import { Chapter } from '../types'

export const chaptersData: Chapter[] = [
  {
    id: 1,
    title: "Despertar da Consciência",
    subtitle: "O primeiro passo da jornada",
    description: "Compreenda os fundamentos do tantra e desperte sua consciência interior",
    estimatedTime: "15 min",
    isLocked: false,
    isCompleted: false,
    progress: 0,
    icon: "🌅",
    content: {
      summary: "Neste primeiro capítulo, você será introduzido aos conceitos fundamentais do tantra, compreendendo que esta não é apenas uma prática, mas um caminho completo de vida que nos convida a despertar para a beleza e o sagrado em cada momento.",
      audioUrl: "/audio/chapter1.mp3",
      sections: [
        {
          id: "1-1",
          title: "O que é o Tantra?",
          content: "O tantra é uma antiga tradição espiritual que nos ensina a ver o sagrado em todas as experiências da vida. É um caminho de integração entre corpo, mente e espírito, onde cada momento se torna uma oportunidade de crescimento e conexão.",
          type: "text"
        },
        {
          id: "1-2",
          title: "Reflexão Inicial",
          content: "O tantra não é sobre técnicas sexuais, mas sobre despertar para a vida em sua totalidade. É sobre presença, consciência e amor.",
          type: "quote"
        },
        {
          id: "1-3",
          title: "Preparando o Terreno",
          content: "Antes de iniciarmos nossa jornada, é importante criar um espaço sagrado em sua vida - um momento e lugar onde você possa se conectar consigo mesmo sem distrações.",
          type: "practice"
        }
      ]
    },
    exercises: [
      {
        id: "ex1-1",
        type: "reflection",
        title: "Intenção para a Jornada",
        description: "Reflita sobre suas intenções ao iniciar esta jornada tântrica",
        data: {
          questions: [
            "O que você espera descobrir sobre si mesmo?",
            "Quais aspectos da sua vida você gostaria de transformar?",
            "Como você define espiritualidade em sua vida?"
          ]
        },
        completed: false
      },
      {
        id: "ex1-2",
        type: "practice",
        title: "Criando seu Espaço Sagrado",
        description: "Estabeleça um ambiente físico para suas práticas",
        data: {
          steps: [
            "Escolha um local tranquilo em sua casa",
            "Limpe e organize o espaço",
            "Adicione elementos que te conectem ao sagrado (velas, incenso, cristais)",
            "Estabeleça um horário regular para suas práticas"
          ]
        },
        completed: false
      }
    ]
  },
  {
    id: 2,
    title: "Respiração Sagrada",
    subtitle: "A porta de entrada para o divino",
    description: "Aprenda técnicas ancestrais de respiração para expandir sua consciência",
    estimatedTime: "20 min",
    isLocked: false,
    isCompleted: false,
    progress: 0,
    icon: "🌬️",
    content: {
      summary: "A respiração é nossa conexão mais direta com a vida. Neste capítulo, exploraremos como a respiração consciente pode ser uma ferramenta poderosa de transformação e conexão espiritual.",
      sections: [
        {
          id: "2-1",
          title: "O Poder da Respiração",
          content: "A respiração é o elo entre o consciente e o inconsciente, entre o corpo e a alma. Quando respiramos conscientemente, abrimos portas para estados ampliados de consciência.",
          type: "text"
        },
        {
          id: "2-2",
          title: "Respiração de 4 Tempos",
          content: "Inspire por 4 tempos, retenha por 4, expire por 4, pause por 4. Esta técnica equilibra o sistema nervoso e acalma a mente.",
          type: "practice"
        }
      ]
    },
    exercises: [
      {
        id: "ex2-1",
        type: "practice",
        title: "Prática da Respiração Consciente",
        description: "Pratique a respiração de 4 tempos por 10 minutos",
        data: {
          duration: "10 minutos",
          steps: [
            "Sente-se confortavelmente",
            "Feche os olhos suavemente",
            "Inspire contando até 4",
            "Retenha por 4 tempos",
            "Expire contando até 4",
            "Pause por 4 tempos",
            "Repita o ciclo"
          ]
        },
        completed: false
      }
    ]
  },
  {
    id: 3,
    title: "Energia Vital",
    subtitle: "Conhecendo sua força interior",
    description: "Descubra como sentir e direcionar sua energia vital (prana)",
    estimatedTime: "18 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "⚡",
    content: {
      summary: "A energia vital, chamada de prana, é a força que anima todas as coisas. Aprender a perceber e trabalhar com esta energia é fundamental na prática tântrica.",
      sections: [
        {
          id: "3-1",
          title: "O que é Prana?",
          content: "Prana é a energia vital que flui através de todos os seres vivos. É através da consciência do prana que podemos acessar estados mais profundos de bem-estar e conexão.",
          type: "text"
        }
      ]
    },
    exercises: []
  },
  {
    id: 4,
    title: "Conexão Profunda",
    subtitle: "Integrando corpo e espírito",
    description: "Técnicas para aprofundar a conexão consigo mesmo",
    estimatedTime: "25 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🤝",
    content: {
      summary: "A verdadeira conexão começa com você mesmo. Neste capítulo, exploraremos práticas para integrar todas as dimensões do seu ser.",
      sections: []
    },
    exercises: []
  },
  {
    id: 5,
    title: "Transcendência",
    subtitle: "Além dos limites do ego",
    description: "Práticas avançadas para transcender limitações pessoais",
    estimatedTime: "30 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🕯️",
    content: {
      summary: "A transcendência não é escapar da realidade, mas vê-la com clareza total. Aqui você aprenderá a expandir sua perspectiva além das limitações do ego.",
      sections: []
    },
    exercises: []
  },
  // Continuando com mais capítulos...
  {
    id: 6,
    title: "Chakras e Centros Energéticos",
    subtitle: "Mapeando sua anatomia energética",
    description: "Compreenda e equilibre seus centros de energia",
    estimatedTime: "22 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🌈",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 7,
    title: "Meditação Tântrica",
    subtitle: "Presença em movimento",
    description: "Técnicas específicas de meditação tântrica",
    estimatedTime: "20 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🧘",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 8,
    title: "Polaridades Sagradas",
    subtitle: "Masculino e feminino interior",
    description: "Equilibrando as energias internas",
    estimatedTime: "26 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "☯️",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 9,
    title: "Movimento Consciente",
    subtitle: "O corpo como templo",
    description: "Práticas corporais sagradas",
    estimatedTime: "24 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "💃",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 10,
    title: "Som e Vibração",
    subtitle: "A música do universo",
    description: "Mantras e sons sagrados",
    estimatedTime: "18 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🎵",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 11,
    title: "Ritual e Cerimônia",
    subtitle: "Sacralizando o cotidiano",
    description: "Criando rituais pessoais significativos",
    estimatedTime: "28 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🕯️",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 12,
    title: "Relacionamentos Conscientes",
    subtitle: "Encontro sagrado com o outro",
    description: "Levando o tantra para os relacionamentos",
    estimatedTime: "32 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "💕",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 13,
    title: "Sexualidade Sagrada",
    subtitle: "O aspecto mais íntimo do tantra",
    description: "Integrando espiritualidade e sexualidade",
    estimatedTime: "35 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🌹",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 14,
    title: "Integração na Vida Diária",
    subtitle: "Tantra além da prática",
    description: "Vivendo os princípios tântricos no cotidiano",
    estimatedTime: "25 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "🌱",
    content: { summary: "", sections: [] },
    exercises: []
  },
  {
    id: 15,
    title: "O Caminho Contínuo",
    subtitle: "Jornada sem fim",
    description: "Mantendo a prática ao longo da vida",
    estimatedTime: "20 min",
    isLocked: true,
    isCompleted: false,
    progress: 0,
    icon: "♾️",
    content: { summary: "", sections: [] },
    exercises: []
  }
]
