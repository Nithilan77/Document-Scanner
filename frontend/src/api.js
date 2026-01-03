
import axios from 'axios'

const API_base = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

export const uploadFile = async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axios.post(`${API_base}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
}

export const analyzeDocument = async (filename, language) => {
    const response = await axios.post(`${API_base}/analyze`, {
        filename,
        language
    })
    return response.data
}

export const generateAudio = async (text, language) => {
    const response = await axios.post(`${API_base}/tts`, {
        text,
        language
    }, {
        responseType: 'blob' // Important: Expect binary audio data
    })
    return response.data
}
