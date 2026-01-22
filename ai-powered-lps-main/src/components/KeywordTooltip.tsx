import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2 } from "lucide-react";

interface KeywordData {
  word: string;
  level?: number;
  english?: string;
  japanese?: string;
  korean?: string;
  vietnamese?: string;
  example?: string;
  partOfSpeech?: string;
}

interface KeywordTooltipProps {
  keyword: KeywordData;
  children: React.ReactNode;
}

const KeywordTooltip = ({ keyword, children }: KeywordTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320; // w-80 = 20rem = 320px
      const tooltipHeight = 280; // approximate height
      
      // Calculate position - prefer above, centered
      let top = rect.top - tooltipHeight - 12; // 12px gap
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      
      // If would go above viewport, show below
      if (top < 10) {
        top = rect.bottom + 12;
      }
      
      // Keep within horizontal bounds
      if (left < 10) {
        left = 10;
      } else if (left + tooltipWidth > window.innerWidth - 10) {
        left = window.innerWidth - tooltipWidth - 10;
      }
      
      setTooltipPosition({ top, left });
    }
  }, [isVisible]);

  const tooltipContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed z-[9999] w-80"
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            pointerEvents: 'auto',
          }}
        >
          <div className="bg-card rounded-xl shadow-elevated border border-border overflow-hidden">
            <div className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-serif font-semibold text-xl text-foreground">
                    {keyword.word}
                  </h4>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(keyword.word);
                    }}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                    aria-label="發音"
                  >
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {keyword.partOfSpeech && (
                    <span className="text-xs text-muted-foreground italic">
                      {keyword.partOfSpeech}
                    </span>
                  )}
                  {keyword.level && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      keyword.level >= 7 
                        ? 'bg-navy text-primary-foreground' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      L{keyword.level}
                    </span>
                  )}
                </div>
              </div>

              {/* Multilingual Definitions */}
              <div className="space-y-1.5 text-sm bg-muted/50 rounded-lg p-3">
                {keyword.english && (
                  <p className="flex gap-2">
                    <span className="font-medium text-navy min-w-[28px]">EN</span>
                    <span className="text-foreground">{keyword.english}</span>
                  </p>
                )}
                {keyword.japanese && (
                  <p className="flex gap-2">
                    <span className="font-medium text-navy min-w-[28px]">JP</span>
                    <span className="text-foreground">{keyword.japanese}</span>
                  </p>
                )}
                {keyword.korean && (
                  <p className="flex gap-2">
                    <span className="font-medium text-navy min-w-[28px]">KR</span>
                    <span className="text-foreground">{keyword.korean}</span>
                  </p>
                )}
                {keyword.vietnamese && (
                  <p className="flex gap-2">
                    <span className="font-medium text-navy min-w-[28px]">VN</span>
                    <span className="text-foreground">{keyword.vietnamese}</span>
                  </p>
                )}
              </div>

              {/* Example */}
              {keyword.example && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">例句</p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {keyword.example}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <span
      ref={triggerRef}
      className="relative inline"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span className="border-b-2 border-secondary border-dashed cursor-help text-navy font-medium hover:text-secondary transition-colors">
        {children}
      </span>
      
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </span>
  );
};

export default KeywordTooltip;
