export type SupportedLanguage = 'hi' | 'en' | 'ta' | 'te' | 'bn'

export const LANGUAGE_CONFIG: Record<SupportedLanguage, { label: string; nativeLabel: string; dir: 'ltr' | 'rtl' }> = {
  hi: { label: 'Hindi',   nativeLabel: 'हिंदी',   dir: 'ltr' },
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr' },
  ta: { label: 'Tamil',   nativeLabel: 'தமிழ்',   dir: 'ltr' },
  te: { label: 'Telugu',  nativeLabel: 'తెలుగు',  dir: 'ltr' },
  bn: { label: 'Bengali', nativeLabel: 'বাংলা',   dir: 'ltr' },
}

export type LegalDomain =
  | 'PROPERTY'
  | 'LABOR'
  | 'DOMESTIC_VIOLENCE'
  | 'CONSUMER'
  | 'TENANT'
  | 'CRIMINAL'
  | 'FAMILY'
  | 'OTHER'

export const LEGAL_DOMAIN_LABELS: Record<LegalDomain, string> = {
  PROPERTY:          'Property & Land',
  LABOR:             'Labor & Employment',
  DOMESTIC_VIOLENCE: 'Domestic Violence',
  CONSUMER:          'Consumer Rights',
  TENANT:            'Tenant Rights',
  CRIMINAL:          'Criminal Law',
  FAMILY:            'Family Law',
  OTHER:             'Other',
}

export type MessageIntent =
  | 'GREETING'
  | 'QUERY'
  | 'DOCUMENT_REQUEST'
  | 'FOLLOW_UP'
  | 'CLARIFICATION'
  | 'COMPLAINT'
  | 'UNKNOWN'

export type DocumentType =
  | 'LEGAL_NOTICE'
  | 'RTI_APPLICATION'
  | 'POLICE_COMPLAINT'
  | 'CONSUMER_COMPLAINT'
  | 'AFFIDAVIT'
  | 'RENT_AGREEMENT'

export const DOCUMENT_TYPE_CONFIG: Record<DocumentType, { label: string; description: string; icon: string }> = {
  LEGAL_NOTICE:       { label: 'Legal Notice',       description: 'Formal notice to a party before legal action', icon: '⚖️' },
  RTI_APPLICATION:    { label: 'RTI Application',    description: 'Right to Information request to government',   icon: '📋' },
  POLICE_COMPLAINT:   { label: 'Police Complaint',   description: 'Formal complaint / FIR to police',             icon: '🚔' },
  CONSUMER_COMPLAINT: { label: 'Consumer Complaint', description: 'Complaint to consumer court or NCDRC',         icon: '🛒' },
  AFFIDAVIT:          { label: 'Affidavit',          description: 'Sworn statement for legal purposes',           icon: '📝' },
  RENT_AGREEMENT:     { label: 'Rent Agreement',     description: 'Residential tenancy / lease agreement',        icon: '🏠' },
}

export type MessageRole = 'user' | 'assistant' | 'system'

export interface Message {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  audio_url?: string | null
  language: SupportedLanguage
  intent?: MessageIntent | null
  tokens_used?: number | null
  created_at: string
  isStreaming?: boolean
  error?: string | null
}

export type ConversationStatus = 'active' | 'archived' | 'deleted'

export interface Conversation {
  id: string
  user_id: string
  title: string
  status: ConversationStatus
  domain: LegalDomain | null
  summary: string | null
  created_at: string
  updated_at: string
  messages?: Message[]
  message_count?: number
}

export interface LegalDocument {
  id: string
  user_id: string
  conversation_id: string | null
  type: DocumentType
  title: string
  file_url: string | null
  data: Record<string, unknown>
  language: SupportedLanguage
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  email: string | null
  phone: string | null
  full_name: string | null
  preferred_language: SupportedLanguage
  avatar_url: string | null
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface UserPreferences {
  language: SupportedLanguage
  autoReadResponses: boolean
  theme: 'light' | 'dark' | 'system'
  voiceEnabled: boolean
}

export interface ChatState {
  messages: Message[]
  currentConversation: Conversation | null
  isLoading: boolean
  isStreaming: boolean
  isRecording: boolean
  isTranscribing: boolean
  error: string | null
}

export interface LLMResponse {
  content: string
  tokens_used: number
  language: SupportedLanguage
  intent: MessageIntent
  domain?: LegalDomain
}

export interface TranscriptionResponse {
  text: string
  language: string
  confidence: number
}

export interface DocumentGenerationRequest {
  type: DocumentType
  data: Record<string, unknown>
  language: SupportedLanguage
  conversation_id?: string
}

export interface SuggestedPrompt {
  id: string
  text: string
  language: SupportedLanguage
  domain: LegalDomain
  icon: string
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
  { id: '1', text: 'मेरे मकान मालिक ने बिना नोटिस के किराया बढ़ा दिया। मुझे क्या करना चाहिए?', language: 'hi', domain: 'TENANT',            icon: '🏠' },
  { id: '2', text: 'My employer is not paying overtime. What are my rights?',                      language: 'en', domain: 'LABOR',             icon: '👷' },
  { id: '3', text: 'मैं RTI दाखिल करना चाहता हूं। क्या प्रक्रिया है?',                           language: 'hi', domain: 'OTHER',             icon: '📋' },
  { id: '4', text: 'Online fraud में पैसे गए। FIR कैसे दर्ज करें?',                               language: 'hi', domain: 'CRIMINAL',          icon: '🚔' },
  { id: '5', text: 'Consumer complaint for defective product — how to file?',                      language: 'en', domain: 'CONSUMER',          icon: '🛒' },
  { id: '6', text: 'घरेलू हिंसा के खिलाफ कानूनी सुरक्षा क्या है?',                              language: 'hi', domain: 'DOMESTIC_VIOLENCE', icon: '🛡️' },
]
