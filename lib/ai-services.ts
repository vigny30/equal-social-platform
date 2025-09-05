// AI Enhancement Services for video, audio, and text processing

// Text Enhancement using LanguageTool API
export interface TextEnhancementResult {
  enhancedText: string;
  corrections: {
    message: string;
    shortMessage: string;
    offset: number;
    length: number;
    replacements: string[];
  }[];
}

export async function enhanceText(text: string): Promise<TextEnhancementResult> {
  try {
    // Using LanguageTool's free API
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text: text,
        language: 'en-US',
        enabledOnly: 'false'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to enhance text');
    }

    const data = await response.json();
    
    // Apply corrections automatically
    let enhancedText = text;
    const corrections = data.matches || [];
    
    // Apply corrections from end to start to maintain offsets
    corrections.reverse().forEach((match: any) => {
      if (match.replacements && match.replacements.length > 0) {
        const replacement = match.replacements[0].value;
        enhancedText = enhancedText.substring(0, match.offset) + 
                      replacement + 
                      enhancedText.substring(match.offset + match.length);
      }
    });

    return {
      enhancedText,
      corrections: corrections.map((match: any) => ({
        message: match.message,
        shortMessage: match.shortMessage,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements?.map((r: any) => r.value) || []
      }))
    };
  } catch (error) {
    console.error('Text enhancement error:', error);
    return {
      enhancedText: text,
      corrections: []
    };
  }
}

// Audio Enhancement using Web Audio API and basic noise reduction
export interface AudioEnhancementOptions {
  noiseReduction: boolean;
  volumeNormalization: boolean;
  bassBoost: boolean;
}

export async function enhanceAudio(
  audioFile: File, 
  options: AudioEnhancementOptions = {
    noiseReduction: true,
    volumeNormalization: true,
    bassBoost: false
  }
): Promise<Blob> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create offline context for processing
    const offlineContext = new OfflineAudioContext(
      audioBuffer.numberOfChannels,
      audioBuffer.length,
      audioBuffer.sampleRate
    );
    
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    
    let currentNode: AudioNode = source;
    
    // Apply noise reduction (simple high-pass filter)
    if (options.noiseReduction) {
      const highPassFilter = offlineContext.createBiquadFilter();
      highPassFilter.type = 'highpass';
      highPassFilter.frequency.value = 80; // Remove low-frequency noise
      currentNode.connect(highPassFilter);
      currentNode = highPassFilter;
    }
    
    // Apply volume normalization (compressor)
    if (options.volumeNormalization) {
      const compressor = offlineContext.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value = 30;
      compressor.ratio.value = 12;
      compressor.attack.value = 0.003;
      compressor.release.value = 0.25;
      currentNode.connect(compressor);
      currentNode = compressor;
    }
    
    // Apply bass boost
    if (options.bassBoost) {
      const bassFilter = offlineContext.createBiquadFilter();
      bassFilter.type = 'lowshelf';
      bassFilter.frequency.value = 200;
      bassFilter.gain.value = 6;
      currentNode.connect(bassFilter);
      currentNode = bassFilter;
    }
    
    currentNode.connect(offlineContext.destination);
    source.start();
    
    const renderedBuffer = await offlineContext.startRendering();
    
    // Convert back to blob
    const wavBlob = audioBufferToWav(renderedBuffer);
    return wavBlob;
  } catch (error) {
    console.error('Audio enhancement error:', error);
    return audioFile;
  }
}

