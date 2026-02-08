import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Sparkles,
  ChevronUp,
  ChevronDown,
  X,
  Volume2,
  StopCircle,
} from "lucide-react";
import type { Node } from "@/types/navigation";
import { summaryService } from "@/services/summaryService";
import { useVoice } from "@/hooks/useVoice";

interface NavigationSummaryProps {
  pathNodes: Node[];
  mapId: string;
  isLastMap: boolean;
  isVisible: boolean;
  onClose?: () => void;
}

export default function NavigationSummary({
  pathNodes,
  mapId,
  isLastMap,
  isVisible,
  onClose,
}: NavigationSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

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

        // Auto-play the voice if we got a new summary (only once per unique summary)
        if (
          text &&
          hasBrowserSupport &&
          text !== lastSpokenSummaryRef.current
        ) {
          lastSpokenSummaryRef.current = text;
          speak(text);
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [pathNodes, mapId, isLastMap, isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-6 right-4 z-40 w-full max-w-sm px-4 sm:px-0">
      <div className="bg-white/95 backdrop-blur-md border border-white/20 shadow-xl rounded-xl overflow-hidden transition-all duration-300">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-500 to-indigo-600 p-1.5 rounded-lg text-white shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <span className="font-semibold text-slate-700 text-sm flex items-center gap-1">
              AI Guide
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-black/5 rounded-md text-slate-500">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
            {onClose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1 hover:bg-red-50 hover:text-red-500 rounded-md text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 bg-white/50">
            {loading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
              </div>
            ) : summary ? (
              <div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  {summary}
                </p>
                {/* Audio Controls */}
                {hasBrowserSupport && (
                  <div className="mt-3 flex items-center gap-2">
                    {isSpeaking ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          stop();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-600 text-xs font-semibold rounded-full hover:bg-red-200 transition-colors"
                      >
                        <StopCircle className="w-3.5 h-3.5" /> Stop
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          speak(summary);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 text-xs font-semibold rounded-full hover:bg-blue-200 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Replay
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Unable to generate summary.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
