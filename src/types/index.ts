export interface User {
  id: string
  email: string
  name?: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  popular?: boolean
}

export interface Chapter {
  id: number
  title: string
  subtitle: string
  description: string
  content: ChapterContent
  exercises: Exercise[]
  estimatedTime: string
  isLocked: boolean
  isCompleted: boolean
  progress: number
  icon: string
  medal_icon: string
}

export interface ChapterContent {
  summary: string
  audioUrl?: string
  sections: ContentSection[]
}

export interface ContentSection {
  id: string
  title: string
  content: string
  type: 'text' | 'quote' | 'practice' | 'reflection'
}

export interface Exercise {
  id: string
  type: 'checklist' | 'quiz' | 'reflection' | 'practice'
  title: string
  description: string
  data: any
  completed: boolean
}

export interface UserProgress {
  userId: string
  chapterId: number
  completed: boolean
  progress: number
  exercisesCompleted: string[]
  lastAccessed: Date
}

export interface MonthlyGift {
  id: number;
  month: number;
  title: string;
  description: string;
  cover_image_url: string;
  pdf_url: string;
  content: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'ebook' | 'object';
  stock: number;
}

export interface Achievement {
  id: number;
  user_id: string;
  chapter_id: number;
  achieved_at: string;
}

export interface AppNotification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  type: 'achievement' | 'reminder' | 'system';
  metadata: {
    chapter_id?: number;
    medal_icon?: string;
  }
}

export interface Purchase {
  id: string;
  product_name: string;
  purchase_date: string;
  price: number;
  status: string;
}

export interface SupportTicket {
  id: number;
  user_id: string;
  subject: string;
  message: string;
  status: 'aberto' | 'em_progresso' | 'fechado';
  created_at: string;
  updated_at: string;
}