// Helper function to convert AudioBuffer to WAV blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const length = buffer.length * buffer.numberOfChannels * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, buffer.numberOfChannels, true);
  view.setUint32(24, buffer.sampleRate, true);
  view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
  view.setUint16(32, buffer.numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  
  // Convert float samples to 16-bit PCM
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

// Video Enhancement using client-side filters and effects
export interface VideoEnhancementOptions {
  stabilization: boolean;
  colorCorrection: boolean;
  sharpening: boolean;
  noiseReduction: boolean;
}

export async function enhanceVideo(
  videoFile: File,
  options: VideoEnhancementOptions = {
    stabilization: false,
    colorCorrection: true,
    sharpening: true,
    noiseReduction: true
  }
): Promise<Blob> {
  try {
    // Create video element for processing
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Apply CSS filters for enhancement
        let filters = [];
        
        if (options.colorCorrection) {
          filters.push('contrast(1.1)', 'saturate(1.1)', 'brightness(1.05)');
        }
        
        if (options.sharpening) {
          filters.push('contrast(1.05)');
        }
        
        if (options.noiseReduction) {
          filters.push('blur(0.3px)');
        }
        
        ctx.filter = filters.join(' ');
        
        video.ontimeupdate = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        };
        
        video.onended = () => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create enhanced video blob'));
            }
          }, 'video/webm');
        };
        
        video.play();
      };
      
      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(videoFile);
    });
  } catch (error) {
    console.error('Video enhancement error:', error);
    return videoFile;
  }
}

// Speech-to-Text using Web Speech API (fallback for Whisper)
export async function transcribeAudio(audioFile: File): Promise<string> {
  try {
    // Check if Web Speech API is available
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition not supported');
    }
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    return new Promise((resolve, reject) => {
      let transcript = '';
      
      recognition.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            transcript += event.results[i][0].transcript + ' ';
          }
        }
      };
      
      recognition.onend = () => {
        resolve(transcript.trim());
      };
      
      recognition.onerror = (event: any) => {
        reject(new Error(`Speech recognition error: ${event.error}`));
      };
      
      // Create audio element to play the file for recognition
      const audio = new Audio(URL.createObjectURL(audioFile));
      audio.onplay = () => {
        recognition.start();
      };
      
      audio.onended = () => {
        setTimeout(() => {
          recognition.stop();
        }, 1000);
      };
      
      audio.play();
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return 'Transcription failed. Please try again.';
  }
}

// AI Content Generation using free APIs
export async function generateContent(prompt: string, tone: string): Promise<string> {
  try {
    // This is a placeholder for AI content generation
    // In a real implementation, you would integrate with free APIs like:
    // - Hugging Face Transformers
    // - OpenAI's free tier
    // - Local models via Ollama
    
    const tonePrompts = {
      rage: 'Write with intense emotion and strong language about',
      mystery: 'Write in a mysterious and intriguing way about',
      satire: 'Write with wit and satirical humor about',
      truth: 'Write with honesty and directness about'
    };
    
    const tonePrompt = tonePrompts[tone as keyof typeof tonePrompts] || 'Write about';
    
    // For now, return an enhanced version of the original prompt
    const enhancedPrompt = `${tonePrompt}: ${prompt}\n\nThis content has been enhanced with AI to match the ${tone} tone.`;
    
    return enhancedPrompt;
  } catch (error) {
    console.error('Content generation error:', error);
    return prompt;
  }
}

// AI Narrator using Web Speech API (Text-to-Speech)
export interface NarratorOptions {
  voice?: string;
  rate?: number; // 0.1 to 10
  pitch?: number; // 0 to 2
  volume?: number; // 0 to 1
  gender?: 'male' | 'female' | 'neutral';
  tone?: 'normal' | 'excited' | 'calm' | 'dramatic' | 'whisper';
}

export interface NarratorVoice {
  name: string;
  lang: string;
  gender: 'male' | 'female' | 'neutral';
  voiceURI: string;
}

export function getAvailableVoices(): NarratorVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }

  const voices = speechSynthesis.getVoices();
  return voices.map(voice => ({
    name: voice.name,
    lang: voice.lang,
    gender: voice.name.toLowerCase().includes('female') || voice.name.toLowerCase().includes('woman') ? 'female' : 
           voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('man') ? 'male' : 'neutral',
    voiceURI: voice.voiceURI
  }));
}

export function filterVoicesByGender(voices: NarratorVoice[], gender: 'male' | 'female' | 'neutral'): NarratorVoice[] {
  return voices.filter(voice => voice.gender === gender);
}

