import os
from google.cloud import texttospeech

# Path to your service account key file
KEY_PATH = os.path.join(os.path.dirname(__file__), "keys", "tts-service-key.json")

# Set environment variable so Google Client finds the credentials automatically
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = KEY_PATH

def chunk_text(text: str, max_bytes: int = 4500):
    """
    Yields chunks of text where each chunk's UTF-8 encoded size is within max_bytes.
    Tries to split on whitespace to avoid breaking words.
    """
    words = text.split()
    current_chunk = []
    current_size = 0
    
    for word in words:
        word_size = len(word.encode('utf-8'))
        
        # If adding this word exceeds max_bytes, yield current accumulated text
        # We assume 1 byte for space/separator
        if current_size + word_size + 1 > max_bytes:
            if current_chunk:
                yield " ".join(current_chunk)
            current_chunk = [word]
            current_size = word_size + 1
        else:
            current_chunk.append(word)
            current_size += word_size + 1
            
    if current_chunk:
        yield " ".join(current_chunk)

def generate_speech(text: str, language_code: str = "en-US") -> bytes:
    """
    Synthesizes speech from the input string of text using Google Cloud TTS.
    Returns the audio content as bytes. Handles long text by chunking.
    """
    if not text or not text.strip():
        return b""

    # Instantiates a client
    client = texttospeech.TextToSpeechClient()

    # Build the voice request
    voice = texttospeech.VoiceSelectionParams(
        language_code=language_code,
        # ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL  # Optional
    )

    # Select the type of audio file you want returned
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3
    )
    
    combined_audio = b""
    
    # Process text in chunks
    for chunk in chunk_text(text):
        synthesis_input = texttospeech.SynthesisInput(text=chunk)
        
        response = client.synthesize_speech(
            input=synthesis_input, voice=voice, audio_config=audio_config
        )
        combined_audio += response.audio_content

    return combined_audio

if __name__ == "__main__":
    # Quick test
    try:
        # Test with a short string
        audio = generate_speech("Hello, this is a test.", "en-US")
        print(f"Successfully generated {len(audio)} bytes of audio.")
    except Exception as e:
        print(f"Error: {e}")
