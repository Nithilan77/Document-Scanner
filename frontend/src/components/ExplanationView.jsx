
import { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { BookOpen, AlertTriangle, ShieldCheck, FileText, Info, Volume2, PauseCircle, StopCircle, Loader2 } from 'lucide-react'
import { translations } from '../utils/translations'
import { generateAudio } from '../api'

export default function ExplanationView({ explanation, relatedLaws, loading, language, uiLanguage }) {
    const t = translations[uiLanguage] || translations['English']
    const [isPlaying, setIsPlaying] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [isAudioLoading, setIsAudioLoading] = useState(false)

    // We use a ref to keep track of the current Audio object
    const audioRef = useRef(null)

    // Reset TTS when explanation/language changes
    useEffect(() => {
        handleStop()
    }, [explanation, language])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
    }, [])

    const handlePlay = async () => {
        // If we are paused and have an audio object, just resume
        if (isPaused && audioRef.current) {
            audioRef.current.play()
            setIsPlaying(true)
            setIsPaused(false)
            return
        }

        // If already playing, do nothing (or could stop and restart)
        if (isPlaying) return

        try {
            setIsAudioLoading(true)

            // Strip markdown symbols for cleaner speech
            const cleanText = explanation.replace(/[#*`_]/g, '')

            // 1. Fetch Audio from Backend
            const audioBlob = await generateAudio(cleanText, language)

            // 2. Create Audio URL
            const audioUrl = URL.createObjectURL(audioBlob)

            // 3. Setup Audio Object
            if (audioRef.current) {
                audioRef.current.pause()
            }
            const audio = new Audio(audioUrl)
            audioRef.current = audio

            // 4. Event Listeners
            audio.onended = () => {
                setIsPlaying(false)
                setIsPaused(false)
                URL.revokeObjectURL(audioUrl) // Cleanup
            }

            audio.onerror = (e) => {
                console.error("Audio playback error", e)
                setIsPlaying(false)
                setIsAudioLoading(false)
            }

            // 5. Play
            await audio.play()
            setIsPlaying(true)
            setIsPaused(false)

        } catch (err) {
            console.error("Failed to generate or play audio", err)
            // Ideally show a toast or error message
        } finally {
            setIsAudioLoading(false)
        }
    }

    const handlePause = () => {
        if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause()
            setIsPaused(true)
            setIsPlaying(false)
        }
    }

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            // Optional: revoke url immediately if we stored it
        }
        setIsPlaying(false)
        setIsPaused(false)
        setIsAudioLoading(false)
    }

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-6 py-12">
                <div className="relative w-20 h-20">
                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full animate-ping"></div>
                    <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
                <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium text-white">{t.analyzingTitle}</h3>
                    <p className="text-neutral-400 text-sm">{t.analyzingDesc}</p>
                </div>
            </div>
        )
    }

    if (!explanation) {
        return null
    }

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* AI Explanation Card */}
            <div className="paper-card p-8 md:p-10 relative overflow-hidden">
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-green-600"></div>

                <div className="flex items-center justify-between mb-8 pb-6 border-b border-neutral-100">
                    <div className="flex items-center space-x-4">
                        <div className="bg-green-50 p-2.5 rounded-full ring-1 ring-green-100">
                            <FileText className="w-6 h-6 text-green-700" />
                        </div>
                        <h3 className="text-2xl font-serif text-neutral-800 tracking-tight">{t.analysisTitle}</h3>
                    </div>

                    {/* TTS Controls */}
                    <div className="flex items-center space-x-2 bg-neutral-50 rounded-full p-1 border border-neutral-200">
                        {!isPlaying && !isPaused && (
                            <button
                                onClick={handlePlay}
                                disabled={isAudioLoading}
                                className="p-2 rounded-full hover:bg-white text-neutral-600 hover:text-green-700 transition-colors hover:shadow-sm disabled:opacity-50"
                                title="Read aloud"
                            >
                                {isAudioLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                ) : (
                                    <Volume2 className="w-5 h-5" />
                                )}
                            </button>
                        )}
                        {isPlaying && (
                            <button
                                onClick={handlePause}
                                className="p-2 rounded-full hover:bg-white text-amber-600 transition-colors hover:shadow-sm"
                                title="Pause"
                            >
                                <PauseCircle className="w-5 h-5" />
                            </button>
                        )}
                        {isPaused && (
                            <button
                                onClick={handlePlay}
                                className="p-2 rounded-full hover:bg-white text-green-700 transition-colors hover:shadow-sm"
                                title="Resume"
                            >
                                <Volume2 className="w-5 h-5" />
                            </button>
                        )}
                        {(isPlaying || isPaused) && (
                            <button
                                onClick={handleStop}
                                className="p-2 rounded-full hover:bg-white text-red-500 transition-colors hover:shadow-sm"
                                title="Stop"
                            >
                                <StopCircle className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="prose prose-lg prose-neutral max-w-none text-neutral-600 font-sans leading-relaxed">
                    <ReactMarkdown
                        components={{
                            h1: ({ node, ...props }) => <h3 className="text-2xl font-serif text-neutral-900 mb-4 mt-8" {...props} />,
                            h2: ({ node, ...props }) => <h4 className="text-xl font-serif text-neutral-800 mt-8 mb-4 border-l-4 border-green-500 pl-4" {...props} />,
                            h3: ({ node, ...props }) => <h5 className="text-lg font-bold text-neutral-800 mt-6 mb-3" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 space-y-2 mb-6" {...props} />,
                            li: ({ node, ...props }) => <li className="marker:text-green-500 pl-1" {...props} />,
                            strong: ({ node, ...props }) => <strong className="text-neutral-900 font-semibold bg-green-50 px-1 rounded" {...props} />,
                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-green-200 pl-4 py-2 italic text-neutral-500 bg-neutral-50 rounded-r-lg my-6 pr-4" {...props} />,
                        }}
                    >
                        {explanation}
                    </ReactMarkdown>
                </div>
            </div>

            {/* RAG Context Card */}
            {relatedLaws && relatedLaws.length > 0 && (
                <div className="paper-card p-6 md:p-8 border-l-4 border-l-amber-400">
                    <div className="flex items-center space-x-3 mb-4">
                        <BookOpen className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-neutral-800">{t.legalContextTitle}</h3>
                    </div>

                    <div className="space-y-3">
                        {relatedLaws.map((law, index) => (
                            <div key={index} className="flex gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100/50">
                                <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-neutral-700 leading-relaxed font-medium">{law}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