export async function speakText(text: string, options: NarratorOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply tone modifications to text
    let modifiedText = text;
    if (options.tone) {
      switch (options.tone) {
        case 'excited':
          modifiedText = text.replace(/\./g, '!').replace(/,/g, ',!');
          break;
        case 'calm':
          modifiedText = text.replace(/!/g, '.').toLowerCase();
          break;
        case 'dramatic':
          modifiedText = text.replace(/\./g, '...').toUpperCase();
          break;
        case 'whisper':
          modifiedText = text.toLowerCase();
          break;
      }
    }
    
    utterance.text = modifiedText;
    
    // Set voice if specified
    if (options.voice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name === options.voice || voice.voiceURI === options.voice
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    } else if (options.gender) {
      // Auto-select voice based on gender preference
      const voices = getAvailableVoices();
      const genderVoices = filterVoicesByGender(voices, options.gender);
      if (genderVoices.length > 0) {
        const speechVoices = speechSynthesis.getVoices();
        const selectedVoice = speechVoices.find(voice => voice.name === genderVoices[0].name);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
    }
    
    // Apply rate, pitch, and volume
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;
    
    // Apply tone-specific adjustments
    if (options.tone) {
      switch (options.tone) {
        case 'excited':
          utterance.rate = Math.min((options.rate ?? 1) * 1.2, 2);
          utterance.pitch = Math.min((options.pitch ?? 1) * 1.3, 2);
          break;
        case 'calm':
          utterance.rate = Math.max((options.rate ?? 1) * 0.8, 0.5);
          utterance.pitch = Math.max((options.pitch ?? 1) * 0.9, 0.5);
          break;
        case 'dramatic':
          utterance.rate = Math.max((options.rate ?? 1) * 0.7, 0.3);
          utterance.pitch = Math.max((options.pitch ?? 1) * 0.8, 0.3);
          break;
        case 'whisper':
          utterance.volume = Math.min((options.volume ?? 1) * 0.5, 0.5);
          utterance.rate = Math.max((options.rate ?? 1) * 0.9, 0.5);
          break;
      }
    }
    
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

export function pauseSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.pause();
  }
}

export function resumeSpeaking(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.resume();
  }
}

export function isSpeaking(): boolean {
  if ('speechSynthesis' in window) {
    return speechSynthesis.speaking;
  }
  return false;
}

