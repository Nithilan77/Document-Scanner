
import { Globe } from 'lucide-react'

export const LANGUAGES = [
    "Hindi", "English", "Tamil", "Telugu", "Kannada", "Malayalam",
    "Marathi", "Gujarati", "Bengali", "Punjabi", "Spanish", "French"
]

export default function LanguageSelector({ selectedLanguage, onLanguageChange, label, minimal = false }) {
    if (minimal) {
        return (
            <div className="relative inline-block">
                <Globe className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="pl-9 pr-8 py-1.5 bg-transparent border border-neutral-200 text-neutral-500 text-sm rounded-full appearance-none focus:outline-none focus:border-neutral-400 hover:bg-neutral-50 cursor-pointer"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-white text-neutral-800">
                            {lang}
                        </option>
                    ))}
                </select>
            </div>
        )
    }

    return (
        <div className="flex flex-col space-y-2">
            {label && (
                <label className="text-sm font-medium text-neutral-500 flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>{label}</span>
                </label>
            )}
            <div className="relative">
                <select
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="w-full bg-white border border-neutral-300 text-neutral-800 rounded-lg px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all hover:bg-neutral-50 cursor-pointer text-lg font-medium"
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-white text-neutral-800">
                            {lang}
                        </option>
                    ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
