import { useState } from "react";
import { motion } from "framer-motion";
import { Volume2, RotateCcw } from "lucide-react";

interface VocabularyCardProps {
  word: string;
  level: number;
  english: string;
  partOfSpeech?: string;
  example?: string;
}

const VocabularyCard = ({ word, level, english, partOfSpeech, example }: VocabularyCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-56 perspective-1000 cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl bg-card border border-border shadow-card p-6 flex flex-col items-center justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              level === 7 
                ? "bg-navy text-primary-foreground" 
                : "bg-secondary text-secondary-foreground"
            }`}>
              Level {level}
            </span>
          </div>
          
          <h3 className="font-serif text-3xl font-bold text-foreground mb-2">
            {word}
          </h3>
          
          {partOfSpeech && (
            <span className="text-sm text-muted-foreground italic">
              {partOfSpeech}
            </span>
          )}
          
          <button className="mt-4 p-2 rounded-full hover:bg-muted transition-colors">
            <Volume2 className="w-5 h-5 text-muted-foreground" />
          </button>
          
          <p className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            點擊翻轉
          </p>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 w-full h-full rounded-xl bg-primary text-primary-foreground p-6 flex flex-col justify-center backface-hidden"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                英文釋義
              </p>
              <p className="text-lg font-medium">{english}</p>
            </div>
            
            {example && (
              <div>
                <p className="text-xs uppercase tracking-wider text-primary-foreground/60 mb-1">
                  例句
                </p>
                <p className="text-sm leading-relaxed text-primary-foreground/90">
                  {example}
                </p>
              </div>
            )}
          </div>
          
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-primary-foreground/50 flex items-center gap-1">
            <RotateCcw className="w-3 h-3" />
            點擊翻回
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VocabularyCard;