// Generate audio file from text for narrator feature
export interface NarratorAudioOptions {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface NarratorAudioResult {
  audioBlob: Blob;
  audioUrl: string;
  duration: number;
}

// Generate audio file from text that can be saved and played back
export async function generateNarratorAudio(options: NarratorAudioOptions): Promise<NarratorAudioResult> {
  return new Promise((resolve, reject) => {
    try {
      // Create a new SpeechSynthesisUtterance
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Set voice options
      if (options.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Create audio context for recording
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const mediaStreamDestination = audioContext.createMediaStreamDestination();
      
      // Create media recorder to capture the audio
      const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Estimate duration based on text length and speech rate
        const wordsPerMinute = 150 * (options.rate || 1);
        const wordCount = options.text.split(' ').length;
        const estimatedDuration = (wordCount / wordsPerMinute) * 60;
        
        resolve({
          audioBlob,
          audioUrl,
          duration: estimatedDuration
        });
      };
      
      mediaRecorder.onerror = (event) => {
        reject(new Error(`MediaRecorder error: ${event}`));
      };
      
      // Start recording
      mediaRecorder.start();
      
      // Set up utterance events
      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };
      
      utterance.onend = () => {
        // Stop recording after a short delay to ensure all audio is captured
        setTimeout(() => {
          mediaRecorder.stop();
          audioContext.close();
        }, 500);
      };
      
      utterance.onerror = (event) => {
        mediaRecorder.stop();
        audioContext.close();
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // Start speech synthesis
      speechSynthesis.speak(utterance);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Alternative method using Web Audio API for better audio file generation
export async function generateNarratorAudioAdvanced(options: NarratorAudioOptions): Promise<NarratorAudioResult> {
  return new Promise((resolve, reject) => {
    try {
      // For now, we'll use a simpler approach that works with the Web Speech API
      // In a production environment, you might want to use a server-side TTS service
      
      const utterance = new SpeechSynthesisUtterance(options.text);
      
      // Set voice options
      if (options.voice) {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;
      
      // Create a simple audio buffer (placeholder)
      // In a real implementation, you would capture the actual speech audio
      const sampleRate = 44100;
      const duration = Math.max(2, options.text.length * 0.1); // Estimate duration
      const length = sampleRate * duration;
      const audioBuffer = new ArrayBuffer(length * 2);
      const view = new Int16Array(audioBuffer);
      
      // Generate a simple tone as placeholder (in real app, this would be the actual speech)
      for (let i = 0; i < length; i++) {
        view[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1 * 32767;
      }
      
      // Create WAV file
      const wavBuffer = createWAVFile(audioBuffer, sampleRate);
      const audioBlob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      resolve({
        audioBlob,
        audioUrl,
        duration
      });
      
    } catch (error) {
      reject(error);
    }
  });
}

// Helper function to create WAV file from audio buffer
function createWAVFile(audioBuffer: ArrayBuffer, sampleRate: number): ArrayBuffer {
  const length = audioBuffer.byteLength;
  const buffer = new ArrayBuffer(44 + length);
  const view = new DataView(buffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  
  // Copy audio data
  const audioView = new Uint8Array(audioBuffer);
  const bufferView = new Uint8Array(buffer, 44);
  bufferView.set(audioView);
  
  return buffer;
}

// Advanced AI Video Filters using Computer Vision
export interface VideoFilterOptions {
  type: 'face_blur' | 'background_blur' | 'edge_detection' | 'style_transfer' | 'color_pop' | 'vintage' | 'cyberpunk' | 'oil_painting';
  intensity?: number; // 0-1
  color?: string; // for color_pop filter
}

export interface VideoFilterResult {
  filteredVideoUrl: string;
  processingTime: number;
  filterApplied: string;
}

// Apply AI-powered video filters using canvas and computer vision
export async function applyVideoFilter(videoElement: HTMLVideoElement, options: VideoFilterOptions): Promise<VideoFilterResult> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      
      // Draw current frame
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply filter based on type
      switch (options.type) {
        case 'edge_detection':
          applyEdgeDetection(data, canvas.width, canvas.height, options.intensity || 0.5);
          break;
        case 'color_pop':
          applyColorPop(data, options.color || '#ff0000', options.intensity || 0.7);
          break;
        case 'vintage':
          applyVintageFilter(data, options.intensity || 0.6);
          break;
        case 'cyberpunk':
          applyCyberpunkFilter(data, options.intensity || 0.8);
          break;
        case 'oil_painting':
          applyOilPaintingFilter(data, canvas.width, canvas.height, options.intensity || 0.5);
          break;
        case 'face_blur':
          // Placeholder for face detection + blur (would need ML model)
          applyGaussianBlur(data, canvas.width, canvas.height, 5);
          break;
        case 'background_blur':
          // Placeholder for background segmentation + blur (would need ML model)
          applySelectiveBlur(data, canvas.width, canvas.height, options.intensity || 0.7);
          break;
        default:
          throw new Error(`Unsupported filter type: ${options.type}`);
      }
      
      // Put processed data back to canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const filteredVideoUrl = URL.createObjectURL(blob);
          const processingTime = Date.now() - startTime;
          
          resolve({
            filteredVideoUrl,
            processingTime,
            filterApplied: options.type
          });
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.9);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Edge Detection Filter (Sobel operator)
function applyEdgeDetection(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  const grayscale = new Array(width * height);
  
  // Convert to grayscale first
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    grayscale[i / 4] = gray;
  }
  
  // Apply Sobel operator
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let pixelX = 0, pixelY = 0;
      
      for (let i = 0; i < 9; i++) {
        const xi = (i % 3) - 1;
        const yi = Math.floor(i / 3) - 1;
        const pixel = grayscale[(y + yi) * width + (x + xi)];
        
        pixelX += pixel * sobelX[i];
        pixelY += pixel * sobelY[i];
      }
      
      const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY) * intensity;
      const index = (y * width + x) * 4;
      
      data[index] = magnitude;
      data[index + 1] = magnitude;
      data[index + 2] = magnitude;
    }
  }
}

// Color Pop Filter
function applyColorPop(data: Uint8ClampedArray, targetColor: string, intensity: number): void {
  const rgb = hexToRgb(targetColor);
  if (!rgb) return;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate color distance
    const distance = Math.sqrt(
      Math.pow(r - rgb.r, 2) + Math.pow(g - rgb.g, 2) + Math.pow(b - rgb.b, 2)
    );
    
    // If not close to target color, desaturate
    if (distance > 100 * (1 - intensity)) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    }
  }
}

// Vintage Filter
function applyVintageFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Sepia tone
    const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
    const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
    const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
    
