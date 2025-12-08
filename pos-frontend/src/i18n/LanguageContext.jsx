import { createContext, useContext, useState, useEffect } from 'react'
import { translations, languages } from './translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('pos-language')
    return saved || 'uz'
  })

  useEffect(() => {
    localStorage.setItem('pos-language', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[language]

    for (const k of keys) {
      if (value && value[k]) {
        value = value[k]
      } else {
        // Fallback to English, then to key
        let fallback = translations['en']
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk]
          } else {
            return key
          }
        }
        return fallback
      }
    }

    return value
  }

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang)
    }
  }

  const currentLanguage = languages.find(l => l.code === language) || languages[0]

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage: changeLanguage,
      t,
      languages,
      currentLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export default LanguageContext
