import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";

interface TourStep {
  id: string;
  title: string;
  description: string;
  element?: string;
  path?: string;
}

const tourSteps: TourStep[] = [
  {
    id: "welcome",
    title: "歡迎使用華語教師備課系統",
    description: "這是一個專為華語教師設計的數位備課平台。讓我帶您快速了解各項功能！",
  },
  {
    id: "upload",
    title: "檔案上傳區",
    description: "在這裡上傳您的課程資料，系統會自動解析並整理成教學模組。",
    path: "/",
  },
  {
    id: "warmup",
    title: "課前暖身 (Section 1)",
    description: "顯示課前討論問題，幫助學生進入學習狀態。",
    path: "/dialogue",
  },
  {
    id: "content",
    title: "內容 (Section 2)",
    description: "會話篇與短文篇的完整內容，關鍵詞彙會自動標記，滑鼠懸停可查看多語翻譯。",
    path: "/dialogue",
  },
  {
    id: "vocabulary",
    title: "生詞庫 (Section 3)",
    description: "核心詞彙卡片，包含拼音、詞性與多語翻譯。點擊喇叭可聽發音。",
    path: "/vocabulary",
  },
  {
    id: "grammar",
    title: "語法點 (Section 4)",
    description: "重要語法結構的說明與例句，幫助學生掌握語言規則。",
    path: "/dialogue",
  },
  {
    id: "activities",
    title: "課堂活動 (Section 5)",
    description: "生詞發音練習與錄音提交功能，讓學生練習並提交給教師評分。",
    path: "/activities",
  },
];

const AISiteTour = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const startTour = () => {
    setIsTourActive(true);
    setCurrentStep(0);
    setIsOpen(false);
  };

  const endTour = () => {
    setIsTourActive(false);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepData = tourSteps[currentStep + 1];
      if (nextStepData.path && nextStepData.path !== location.pathname) {
        navigate(nextStepData.path);
      }
      setCurrentStep(currentStep + 1);
    } else {
      endTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const prevStepData = tourSteps[currentStep - 1];
      if (prevStepData.path && prevStepData.path !== location.pathname) {
        navigate(prevStepData.path);
      }
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <>
      {/* Floating AI Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
      >
        <AnimatePresence>
          {isOpen && !isTourActive && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-72 p-4 rounded-xl bg-card border border-border shadow-elevated mb-2"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-serif font-semibold text-foreground">AI 導覽助手</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                需要了解網站功能嗎？讓我帶您快速導覽各個學習區塊！
              </p>
              <Button onClick={startTour} className="w-full" size="sm">
                <Bot className="w-4 h-4 mr-2" />
                開始導覽
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-glow hover:scale-105 transition-transform flex items-center justify-center"
        >
          <Bot className="w-6 h-6" />
        </button>
      </motion.div>

      {/* Tour Overlay */}
      <AnimatePresence>
        {isTourActive && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
              onClick={endTour}
            />

            {/* Tour Card */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-md p-6 rounded-2xl bg-card border border-border shadow-elevated z-[101]"
            >
              {/* Progress */}
              <div className="flex gap-1 mb-4">
                {tourSteps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= currentStep ? "bg-secondary" : "bg-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Step Counter */}
              <p className="text-xs text-muted-foreground mb-2">
                步驟 {currentStep + 1} / {tourSteps.length}
              </p>

              {/* Content */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-serif font-semibold text-foreground mb-1">
                    {currentTourStep.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentTourStep.description}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={endTour}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4 mr-1" />
                  結束導覽
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={nextStep}>
                    {currentStep === tourSteps.length - 1 ? (
                      <>
                        完成
                        <RotateCcw className="w-4 h-4 ml-1" />
                      </>
                    ) : (
                      <>
                        下一步
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default AISiteTour;
