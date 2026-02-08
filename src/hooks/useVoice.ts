import { useState, useRef, useEffect, useCallback } from "react";

interface UseVoiceReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  hasBrowserSupport: boolean;
}

export function useVoice(): UseVoiceReturn {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasBrowserSupport, setHasBrowserSupport] = useState(false);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthesisRef.current = window.speechSynthesis;
      setHasBrowserSupport(true);
    }
  }, []);

  const stop = useCallback(() => {
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthesisRef.current) return;

    // Cancel any current speech (debounced effect)
    synthesisRef.current.cancel();

    // Simple hygiene check
    if (!text.trim()) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Ensure we track start/end properly
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      // Gracefully handle interruption errors (when map changes during speech)
      if (e.error === "interrupted" || e.error === "canceled") {
        // This is expected when navigation changes - no need to log
        setIsSpeaking(false);
      } else {
        console.error("Speech error:", e.error || e);
        setIsSpeaking(false);
      }
    };

    synthesisRef.current.speak(utterance);
  }, []);

  // Cleanup on unmount to prevent zombie audio
  useEffect(() => {
    return () => {
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  return { speak, stop, isSpeaking, hasBrowserSupport };
}
