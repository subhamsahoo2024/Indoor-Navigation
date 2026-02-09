import { useState, useEffect, useRef } from "react";
import type { Node } from "@/types/navigation";
import { summaryService } from "@/services/summaryService";
import { useVoice } from "@/hooks/useVoice";

interface NavigationSummaryProps {
  pathNodes: Node[];
  mapId: string;
  isLastMap: boolean;
  isVisible: boolean;
  onVoiceControlsReady?: (controls: {
    speak: (text: string) => void;
    stop: () => void;
    isSpeaking: boolean;
    hasBrowserSupport: boolean;
    currentSummary: string | null;
  }) => void;
}

export default function NavigationSummary({
  pathNodes,
  mapId,
  isLastMap,
  isVisible,
  onVoiceControlsReady,
}: NavigationSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Custom TTS Hook
  const { speak, stop, isSpeaking, hasBrowserSupport } = useVoice();

  // Use ref to track if we've already fetched for current params
  const lastFetchKeyRef = useRef<string>("");

  // Use ref to track if we've already spoken this specific summary
  const lastSpokenSummaryRef = useRef<string>("");

  // Stop speaking if component unmounts or map changes
  useEffect(() => {
    return () => stop();
  }, [stop, mapId]);

  useEffect(() => {
    if (!isVisible || pathNodes.length < 2) return;

    // Create a unique key for this fetch to prevent duplicate calls
    const nodeIds = pathNodes.map((n) => n.id).join("-");
    const fetchKey = `${mapId}_${nodeIds}_${isLastMap}`;

    // Skip if we already fetched for these exact params
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }

    lastFetchKeyRef.current = fetchKey;

    // Reset UI state when map changes
    setSummary(null);
    setLoading(true);
    stop(); // Stop any previous speech

    const fetchSummary = async () => {
      try {
        const text = await summaryService.fetchSummary({
          nodes: pathNodes,
          mapId,
          isLastMap,
        });
        setSummary(text);
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [pathNodes, mapId, isLastMap, isVisible, stop]);

  // Separate effect for auto-playing when summary is ready
  useEffect(() => {
    if (!summary || !hasBrowserSupport) return;

    // Auto-play the voice if we got a new summary (only once per unique summary)
    if (summary !== lastSpokenSummaryRef.current) {
      lastSpokenSummaryRef.current = summary;
      // Small delay to ensure browser is ready
      setTimeout(() => {
        speak(summary);
      }, 100);
    }
  }, [summary, speak, hasBrowserSupport]);

  // Send voice controls to parent whenever they change
  useEffect(() => {
    if (onVoiceControlsReady) {
      onVoiceControlsReady({
        speak,
        stop,
        isSpeaking,
        hasBrowserSupport,
        currentSummary: summary,
      });
    }
  }, [
    speak,
    stop,
    isSpeaking,
    hasBrowserSupport,
    summary,
    onVoiceControlsReady,
  ]);

  // This component is now headless - no UI rendered
  return null;
}
