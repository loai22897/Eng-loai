
import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { base64ToUint8Array, decodeAudioData, createPcmBlob } from '../services/audioUtils';
import { LiveConnectionState } from '../types';

export function useLiveGemini() {
  const [connectionState, setConnectionState] = useState<LiveConnectionState>('disconnected');
  const [volume, setVolume] = useState(0); 
  
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
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      const outputCtx = new AudioContextClass({ sampleRate: 24000 });
      
      inputContextRef.current = inputCtx;
      audioContextRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            const source = inputCtx.createMediaStreamSource(stream);
            sourceNodeRef.current = source;
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += inputData[i] * inputData[i];
              const rms = Math.sqrt(sum / inputData.length);
              setVolume(Math.min(rms * 5, 1));

              const pcmBlob = createPcmBlob(inputData);
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

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBytes = base64ToUint8Array(base64Audio);
              const audioBuffer = await decodeAudioData(audioBytes, outputCtx);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(src => { try { src.stop(); } catch (e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = outputCtx.currentTime;
            }
          },
          onclose: () => setConnectionState('disconnected'),
          onerror: () => setConnectionState('error')
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          },
          systemInstruction: `أنت مهندس صيانة خبير، ساعد زميلك في الميدان بصوتك بشكل فني ومختصر.`
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      setConnectionState('error');
      disconnect();
    }
  }, [connectionState]);

  const disconnect = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    if (processorRef.current) {
      processorRef.current.disconnect();
      sourceNodeRef.current?.disconnect();
    }
    if (inputContextRef.current) inputContextRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    sourcesRef.current.forEach(src => { try { src.stop(); } catch(e) {} });
    sourcesRef.current.clear();
    setConnectionState('disconnected');
    setVolume(0);
  }, []);

  useEffect(() => { return () => disconnect(); }, [disconnect]);

  return { connectionState, connect, disconnect, volume };
}
