export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SupportedLanguage = 'hi' | 'en' | 'ta' | 'te' | 'bn'
export type ConversationStatus = 'active' | 'archived' | 'deleted'
export type MessageRole = 'user' | 'assistant' | 'system'
export type LegalDomain =
  | 'PROPERTY'
  | 'LABOR'
  | 'DOMESTIC_VIOLENCE'
  | 'CONSUMER'
  | 'TENANT'
  | 'CRIMINAL'
  | 'FAMILY'
  | 'OTHER'
export type DocumentType =
  | 'LEGAL_NOTICE'
  | 'RTI_APPLICATION'
  | 'POLICE_COMPLAINT'
  | 'CONSUMER_COMPLAINT'
  | 'AFFIDAVIT'
  | 'RENT_AGREEMENT'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          full_name: string | null
          preferred_language: SupportedLanguage
          avatar_url: string | null
          is_premium: boolean
          monthly_tokens_used: number
          tokens_month: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          preferred_language?: SupportedLanguage
          avatar_url?: string | null
          is_premium?: boolean
          monthly_tokens_used?: number
          tokens_month?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          phone?: string | null
          full_name?: string | null
          preferred_language?: SupportedLanguage
          avatar_url?: string | null
          is_premium?: boolean
          monthly_tokens_used?: number
          tokens_month?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          status: ConversationStatus
          domain: LegalDomain | null
          summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          status?: ConversationStatus
          domain?: LegalDomain | null
          summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          status?: ConversationStatus
          domain?: LegalDomain | null
          summary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          content: string
          audio_url: string | null
          language: SupportedLanguage
          intent: string | null
          tokens_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: MessageRole
          content: string
          audio_url?: string | null
          language?: SupportedLanguage
          intent?: string | null
          tokens_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: MessageRole
          content?: string
          audio_url?: string | null
          language?: SupportedLanguage
          intent?: string | null
          tokens_used?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          user_id: string
          conversation_id: string | null
          type: DocumentType
          title: string
          file_url: string | null
          data: Json
          language: SupportedLanguage
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          conversation_id?: string | null
          type: DocumentType
          title: string
          file_url?: string | null
          data?: Json
          language?: SupportedLanguage
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          conversation_id?: string | null
          type?: DocumentType
          title?: string
          file_url?: string | null
          data?: Json
          language?: SupportedLanguage
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']
