import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCw } from "lucide-react";
import { VocabularyItem } from "@/data/content";

interface VocabularyFlashcardProps {
  vocabulary: VocabularyItem;
}

const VocabularyFlashcard = ({ vocabulary }: VocabularyFlashcardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const speak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(vocabulary.word);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on the speaker button
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className="relative h-64 cursor-pointer perspective-1000"
      onClick={handleCardClick}
    >
      <motion.div
        className="absolute inset-0 w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-card border border-border shadow-card flex flex-col items-center justify-center p-6 backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className={`px-3 py-1 text-xs font-medium rounded-full mb-3 ${
            vocabulary.level >= 7 
              ? 'bg-navy text-primary-foreground' 
              : 'bg-secondary text-secondary-foreground'
          }`}>
            TBCL Level {vocabulary.level}
          </div>
          
          <h3 className="font-serif text-4xl font-bold text-foreground mb-1">
            {vocabulary.word}
          </h3>
          
          {/* Pinyin */}
          <p className="text-lg text-muted-foreground mb-2">
            {vocabulary.pinyin}
          </p>
          
          {vocabulary.partOfSpeech && (
            <p className="text-sm text-muted-foreground italic mb-3">
              {vocabulary.partOfSpeech}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={speak}
              className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              aria-label="發音"
            >
              <Volume2 className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <RotateCw className="w-3 h-3" />
              <span>點擊翻轉</span>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl bg-card border border-border shadow-card p-5 backface-hidden overflow-y-auto"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="space-y-3">
            {/* Pinyin on back too */}
            <div className="text-center pb-2 border-b border-border">
              <p className="text-lg font-medium text-foreground">{vocabulary.word}</p>
              <p className="text-sm text-muted-foreground">{vocabulary.pinyin}</p>
            </div>

            {/* Translations */}
            <div className="space-y-2">
              {vocabulary.english && (
                <div className="flex gap-2">
                  <span className="font-medium text-navy min-w-[32px] text-sm">EN</span>
                  <span className="text-foreground text-sm">{vocabulary.english}</span>
                </div>
              )}
              {vocabulary.japanese && (
                <div className="flex gap-2">
                  <span className="font-medium text-navy min-w-[32px] text-sm">JP</span>
                  <span className="text-foreground text-sm">{vocabulary.japanese}</span>
                </div>
              )}
              {vocabulary.korean && (
                <div className="flex gap-2">
                  <span className="font-medium text-navy min-w-[32px] text-sm">KR</span>
                  <span className="text-foreground text-sm">{vocabulary.korean}</span>
                </div>
              )}
              {vocabulary.vietnamese && (
                <div className="flex gap-2">
                  <span className="font-medium text-navy min-w-[32px] text-sm">VN</span>
                  <span className="text-foreground text-sm">{vocabulary.vietnamese}</span>
                </div>
              )}
            </div>

            {/* Example */}
            {vocabulary.example && (
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1 font-medium">例句</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {vocabulary.example}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VocabularyFlashcard;
