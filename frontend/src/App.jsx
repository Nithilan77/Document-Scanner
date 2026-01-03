
import { useState } from 'react'
import { FileText, AlertCircle, Sparkles, Camera } from 'lucide-react'
import FileUpload from './components/FileUpload'
import Scanner from './components/Scanner'
import LanguageSelector from './components/LanguageSelector'
import Navbar from './components/Navbar'
import ExplanationView from './components/ExplanationView'
import { uploadFile, analyzeDocument } from './api'
import { translations } from './utils/translations'

function App() {
  const [file, setFile] = useState(null)
  const [showScanner, setShowScanner] = useState(false)
  const [language, setLanguage] = useState('Hindi') // Explanation Language
  const [uiLanguage, setUiLanguage] = useState('English') // UI Language
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile)
    setResult(null)
    setError(null)
  }

  const t = translations[uiLanguage] || translations['English']

  const handleAnalyze = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 1. Upload
      const uploadResp = await uploadFile(file)
      // Robustly handle both forward and backslashes
      const serverFilename = uploadResp.path.split(/[/\\]/).pop()

      // 2. Analyze
      const analysisResp = await analyzeDocument(serverFilename, language)
      setResult(analysisResp)
    } catch (err) {
      console.error("Full Error Object:", err)
      const errorMsg = err.response?.data?.detail || err.message || t.errorGeneric
      const finalError = typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : String(errorMsg)
      setError(finalError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pb-20 bg-neutral-50/50">
      <Navbar t={t} />

      {showScanner && (
        <Scanner
          onScan={(scannedFile) => {
            handleFileSelect(scannedFile)
            setShowScanner(false)
          }}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Simplified, editorial header */}
      <header className="max-w-3xl mx-auto pt-12 pb-8 px-6 text-center">
        {/* Icon moved to Navbar */}
        <h1 className="text-4xl md:text-5xl font-serif text-neutral-900 mb-4 tracking-tight">
          {t.heroTitle} <span className="text-green-600">{t.heroTitleHighlight}</span>
        </h1>
        <p className="text-lg text-neutral-600 font-sans max-w-xl mx-auto leading-relaxed">
          {t.heroDescription}
        </p>
      </header>

      <main className="max-w-3xl mx-auto px-6 space-y-8">

        {/* Step 1: Input Area - Designed as a single "Paper" task */}
        <div className="paper-card p-8 md:p-10">
          <div className="space-y-8">

            {/* 1. Upload */}
            <div className="space-y-4 transition-opacity duration-300">
              <label className="block text-lg font-serif font-medium text-neutral-800">
                {t.step1}
              </label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <FileUpload
                    onFileSelect={handleFileSelect}
                    selectedFile={file}
                    error={null} // Validation handled locally for now
                  />
                </div>
                <button
                  onClick={() => setShowScanner(true)}
                  className="btn-secondary flex items-center justify-center space-x-2 h-auto py-6 md:py-0 md:w-1/3 border border-neutral-300 shadow-sm bg-white hover:bg-neutral-50"
                >
                  <Camera className="w-5 h-5" />
                  <span>{t.scanButton}</span>
                </button>
              </div>
            </div>

            {/* 2. Language Selection */}
            {file && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-500">
                <hr className="border-neutral-100" />
                <label className="block text-lg font-serif font-medium text-neutral-800">
                  {t.step2}
                </label>
                <LanguageSelector
                  selectedLanguage={language}
                  onLanguageChange={setLanguage}
                  label={null} // Label handled above
                />
              </div>
            )}

            {/* 3. Action Button */}
            {file && (
              <div className="pt-4 animate-in slide-in-from-bottom-2 fade-in duration-700 delay-100">
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full btn-primary text-lg py-4 shadow-lg shadow-green-900/10 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{t.processing}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.analyzeButton}</span>
                    </>
                  )}
                </button>
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100 flex items-start space-x-3 text-sm">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Results Area - Editorial / Letter style */}
        {(result || loading) && (
          <div className="relative">
            {/* Connector Line */}
            <div className="absolute left-1/2 -top-8 bottom-0 w-px bg-neutral-200 -z-10 hidden md:block"></div>

            <ExplanationView
              explanation={result?.explanation}
              relatedLaws={result?.related_laws}
              loading={loading}
              language={language}
              uiLanguage={uiLanguage}
            />
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="flex justify-center items-center space-x-6 mb-8 text-neutral-400">
          <div className="flex items-center space-x-2">
            <LanguageSelector
              selectedLanguage={uiLanguage}
              onLanguageChange={setUiLanguage}
              minimal={true}
            />
          </div>
        </div>
        <p className="text-neutral-400 text-sm">
          We do not store your documents. Data is processed securely and deleted immediately.
        </p>
      </footer>

    </div>
  )
}

export default App
