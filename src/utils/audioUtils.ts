/**
 * Audio utility functions to handle audio loading and playback with proper error handling
 * Prevents 416 Range Not Satisfiable errors and other audio-related issues
 */

export interface AudioOptions {
  volume?: number;
  loop?: boolean;
  preload?: boolean;
}

/**
 * Creates and loads an audio element with proper error handling
 * @param src - Audio file path
 * @param options - Audio configuration options
 * @returns Promise that resolves to the audio element or null if failed
 */
export async function createAudio(src: string, options: AudioOptions = {}): Promise<HTMLAudioElement | null> {
  try {
    const audio = new Audio();
    
    // Set audio properties
    audio.volume = options.volume ?? 0.5;
    audio.loop = options.loop ?? false;
    audio.preload = options.preload ? 'auto' : 'metadata';
    
    // Return a promise that resolves when audio is ready to play
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        audio.removeEventListener('canplaythrough', onCanPlay);
        audio.removeEventListener('error', onError);
        audio.removeEventListener('abort', onError);
      };
      
      const onCanPlay = () => {
        cleanup();
        resolve(audio);
      };
      
      const onError = (event: Event) => {
        cleanup();
        console.warn(`Audio load failed for ${src}:`, event);
        resolve(null); // Return null instead of rejecting to prevent unhandled errors
      };
      
      audio.addEventListener('canplaythrough', onCanPlay);
      audio.addEventListener('error', onError);
      audio.addEventListener('abort', onError);
      
      // Set source and start loading
      audio.src = src;
      audio.load();
      
      // Timeout after 5 seconds
      setTimeout(() => {
        cleanup();
        console.warn(`Audio load timeout for ${src}`);
        resolve(null);
      }, 5000);
    });
  } catch (error) {
    console.warn(`Audio creation failed for ${src}:`, error);
    return null;
  }
}

/**
 * Plays an audio file with proper error handling
 * @param src - Audio file path
 * @param options - Audio configuration options
 * @returns Promise that resolves when playback starts or fails gracefully
 */
export async function playAudio(src: string, options: AudioOptions = {}): Promise<void> {
  const audio = await createAudio(src, options);
  
  if (!audio) {
    console.warn(`Cannot play audio: ${src} failed to load`);
    return;
  }
  
  try {
    await audio.play();
  } catch (error) {
    console.warn(`Audio playback failed for ${src}:`, error);
  }
}

/**
 * Preloads multiple audio files
 * @param sources - Array of audio file paths
 * @param options - Audio configuration options
 * @returns Promise that resolves to a map of loaded audio elements
 */
export async function preloadAudio(sources: string[], options: AudioOptions = {}): Promise<Map<string, HTMLAudioElement>> {
  const audioMap = new Map<string, HTMLAudioElement>();
  
  const loadPromises = sources.map(async (src) => {
    const audio = await createAudio(src, { ...options, preload: true });
    if (audio) {
      audioMap.set(src, audio);
    }
  });
  
  await Promise.all(loadPromises);
  return audioMap;
}

/**
 * Audio file paths used in the application
 */
export const AUDIO_PATHS = {
  GAME_OF_THRONES: '/sounds/game-of-thrones.mp3',
  GAME_WINNING: '/sounds/game-winning.mp3',
  GAME_LOSING: '/sounds/game-losing.mp3',
  GAME_LEADERBOARD: '/sounds/game-leaderboard.mp3',
} as const;