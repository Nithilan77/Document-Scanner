import { Globe } from 'lucide-react'
import { LANGUAGES } from './LanguageSelector'

export default function HeaderLanguageSelector({ selectedLanguage, onLanguageChange }) {
    return (
        <div className="flex items-center space-x-2 bg-neutral-800/50 border border-neutral-700 rounded-full px-3 py-1.5 hover:bg-neutral-800 transition-colors">
            <Globe className="w-4 h-4 text-indigo-400" />
            <div className="relative">
                <select
                    value={selectedLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="bg-transparent text-sm text-neutral-300 appearance-none focus:outline-none pr-6 cursor-pointer font-medium"
                    style={{ minWidth: '80px' }}
                >
                    {LANGUAGES.map((lang) => (
                        <option key={lang} value={lang} className="bg-neutral-800 text-neutral-200">
                            {lang}
                        </option>
                    ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        </div>
    )
}
