/**
 * Maps readable language names to BCP-47 language codes for SpeechSynthesis.
 */
export const getLanguageCode = (languageName) => {
    const languageMap = {
        "English": "en-US",
        "Hindi": "hi-IN",
        "Tamil": "ta-IN",
        "Telugu": "te-IN",
        "Kannada": "kn-IN",
        "Malayalam": "ml-IN",
        "Marathi": "mr-IN",
        "Gujarati": "gu-IN",
        "Bengali": "bn-IN",
        "Punjabi": "pa-IN",
        "Spanish": "es-ES",
        "French": "fr-FR",
    };
    return languageMap[languageName] || "en-US";
};

/**
 * Tries to find a voice that matches the language code.
 * Falls back to the first available voice if no match is found.
 */
export const getVoiceForLanguage = (languageCode) => {
    const voices = window.speechSynthesis.getVoices();

    if (voices.length === 0) {
        console.warn("TTS: No voices available yet.");
        return null;
    }

    // 1. Precise match
    let voice = voices.find(v => v.lang === languageCode);

    // 2. Loose match (e.g., 'en' for 'en-US' or 'en-GB')
    if (!voice) {
        voice = voices.find(v => v.lang.startsWith(languageCode.split('-')[0]));
    }

    // 3. Fallback to default if available, else first voice (REMOVED)
    // We explicitly return null so that ExplanationView doesn't force an incompatible voice.
    // This allows SpeechSynthesisUtterance to use its internal language matching based on .lang property.

    return voice || null;
};
