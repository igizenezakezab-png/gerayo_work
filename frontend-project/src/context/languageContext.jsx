import { createContext, useContext, useState } from 'react'
import translations from '../translations'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en')

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'rw' : 'en'))

  const t = (key) => translations[lang][key] || key
  const tt = (key) => translations[lang === 'en' ? 'rw' : 'en'][key] || key
  const th = (key) => `${translations.en[key] || key} / ${translations.rw[key] || key}`

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, tt, th }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
