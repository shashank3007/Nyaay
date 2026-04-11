import type { LegalDomain, MessageIntent } from '@/types'

/**
 * Detect the primary legal domain from assistant response text.
 */
export function detectDomain(text: string): LegalDomain {
  const t = text.toLowerCase()
  if (/\brent\b|tenant|landlord|evict|lease|deposit/.test(t))                          return 'TENANT'
  if (/labour|labor|employee|employer|salary|overtime|dismiss|posh|wage/.test(t))       return 'LABOR'
  if (/domestic.violence|498.?a|dv act|shelter.home|महिला|घरेलू/.test(t))              return 'DOMESTIC_VIOLENCE'
  if (/consumer|refund|defective|product|ecommerce|ncdrc/.test(t))                      return 'CONSUMER'
  if (/property|land|rera|registry|title|deed|mutation/.test(t))                        return 'PROPERTY'
  if (/\bfir\b|police|criminal|bail|arrest|ipc|bnss|section.302/.test(t))              return 'CRIMINAL'
  if (/divorce|marriage|custody|maintenance|alimony|family/.test(t))                    return 'FAMILY'
  return 'OTHER'
}

/**
 * Detect the user's intent from their message.
 */
export function detectIntent(message: string): MessageIntent {
  const m = message.toLowerCase()
  if (/\bgenerate|draft|create|write\b|notice|rti|complaint\b|application/.test(m))    return 'DOCUMENT_REQUEST'
  if (/\bhello\b|hi\b|namaste|नमस्ते|vanakkam|namaskar/.test(m))                       return 'GREETING'
  if (/\?|what\b|how\b|when\b|where\b|why\b|can i|should i|क्या|कैसे|कब/.test(m))     return 'QUERY'
  if (/\bmore|explain|clarify|elaborate|tell me/.test(m))                                return 'CLARIFICATION'
  if (m.length < 20)                                                                     return 'FOLLOW_UP'
  return 'QUERY'
}
