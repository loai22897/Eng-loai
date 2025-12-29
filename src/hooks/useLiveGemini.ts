import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, decodeAudioData, createPcmBlob } from '../services/audioUtils';
import { LiveConnectionState } from '../types';

export function useLiveGemini() {
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('disconnected');
  const [volume, setVolume] = useState(0); // For visualization
  
  // Refs for audio context and processing to avoid re-renders
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const connect = useCallback(async () => {
    if (connectionState === 'connected' || connectionState === 'connecting') return;
    
    try {
      setConnectionState('connecting');

      // Re-create AI instance right before connection per guidelines
      // Always use process.env.API_KEY as the exclusive source
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // Initialize Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      // Get Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Gemini Live Connected');
            setConnectionState('connected');

            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            
            // ScriptProcessor for raw PCM access
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Calculate volume for visualization
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) {
                sum += inputData[i] * inputData[i];
              }
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1)); // Amplify a bit for visual

              const pcmBlob = createPcmBlob(inputData);
              // CRITICAL: Solely rely on sessionPromise resolves to prevent race conditions
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const outputCtx = audioContextRef.current;
            if (!outputCtx) return;

            // Handle Audio Output
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBytes = base64ToUint8Array(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, outputCtx);
              
              // Schedule playback
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });

              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              console.log('Interrupted');
              sourcesRef.current.forEach(src => {
                try { src.stop(); } catch (e) {}
              });
              sourcesRef.current.clear();
              nextStartTimeRef.current = outputCtx.currentTime;
            }
          },
          onclose: () => {
            console.log('Gemini Live Closed');
            setConnectionState('disconnected');
          },
          onerror: (err) => {
            console.error('Gemini Live Error', err);
            setConnectionState('error');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `
            أنت مهندس صيانة طابعات خبير تتحدث مع زميل لك في الميدان عبر الصوت.
            الأسلوب:
            - احترافي، لطيف، وعملي جداً (Colleague-to-Colleague).
            - استخدم لغة عربية بيضاء واضحة ومفهومة.
            - استخدم المصطلحات الإنجليزية التقنية (Fuser, Pickup Roller, Firmware) بشكل طبيعي.
            - كن مختصراً في الكلام لأن هذا اتصال صوتي مباشر، لكن قدم معلومة دقيقة.
            - استخدم عبارات مثل: "يا هندسة"، "خلينا نجرب"، "غالباً المشكلة في...".
            - الهدف: المساعدة في تشخيص العطل خطوة بخطوة بشكل تفاعلي.
          `
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (err) {
      console.error("Connection failed", err);
      setConnectionState('error');
      disconnect();
    }
  }, [connectionState]);

  const disconnect = useCallback(() => {
    // Stop tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Disconnect audio nodes
    if (processorRef.current && inputContextRef.current) {
      processorRef.current.disconnect();
      sourceNodeRef.current?.disconnect();
      processorRef.current = null;
      sourceNodeRef.current = null;
    }

    // Close contexts
    if (inputContextRef.current) {
      inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Stop all playing sources
    sourcesRef.current.forEach(src => {
      try { src.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();

    if (sessionPromiseRef.current) {
        sessionPromiseRef.current.then(session => {
            if (session && typeof session.close === 'function') {
                session.close();
            }
        }).catch(() => {}); 
    }

    setConnectionState('disconnected');
    setVolume(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connectionState,
    connect,
    disconnect,
    volume
  };
}
