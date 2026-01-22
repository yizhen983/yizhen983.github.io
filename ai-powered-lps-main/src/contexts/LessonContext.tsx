import { createContext, useContext, useState, ReactNode } from "react";
import { 
  dialogueContent, 
  dialogueVocabulary, 
  dialogueGrammar,
  essayContent,
  essayVocabulary,
  essayGrammar,
  dialogueReferences,
  essayReferences,
  VocabularyItem,
  GrammarPoint,
  Reference
} from "@/data/content";

interface LessonData {
  dialogue: {
    content: typeof dialogueContent;
    vocabulary: VocabularyItem[];
    grammar: GrammarPoint[];
    references: Reference[];
  };
  essay: {
    content: typeof essayContent;
    vocabulary: VocabularyItem[];
    grammar: GrammarPoint[];
    references: Reference[];
  };
}

// Empty template for upload mode
const emptyDialogueContent = {
  title: "待上傳課程",
  warmUp: [] as string[],
  characters: [] as { name: string; role: string }[],
  setting: "",
  lines: [] as { speaker: string; text: string }[],
};

const emptyEssayContent = {
  title: "待上傳課程",
  warmUp: [] as string[],
  paragraphs: [] as string[],
};

interface LessonContextType {
  isParsed: boolean;
  isParsingComplete: boolean;
  isDemoMode: boolean;
  lessonData: LessonData | null;
  parsingStep: number;
  parsingSteps: string[];
  startParsing: (demoMode?: boolean, file?: File) => Promise<void>;
  resetParsing: () => void;
}

const parsingStepsData = [
  "正在讀取檔案內容... (Reading File Content...)",
  "正在提取課文結構... (Extracting Text Structures...)",
  "正在進行生詞與語法分析... (NLP Entity Recognition...)",
  "正在生成教學模組... (Generating Modules...)",
];

const LessonContext = createContext<LessonContextType | undefined>(undefined);

export const LessonProvider = ({ children }: { children: ReactNode }) => {
  const [isParsed, setIsParsed] = useState(false);
  const [isParsingComplete, setIsParsingComplete] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [parsingStep, setParsingStep] = useState(0);

  const startParsing = async (demoMode: boolean = false, file?: File) => {
    setIsParsed(false);
    setIsParsingComplete(false);
    setIsDemoMode(demoMode);
    setParsingStep(0);

    if (demoMode) {
      // Simulate multi-step parsing with delays for demo mode
      for (let i = 0; i < parsingStepsData.length; i++) {
        setParsingStep(i);
        await new Promise(resolve => setTimeout(resolve, 1200));
      }
      
      const parsedData: LessonData = {
        dialogue: {
          content: dialogueContent,
          vocabulary: dialogueVocabulary,
          grammar: dialogueGrammar,
          references: dialogueReferences,
        },
        essay: {
          content: essayContent,
          vocabulary: essayVocabulary,
          grammar: essayGrammar,
          references: essayReferences,
        },
      };
      setLessonData(parsedData);
    } else if (file) {
      try {
        // Step 1: Reading File
        setParsingStep(0);
        const formData = new FormData();
        formData.append("file", file);

        // Step 2: Extracting (Simulated delay while fetching)
        const fetchPromise = fetch("/api/upload-lesson", {
          method: "POST",
          body: formData,
        });

        await new Promise(resolve => setTimeout(resolve, 1500));
        setParsingStep(1);
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        setParsingStep(2);

        const response = await fetchPromise;
        if (!response.ok) throw new Error("Failed to upload lesson");
        
        const data = await response.json();
        
        // Step 3: Generating
        setParsingStep(3);
        await new Promise(resolve => setTimeout(resolve, 1000));

        setLessonData(data);
      } catch (error) {
        console.error("Error parsing lesson:", error);
        // Fallback to empty template on error
        setLessonData({
          dialogue: {
            content: emptyDialogueContent as typeof dialogueContent,
            vocabulary: [],
            grammar: [],
            references: [],
          },
          essay: {
            content: emptyEssayContent as typeof essayContent,
            vocabulary: [],
            grammar: [],
            references: [],
          },
        });
      }
    }

    setIsParsed(true);
    setIsParsingComplete(true);
  };

  const resetParsing = () => {
    setIsParsed(false);
    setIsParsingComplete(false);
    setIsDemoMode(false);
    setLessonData(null);
    setParsingStep(0);
  };

  return (
    <LessonContext.Provider
      value={{
        isParsed,
        isParsingComplete,
        isDemoMode,
        lessonData,
        parsingStep,
        parsingSteps: parsingStepsData,
        startParsing,
        resetParsing,
      }}
    >
      {children}
    </LessonContext.Provider>
  );
};

export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error("useLessonContext must be used within a LessonProvider");
  }
  return context;
};
