import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload,
  FileUp,
  ArrowRight,
  Leaf,
  Cpu,
  Zap,
  Library,
  BookOpen,
  ArrowDown,
  FileText,
  Brain,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { useLessonContext } from "@/contexts/LessonContext";

// Demo content stats - only shown after entering demo mode
const demoStats = [
  { value: "TBCL", label: "Level 5", icon: Zap },
  { value: "40+", label: "核心生詞", icon: Library },
  { value: "13", label: "語法點", icon: BookOpen },
];

// SaaS product features
const productFeatures = [
  { icon: Library, label: "生詞自動提取" },
  { icon: BookOpen, label: "語法點分析" },
  { icon: Zap, label: "教學模組生成" },
];

const parsingIcons = [FileText, Brain, Sparkles, CheckCircle2];

const Index = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startParsing, parsingStep, parsingSteps } = useLessonContext();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileParsing(false, e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileParsing(false, e.target.files[0]);
    }
  };

  const handleFileParsing = async (demoMode: boolean, file?: File) => {
    setIsParsing(true);
    await startParsing(demoMode, file);
    setIsParsing(false);
    navigate("/dashboard");
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDemoClick = () => {
    handleFileParsing(true); // Demo mode - load hardcoded data
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.pdf,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Multi-step Parsing Overlay */}
      <AnimatePresence>
        {isParsing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <div className="max-w-md w-full mx-auto px-6">
              {/* Central Icon Animation */}
              <motion.div
                className="flex justify-center mb-8"
                key={parsingStep}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-24 h-24 rounded-full bg-gold/20 flex items-center justify-center">
                  {(() => {
                    const IconComponent = parsingIcons[parsingStep] || FileText;
                    return <IconComponent className="w-12 h-12 text-gold" />;
                  })()}
                </div>
              </motion.div>

              {/* Progress Steps */}
              <div className="space-y-4">
                {parsingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ 
                      opacity: index <= parsingStep ? 1 : 0.3,
                      x: 0 
                    }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      index === parsingStep 
                        ? 'bg-gold/20 border border-gold/40' 
                        : index < parsingStep 
                          ? 'bg-secondary/10' 
                          : 'bg-muted/10'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      index < parsingStep 
                        ? 'bg-secondary text-secondary-foreground' 
                        : index === parsingStep 
                          ? 'bg-gold text-navy' 
                          : 'bg-muted/30 text-muted-foreground'
                    }`}>
                      {index < parsingStep ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        index <= parsingStep ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`}>
                        {step}
                      </p>
                    </div>
                    {index === parsingStep && (
                      <motion.div
                        className="w-2 h-2 rounded-full bg-gold"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mt-8">
                <div className="h-2 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold to-secondary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((parsingStep + 1) / parsingSteps.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-primary-foreground/60 text-sm mt-3">
                  {Math.round(((parsingStep + 1) / parsingSteps.length) * 100)}% 完成
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hero Section - Editorial Cover Style */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Split Background */}
        <div className="absolute inset-0">
          {/* Left side - Tech/Semiconductor gradient */}
          <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-br from-navy via-navy-light to-primary" />
          {/* Right side - Green/Sustainability gradient */}
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-bl from-sage via-sage-dark to-secondary" />
          {/* Center blend overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-background/20 to-transparent" />
          {/* Circuit pattern overlay */}
          <div className="absolute inset-0 circuit-pattern opacity-30" />
          {/* Subtle dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-navy/60 via-transparent to-navy/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Tagline - Product Focused */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold/20 border border-gold/40"
            >
              <span className="text-sm font-medium text-gold-light tracking-wider uppercase">
                AI-Powered Teaching Preparation Platform
              </span>
            </motion.div>

            {/* Main Title - SaaS Product Style */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground leading-tight tracking-tight"
              >
                智慧華語備課系統
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="font-serif text-2xl sm:text-3xl lg:text-4xl text-gold font-medium"
              >
                AI-Powered Lesson Preparation System
              </motion.p>
            </div>

            {/* Subtitle - Product Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl sm:text-2xl text-primary-foreground/80 font-light max-w-2xl mx-auto"
            >
              一鍵生成生詞、語法與教學活動，提升備課效率
            </motion.p>

            {/* Features Row - Product Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center gap-6 pt-4"
            >
              {productFeatures.map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20"
                >
                  <feature.icon className="w-4 h-4 text-gold" />
                  <span className="text-sm text-primary-foreground/80">{feature.label}</span>
                </div>
              ))}
            </motion.div>

            {/* Action Buttons - Two Distinct Paths */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              {/* Button 1: File Upload - Ghost/Outline style */}
              <button
                onClick={handleUploadClick}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl border-2 border-gold/60 bg-transparent hover:bg-gold/10 text-gold font-semibold text-lg transition-all hover:border-gold hover:scale-105"
              >
                <Upload className="w-5 h-5" />
                檔案上傳
                <span className="text-sm font-normal opacity-70">File Upload</span>
              </button>

              {/* Button 2: Browse Demo Course - Primary Solid style (Highlighted) */}
              <button
                onClick={handleDemoClick}
                className="group inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gold hover:bg-gold-dark text-navy font-semibold text-lg transition-all shadow-lg hover:shadow-gold/30 hover:scale-105"
              >
                <BookOpen className="w-5 h-5" />
                瀏覽示範課程
                <span className="text-sm font-normal opacity-70">Browse Demo</span>
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ArrowDown className="w-6 h-6 text-primary-foreground/50" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* File Upload Section */}
      <section id="upload" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
              <Cpu className="w-4 h-4" />
              教師備課入口
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
              上傳課程資料
            </h2>
            <p className="text-muted-foreground">
              拖曳檔案或點擊下方區域，系統將自動解析並整理成教學模組
            </p>
          </motion.div>

          {/* Upload Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className={`relative p-8 sm:p-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
              isDragging
                ? "border-gold bg-gold/10"
                : "border-border hover:border-gold/50 hover:bg-muted/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadClick}
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                isDragging ? "bg-gold" : "bg-muted"
              }`}>
                {isDragging ? (
                  <FileUp className="w-8 h-8 text-navy" />
                ) : (
                  <Upload className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <p className="text-lg font-medium text-foreground mb-2">
                {isDragging ? "放開以上傳檔案" : "檔案上傳"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                支援格式：.docx, .pdf, .txt
              </p>
              <button
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold text-navy font-medium hover:bg-gold-dark transition-all"
              >
                選擇檔案
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Quick Start - Demo Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">
              或使用預設課程內容快速體驗
            </p>
            <button
              onClick={handleDemoClick}
              className="inline-flex items-center gap-2 text-gold hover:text-gold-dark font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              瀏覽示範課程
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                智慧教學輔助
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-6">
                一鍵生成教學模組
              </h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                上傳您的課程資料，系統將自動解析文本內容，運用 NLP 技術提取關鍵詞彙與語法結構，
                並生成完整的教學模組，大幅提升華語教師的備課效率。
              </p>
              <ul className="space-y-3">
                {[
                  "自動提取課文中的核心詞彙",
                  "智慧分析語法結構與句型",
                  "生成互動式教學活動",
                  "多語翻譯即時查閱",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3 text-foreground">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-elevated relative">
                {/* Split visual - Product illustration */}
                <div className="absolute inset-0 flex">
                  <div className="w-1/2 bg-gradient-to-br from-navy to-navy-light flex items-center justify-center">
                    <Cpu className="w-20 h-20 text-primary-foreground/30" />
                  </div>
                  <div className="w-1/2 bg-gradient-to-bl from-sage to-sage-dark flex items-center justify-center">
                    <Leaf className="w-20 h-20 text-secondary-foreground/30" />
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-navy/80 via-transparent to-transparent">
                  <div className="text-center text-primary-foreground">
                    <p className="text-3xl font-serif font-bold">智慧備課</p>
                    <p className="text-sm opacity-70">AI-Powered Preparation</p>
                    <div className="mt-2 inline-block px-3 py-1 bg-gold/20 rounded-full">
                      <span className="text-xs text-gold">效率 × 品質</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-background">
              <img src="/favicon.png" alt="華語教師備課系統" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif text-xl font-semibold">華語教師備課系統</span>
          </div>
          <p className="text-primary-foreground/60 text-sm">
            AI-Powered Mandarin Teacher Preparation System
          </p>
          <p className="text-primary-foreground/40 text-xs mt-4">
            © 2026 聯合大學華語文學系學生團隊
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
