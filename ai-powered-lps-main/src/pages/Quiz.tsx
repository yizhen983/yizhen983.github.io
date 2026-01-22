import { useState } from "react";
import { motion } from "framer-motion";
import { ClipboardCheck, ChevronRight, ChevronLeft, Circle, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Progress } from "@/components/ui/progress";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

// Placeholder questions - to be filled in manually
const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "[問題一：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 2,
    question: "[問題二：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 3,
    question: "[問題三：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 4,
    question: "[問題四：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 5,
    question: "[問題五：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 6,
    question: "[問題六：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 7,
    question: "[問題七：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 8,
    question: "[問題八：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 9,
    question: "[問題九：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
  {
    id: 10,
    question: "[問題十：請在此填入問題內容]",
    options: ["[選項 A]", "[選項 B]", "[選項 C]", "[選項 D]"],
    correctAnswer: 0,
  },
];

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(
    new Array(quizQuestions.length).fill(null)
  );
  const [showResults, setShowResults] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const handleSelect = (optionIndex: number) => {
    if (submitted) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setShowResults(true);
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setSelectedAnswers(new Array(quizQuestions.length).fill(null));
    setShowResults(false);
    setSubmitted(false);
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === quizQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const getOptionStyle = (optionIndex: number) => {
    const isSelected = selectedAnswers[currentQuestion] === optionIndex;
    const isCorrect = optionIndex === question.correctAnswer;
    
    if (!submitted) {
      return isSelected
        ? "border-secondary bg-secondary/10 text-foreground"
        : "border-border hover:border-secondary/50 hover:bg-muted/50";
    }

    if (isCorrect) {
      return "border-secondary bg-secondary/20 text-foreground";
    }
    if (isSelected && !isCorrect) {
      return "border-destructive bg-destructive/10 text-foreground";
    }
    return "border-border opacity-50";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
              <ClipboardCheck className="w-4 h-4" />
              自我檢測
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              課程測驗
            </h1>
            <p className="text-muted-foreground">
              測驗您對本課程內容的理解程度
            </p>
          </motion.div>

          {!showResults ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>第 {currentQuestion + 1} 題，共 {quizQuestions.length} 題</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Question Card */}
              <div className="p-8 rounded-2xl bg-card border border-border shadow-card">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  {question.question}
                </h2>

                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelect(index)}
                      disabled={submitted}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${getOptionStyle(index)}`}
                    >
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        selectedAnswers[currentQuestion] === index
                          ? 'border-secondary bg-secondary text-secondary-foreground'
                          : 'border-current'
                      }`}>
                        {submitted ? (
                          index === question.correctAnswer ? (
                            <CheckCircle2 className="w-5 h-5 text-secondary" />
                          ) : selectedAnswers[currentQuestion] === index ? (
                            <XCircle className="w-5 h-5 text-destructive" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )
                        ) : (
                          <span className="text-sm font-medium">
                            {String.fromCharCode(65 + index)}
                          </span>
                        )}
                      </div>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Dots */}
              <div className="flex justify-center gap-2 flex-wrap">
                {quizQuestions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
                      index === currentQuestion
                        ? 'bg-primary text-primary-foreground'
                        : selectedAnswers[index] !== null
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              {/* Navigation */}
              <div className="flex justify-between gap-4">
                <button
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                  className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                  上一題
                </button>

                {currentQuestion === quizQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={selectedAnswers.includes(null)}
                    className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-sage-dark transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    提交測驗
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-navy-light transition-colors flex items-center gap-2"
                  >
                    下一題
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-card border border-border shadow-card text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <ClipboardCheck className="w-10 h-10 text-secondary" />
              </div>
              
              <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                測驗完成！
              </h2>
              
              <p className="text-muted-foreground mb-8">
                您的成績
              </p>

              <div className="text-6xl font-serif font-bold text-secondary mb-2">
                {calculateScore()} / {quizQuestions.length}
              </div>
              
              <p className="text-lg text-muted-foreground mb-8">
                正確率 {Math.round((calculateScore() / quizQuestions.length) * 100)}%
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-3 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
                >
                  查看答案
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 rounded-xl bg-secondary text-secondary-foreground hover:bg-sage-dark transition-colors flex items-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  重新測驗
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Quiz;