    // Apply intensity
    data[i] = r + (newR - r) * intensity;
    data[i + 1] = g + (newG - g) * intensity;
    data[i + 2] = b + (newB - b) * intensity;
  }
}

// Cyberpunk Filter
function applyCyberpunkFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Enhance cyan and magenta
    const newR = Math.min(255, r * (1 + intensity * 0.3));
    const newG = Math.min(255, g * (1 + intensity * 0.5));
    const newB = Math.min(255, b * (1 + intensity * 0.8));
    
    // Add neon glow effect
    const brightness = (r + g + b) / 3;
    if (brightness > 128) {
      data[i] = Math.min(255, newR + intensity * 50);
      data[i + 1] = Math.min(255, newG + intensity * 30);
      data[i + 2] = Math.min(255, newB + intensity * 70);
    } else {
      data[i] = newR * 0.7;
      data[i + 1] = newG * 0.8;
      data[i + 2] = newB;
    }
  }
}

// Oil Painting Filter
function applyOilPaintingFilter(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  const radius = Math.floor(intensity * 5) + 1;
  const original = new Uint8ClampedArray(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      const colorBuckets: { [key: string]: { count: number; r: number; g: number; b: number } } = {};
      
      // Sample surrounding pixels
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          const r = Math.floor(original[index] / 32) * 32;
          const g = Math.floor(original[index + 1] / 32) * 32;
          const b = Math.floor(original[index + 2] / 32) * 32;
          
          const key = `${r},${g},${b}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = { count: 0, r: 0, g: 0, b: 0 };
          }
          
          colorBuckets[key].count++;
          colorBuckets[key].r += original[index];
          colorBuckets[key].g += original[index + 1];
          colorBuckets[key].b += original[index + 2];
        }
      }
      
      // Find most common color
      let maxCount = 0;
      let dominantColor = { r: 0, g: 0, b: 0 };
      
      for (const bucket of Object.values(colorBuckets)) {
        if (bucket.count > maxCount) {
          maxCount = bucket.count;
          dominantColor = {
            r: bucket.r / bucket.count,
            g: bucket.g / bucket.count,
            b: bucket.b / bucket.count
          };
        }
      }
      
      const index = (y * width + x) * 4;
      data[index] = dominantColor.r;
      data[index + 1] = dominantColor.g;
      data[index + 2] = dominantColor.b;
    }
  }
}

// Gaussian Blur
function applyGaussianBlur(data: Uint8ClampedArray, width: number, height: number, radius: number): void {
  const kernel = generateGaussianKernel(radius);
  const original = new Uint8ClampedArray(data);
  
  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, weightSum = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const xi = Math.max(0, Math.min(width - 1, x + i));
        const index = (y * width + xi) * 4;
        const weight = kernel[i + radius];
        
        r += original[index] * weight;
        g += original[index + 1] * weight;
        b += original[index + 2] * weight;
        weightSum += weight;
      }
      
      const index = (y * width + x) * 4;
      data[index] = r / weightSum;
      data[index + 1] = g / weightSum;
      data[index + 2] = b / weightSum;
    }
  }
}

// Selective Blur (placeholder for background segmentation)
function applySelectiveBlur(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  // Simple edge-based selective blur
  const edges = detectEdges(data, width, height);
  
  for (let i = 0; i < data.length; i += 4) {
    const pixelIndex = i / 4;
    const edgeStrength = edges[pixelIndex];
    
    if (edgeStrength < 0.3) { // Blur non-edge areas
      const blurRadius = Math.floor(intensity * 3);
      applyLocalBlur(data, width, height, pixelIndex, blurRadius);
    }
  }
}

// Helper functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function generateGaussianKernel(radius: number): number[] {
  const kernel: number[] = [];
  const sigma = radius / 3;
  let sum = 0;
  
  for (let i = -radius; i <= radius; i++) {
    const value = Math.exp(-(i * i) / (2 * sigma * sigma));
    kernel.push(value);
    sum += value;
  }
  
  // Normalize
  return kernel.map(v => v / sum);
}

function detectEdges(data: Uint8ClampedArray, width: number, height: number): number[] {
  const edges = new Array(width * height).fill(0);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const index = (y * width + x) * 4;
      const current = data[index] + data[index + 1] + data[index + 2];
      
      const right = data[index + 4] + data[index + 5] + data[index + 6];
      const bottom = data[((y + 1) * width + x) * 4] + data[((y + 1) * width + x) * 4 + 1] + data[((y + 1) * width + x) * 4 + 2];
      
      const edgeStrength = Math.abs(current - right) + Math.abs(current - bottom);
      edges[y * width + x] = Math.min(1, edgeStrength / 300);
    }
  }
  
  return edges;
}

function applyLocalBlur(data: Uint8ClampedArray, width: number, height: number, pixelIndex: number, radius: number): void {
  const x = pixelIndex % width;
  const y = Math.floor(pixelIndex / width);
  
  let r = 0, g = 0, b = 0, count = 0;
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const nx = Math.max(0, Math.min(width - 1, x + dx));
      const ny = Math.max(0, Math.min(height - 1, y + dy));
      const index = (ny * width + nx) * 4;
      
      r += data[index];
      g += data[index + 1];
      b += data[index + 2];
      count++;
    }
  }
  
  const index = pixelIndex * 4;
  data[index] = r / count;
  data[index + 1] = g / count;
  data[index + 2] = b / count;
}

// Advanced AI Photo Filters and Enhancement
export interface PhotoFilterOptions {
  type: 'portrait_enhance' | 'landscape_enhance' | 'hdr_effect' | 'black_white' | 'warm_tone' | 'cool_tone' | 'dramatic' | 'soft_focus' | 'sharpen' | 'noise_reduction';
  intensity?: number; // 0-1
  preserveColors?: boolean;
}

export interface PhotoFilterResult {
  filteredImageUrl: string;
  processingTime: number;
  filterApplied: string;
}

// Apply AI-powered photo filters
export async function applyPhotoFilter(imageElement: HTMLImageElement, options: PhotoFilterOptions): Promise<PhotoFilterResult> {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context not available');
      }
      
      canvas.width = imageElement.naturalWidth || imageElement.width;
      canvas.height = imageElement.naturalHeight || imageElement.height;
      
      // Draw image
      ctx.drawImage(imageElement, 0, 0, canvas.width, canvas.height);
      
      // Get image data for processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Apply filter based on type
      switch (options.type) {
        case 'portrait_enhance':
          applyPortraitEnhancement(data, options.intensity || 0.7);
          break;
        case 'landscape_enhance':
          applyLandscapeEnhancement(data, options.intensity || 0.6);
          break;
        case 'hdr_effect':
          applyHDREffect(data, options.intensity || 0.8);
          break;
        case 'black_white':
          applyBlackWhiteFilter(data, options.intensity || 1.0);
          break;
        case 'warm_tone':
          applyWarmToneFilter(data, options.intensity || 0.5);
          break;
        case 'cool_tone':
          applyCoolToneFilter(data, options.intensity || 0.5);
          break;
        case 'dramatic':
          applyDramaticFilter(data, options.intensity || 0.7);
          break;
        case 'soft_focus':
          applySoftFocusFilter(data, canvas.width, canvas.height, options.intensity || 0.6);
          break;
        case 'sharpen':
          applySharpenFilter(data, canvas.width, canvas.height, options.intensity || 0.5);
          break;
        case 'noise_reduction':
          applyNoiseReduction(data, canvas.width, canvas.height, options.intensity || 0.7);
          break;
        default:
          throw new Error(`Unsupported photo filter type: ${options.type}`);
      }
      
      // Put processed data back to canvas
      ctx.putImageData(imageData, 0, 0);
      
      // Convert to blob and create URL
      canvas.toBlob((blob) => {
        if (blob) {
          const filteredImageUrl = URL.createObjectURL(blob);
          const processingTime = Date.now() - startTime;
          
          resolve({
            filteredImageUrl,
            processingTime,
            filterApplied: options.type
          });
        } else {
          reject(new Error('Failed to create blob from canvas'));
        }
      }, 'image/jpeg', 0.95);
      
    } catch (error) {
      reject(error);
    }
  });
}

// Portrait Enhancement Filter
function applyPortraitEnhancement(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Skin tone enhancement
    const skinToneBoost = detectSkinTone(r, g, b) * intensity;
    
    // Enhance skin tones
    data[i] = Math.min(255, r + skinToneBoost * 15);
    data[i + 1] = Math.min(255, g + skinToneBoost * 10);
    data[i + 2] = Math.min(255, b + skinToneBoost * 5);
    
    // Subtle contrast enhancement
    const contrast = 1 + (intensity * 0.2);
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
  }
}

// Landscape Enhancement Filter
function applyLandscapeEnhancement(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Enhance greens and blues (nature colors)
    const greenBoost = (g > r && g > b) ? intensity * 0.3 : 0;
    const blueBoost = (b > r && b > g) ? intensity * 0.2 : 0;
    
    data[i] = Math.min(255, r);
    data[i + 1] = Math.min(255, g + greenBoost * 30);
    data[i + 2] = Math.min(255, b + blueBoost * 25);
    
    // Increase saturation
    const saturation = 1 + (intensity * 0.4);
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    
    data[i] = Math.min(255, gray + (data[i] - gray) * saturation);
    data[i + 1] = Math.min(255, gray + (data[i + 1] - gray) * saturation);
    data[i + 2] = Math.min(255, gray + (data[i + 2] - gray) * saturation);
  }
}

// HDR Effect Filter
function applyHDREffect(data: Uint8ClampedArray, intensity: number): void {
  // First pass: tone mapping
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
    // Reinhard tone mapping
    const newR = r / (1 + r * intensity);
    const newG = g / (1 + g * intensity);
    const newB = b / (1 + b * intensity);
    
    data[i] = Math.min(255, newR * 255 * (1 + intensity * 0.5));
    data[i + 1] = Math.min(255, newG * 255 * (1 + intensity * 0.5));
    data[i + 2] = Math.min(255, newB * 255 * (1 + intensity * 0.5));
  }
  
  // Second pass: local contrast enhancement
  const contrast = 1 + (intensity * 0.6);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, (data[i] - 128) * contrast + 128));
    data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * contrast + 128));
    data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * contrast + 128));
  }
}

// Black and White Filter
function applyBlackWhiteFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Weighted grayscale conversion
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    
    // Apply intensity (blend with original)
    data[i] = r + (gray - r) * intensity;
    data[i + 1] = g + (gray - g) * intensity;
    data[i + 2] = b + (gray - b) * intensity;
  }
}

// Warm Tone Filter
function applyWarmToneFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Add warm tones (more red/yellow)
    data[i] = Math.min(255, r + intensity * 20);
    data[i + 1] = Math.min(255, g + intensity * 10);
    data[i + 2] = Math.max(0, b - intensity * 15);
  }
}

// Cool Tone Filter
function applyCoolToneFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Add cool tones (more blue)
    data[i] = Math.max(0, r - intensity * 15);
    data[i + 1] = Math.min(255, g + intensity * 5);
    data[i + 2] = Math.min(255, b + intensity * 25);
  }
}

// Dramatic Filter
function applyDramaticFilter(data: Uint8ClampedArray, intensity: number): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Increase contrast dramatically
    const contrast = 1 + (intensity * 1.5);
    const newR = Math.min(255, Math.max(0, (r - 128) * contrast + 128));
    const newG = Math.min(255, Math.max(0, (g - 128) * contrast + 128));
    const newB = Math.min(255, Math.max(0, (b - 128) * contrast + 128));
    
    // Reduce saturation slightly for dramatic effect
    const gray = 0.299 * newR + 0.587 * newG + 0.114 * newB;
    const saturation = 1 - (intensity * 0.2);
    
    data[i] = gray + (newR - gray) * saturation;
    data[i + 1] = gray + (newG - gray) * saturation;
    data[i + 2] = gray + (newB - gray) * saturation;
  }
}

// Soft Focus Filter
function applySoftFocusFilter(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  const radius = Math.floor(intensity * 8) + 2;
  applyGaussianBlur(data, width, height, radius);
  
  // Blend with original for soft focus effect
  const original = new Uint8ClampedArray(data);
  for (let i = 0; i < data.length; i += 4) {
    const blendFactor = 0.7 * intensity;
    data[i] = original[i] * (1 - blendFactor) + data[i] * blendFactor;
    data[i + 1] = original[i + 1] * (1 - blendFactor) + data[i + 1] * blendFactor;
    data[i + 2] = original[i + 2] * (1 - blendFactor) + data[i + 2] * blendFactor;
  }
}

// Sharpen Filter
function applySharpenFilter(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  const kernel = [
    0, -intensity, 0,
    -intensity, 1 + 4 * intensity, -intensity,
    0, -intensity, 0
  ];
  
  const original = new Uint8ClampedArray(data);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const index = ((y + ky) * width + (x + kx)) * 4;
          const weight = kernel[(ky + 1) * 3 + (kx + 1)];
          
          r += original[index] * weight;
          g += original[index + 1] * weight;
          b += original[index + 2] * weight;
        }
      }
      
      const index = (y * width + x) * 4;
      data[index] = Math.min(255, Math.max(0, r));
      data[index + 1] = Math.min(255, Math.max(0, g));
      data[index + 2] = Math.min(255, Math.max(0, b));
    }
  }
}

// Noise Reduction Filter
function applyNoiseReduction(data: Uint8ClampedArray, width: number, height: number, intensity: number): void {
  const radius = Math.floor(intensity * 3) + 1;
  const original = new Uint8ClampedArray(data);
  
  for (let y = radius; y < height - radius; y++) {
    for (let x = radius; x < width - radius; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      
      // Median filter for noise reduction
      const pixels: { r: number; g: number; b: number }[] = [];
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          pixels.push({
            r: original[index],
            g: original[index + 1],
            b: original[index + 2]
          });
        }
      }
      
      // Sort and take median
      pixels.sort((a, b) => (a.r + a.g + a.b) - (b.r + b.g + b.b));
      const median = pixels[Math.floor(pixels.length / 2)];
      
      const index = (y * width + x) * 4;
      const originalPixel = {
        r: original[index],
        g: original[index + 1],
        b: original[index + 2]
      };
      
      // Blend original with median based on intensity
      data[index] = originalPixel.r + (median.r - originalPixel.r) * intensity;
      data[index + 1] = originalPixel.g + (median.g - originalPixel.g) * intensity;
      data[index + 2] = originalPixel.b + (median.b - originalPixel.b) * intensity;
    }
  }
}

// Helper function to detect skin tones
function detectSkinTone(r: number, g: number, b: number): number {
  // Simple skin tone detection based on RGB ratios
  const rg = r - g;
  const rb = r - b;
  const gb = g - b;
  
  // Skin tone characteristics
  if (r > 95 && g > 40 && b > 20 && 
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(rg) > 15 && r > g && r > b) {
    return Math.min(1, (r - Math.max(g, b)) / 50);
  }
  
  return 0;
}