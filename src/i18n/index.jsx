import { createContext, useContext, useState, useEffect } from 'react'
import en from './en'
import de from './de'

const translations = { en, de }

const I18nContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    // check localStorage or browser language
    const saved = localStorage.getItem('metahunter-lang')
    if (saved && translations[saved]) return saved
    
    const browserLang = navigator.language.split('-')[0]
    return translations[browserLang] ? browserLang : 'en'
  })

  useEffect(() => {
    localStorage.setItem('metahunter-lang', lang)
  }, [lang])

  const t = (key, params = {}) => {
    const keys = key.split('.')
    let value = translations[lang]
    
    for (const k of keys) {
      value = value?.[k]
    }
    
    if (typeof value !== 'string') return key
    
    // replace {param} placeholders
    return value.replace(/\{(\w+)\}/g, (_, name) => params[name] ?? `{${name}}`)
  }

  const toggleLang = () => {
    setLang(l => l === 'en' ? 'de' : 'en')
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
