import os
import tts_service

def test_tts_long_text():
    print("Testing Google Cloud TTS Service with usage of Long Text (chunking verification)...")
    
    # 1. Check Key File
    key_path = tts_service.KEY_PATH
    if not os.path.exists(key_path):
        print(f"FAILED: Key file not found at {key_path}")
        return

    print(f"Key file found at: {key_path}")

    # 2. Try to generate speech with LONG Tamil text
    # Tamil characters are approx 3 bytes each. 2000 chars * 3 = 6000 bytes > 5000 limit.
    # We will go even larger to be safe.
    print("Generating long Tamil text...")
    sample_text = "வணக்கம் இது ஒரு சோதனை உரை. " # Hello this is a test text.
    long_text = sample_text * 500 # Should be plenty
    print(f"Text length: {len(long_text)} characters.")
    
    try:
        print(f"Calling generate_speech with long text...")
        
        audio_data = tts_service.generate_speech(long_text, "ta-IN")
        
        if not audio_data:
            print("FAILED: No audio data returned.")
            return

        print(f"SUCCESS: Generated {len(audio_data)} bytes of audio.")
        
        # Save to file
        output_file = "test_output_long.mp3"
        with open(output_file, "wb") as f:
            f.write(audio_data)
        print(f"Saved audio to {output_file}")
        
    except Exception as e:
        print(f"FAILED: Error during generation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_tts_long_text()
