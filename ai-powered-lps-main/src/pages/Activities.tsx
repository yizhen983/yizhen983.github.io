import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Scale, ShoppingBag, Save, RotateCcw, CheckCircle, Mic, Upload, BookOpen, Library, AlertCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import RecordingSubmission from "@/components/RecordingSubmission";
import ReferencesSection from "@/components/ReferencesSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLessonContext } from "@/contexts/LessonContext";
interface DebateNotes {
  proArguments: string;
  conArguments: string;
  judgeComments: string;
}

interface SalesNotes {
  sellerName: string;
  attractionReasons: string;
  productConcerns: string;
  answeredConcerns: boolean | null;
  additionalNotes: string;
}

const Activities = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isParsed, isDemoMode, lessonData } = useLessonContext();
  
  const [debateNotes, setDebateNotes] = useState<DebateNotes>({
    proArguments: "",
    conArguments: "",
    judgeComments: "",
  });

  const [salesNotes, setSalesNotes] = useState<SalesNotes>({
    sellerName: "",
    attractionReasons: "",
    productConcerns: "",
    answeredConcerns: null,
    additionalNotes: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedDebate = localStorage.getItem("siliconIsland_debateNotes");
    const savedSales = localStorage.getItem("siliconIsland_salesNotes");
    
    if (savedDebate) {
      setDebateNotes(JSON.parse(savedDebate));
    }
    if (savedSales) {
      setSalesNotes(JSON.parse(savedSales));
    }
  }, []);

  const saveDebateNotes = () => {
    localStorage.setItem("siliconIsland_debateNotes", JSON.stringify(debateNotes));
    toast({
      title: "儲存成功",
      description: "辯論筆記已儲存至本機",
    });
  };

  const saveSalesNotes = () => {
    localStorage.setItem("siliconIsland_salesNotes", JSON.stringify(salesNotes));
    toast({
      title: "儲存成功",
      description: "銷售筆記已儲存至本機",
    });
  };

  const resetDebateNotes = () => {
    setDebateNotes({ proArguments: "", conArguments: "", judgeComments: "" });
    localStorage.removeItem("siliconIsland_debateNotes");
    toast({
      title: "已重置",
      description: "辯論筆記已清除",
    });
  };

  const resetSalesNotes = () => {
    setSalesNotes({
      sellerName: "",
      attractionReasons: "",
      productConcerns: "",
      answeredConcerns: null,
      additionalNotes: "",
    });
    localStorage.removeItem("siliconIsland_salesNotes");
    toast({
      title: "已重置",
      description: "銷售筆記已清除",
    });
  };

  // Get vocabulary for pronunciation practice from lesson context
  const practiceVocabulary = isParsed && lessonData 
    ? [...lessonData.dialogue.vocabulary.slice(0, 5), ...lessonData.essay.vocabulary.slice(0, 5)].slice(0, 10)
    : [];

  // Empty state when not parsed
  if (!isParsed || !lessonData) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Mic className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  課堂活動
                </h1>
                <p className="text-muted-foreground mb-6">
                  請上傳檔案或瀏覽示範課程以查看活動內容
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  上傳檔案
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  className="gap-2 bg-gold hover:bg-gold-dark text-navy"
                >
                  <BookOpen className="w-4 h-4" />
                  瀏覽示範課程
                </Button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {/* Demo Course Badge */}
            {isDemoMode && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold text-sm font-medium mb-4 border border-gold/30">
                <AlertCircle className="w-4 h-4" />
                示範課程專用活動 (Demo Course Activity Sample)
              </div>
            )}
            {!isDemoMode && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/10 text-navy text-sm font-medium mb-4">
                <Users className="w-4 h-4" />
                課室活動
              </div>
            )}
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              互動式學習活動
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              透過辯論、銷售演練與發音練習，深化對永續發展議題的理解
            </p>
          </motion.div>

          {/* Activity Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="debate" className="w-full">
              <TabsList className="w-full grid grid-cols-3 mb-8 h-14">
                <TabsTrigger value="debate" className="flex items-center gap-2 text-sm sm:text-base">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">模擬辯論賽</span>
                  <span className="sm:hidden">辯論</span>
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-2 text-sm sm:text-base">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">王牌銷售員</span>
                  <span className="sm:hidden">銷售</span>
                </TabsTrigger>
              <TabsTrigger value="pronunciation" className="flex items-center gap-2 text-sm sm:text-base">
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">生詞發音練習</span>
                  <span className="sm:hidden">發音</span>
                </TabsTrigger>
              </TabsList>

              {/* Debate Activity */}
              <TabsContent value="debate">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                      活動說明
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      學生們分成三組：一組正方，一組反方，一組為裁判。各方五分鐘，一回合共十分鐘，
                      分別用三回合，進行「半導體產業會/不會阻撓環境的發展」。以裁判方決定贏家，並進行點評。
                    </p>
                    <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30">
                      <p className="text-sm font-medium text-secondary">
                        辯論主題：半導體產業會/不會阻撓環境的發展
                      </p>
                    </div>
                  </div>

                  {/* Scoreboard */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Pro Arguments */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                          <span className="text-secondary-foreground font-bold text-sm">正</span>
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-foreground">正方論點</h4>
                      </div>
                      <Textarea
                        placeholder="記錄正方的主要論點..."
                        value={debateNotes.proArguments}
                        onChange={(e) => setDebateNotes({ ...debateNotes, proArguments: e.target.value })}
                        className="min-h-[200px] resize-none"
                      />
                    </div>

                    {/* Con Arguments */}
                    <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-sm">反</span>
                        </div>
                        <h4 className="font-serif text-lg font-semibold text-foreground">反方論點</h4>
                      </div>
                      <Textarea
                        placeholder="記錄反方的主要論點..."
                        value={debateNotes.conArguments}
                        onChange={(e) => setDebateNotes({ ...debateNotes, conArguments: e.target.value })}
                        className="min-h-[200px] resize-none"
                      />
                    </div>
                  </div>

                  {/* Judge Comments */}
                  <div className="p-6 rounded-2xl bg-card border border-border shadow-card">
                    <div className="flex items-center gap-2 mb-4">
                      <Scale className="w-5 h-5 text-secondary" />
                      <h4 className="font-serif text-lg font-semibold text-foreground">裁判講評</h4>
                    </div>
                    <Textarea
                      placeholder="記錄裁判的評論與最終決定..."
                      value={debateNotes.judgeComments}
                      onChange={(e) => setDebateNotes({ ...debateNotes, judgeComments: e.target.value })}
                      className="min-h-[150px] resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={resetDebateNotes}
                      className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </button>
                    <button
                      onClick={saveDebateNotes}
                      className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-sage-dark transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      儲存筆記
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Sales Activity */}
              <TabsContent value="sales">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-3">
                      活動說明
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      假設你為一位業務銷售人員，請向台下的潛在客戶推銷自家的晶片產品（如：手機、手錶……）。
                      如何凸顯產品優點；如何消除買家對產品的疑慮。分析半導體業的窒礙及突破關鍵。
                    </p>
                    <p className="text-sm text-muted-foreground">
                      需使用道具：投影片放映機、電腦或平板
                    </p>
                  </div>

                  {/* Sales Form */}
                  <div className="p-6 rounded-2xl bg-card border border-border shadow-card space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        銷售人員姓名
                      </label>
                      <Input
                        placeholder="輸入銷售人員姓名..."
                        value={salesNotes.sellerName}
                        onChange={(e) => setSalesNotes({ ...salesNotes, sellerName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        吸引原因
                      </label>
                      <Textarea
                        placeholder="產品有什麼吸引人的地方？..."
                        value={salesNotes.attractionReasons}
                        onChange={(e) => setSalesNotes({ ...salesNotes, attractionReasons: e.target.value })}
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        產品疑慮
                      </label>
                      <Textarea
                        placeholder="客戶對產品有什麼疑慮？..."
                        value={salesNotes.productConcerns}
                        onChange={(e) => setSalesNotes({ ...salesNotes, productConcerns: e.target.value })}
                        className="min-h-[120px] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-3">
                        此銷售人員是否解答疑惑？
                      </label>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setSalesNotes({ ...salesNotes, answeredConcerns: true })}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                            salesNotes.answeredConcerns === true
                              ? 'border-secondary bg-secondary/10 text-secondary'
                              : 'border-border hover:border-secondary/50'
                          }`}
                        >
                          <CheckCircle className="w-5 h-5" />
                          是
                        </button>
                        <button
                          onClick={() => setSalesNotes({ ...salesNotes, answeredConcerns: false })}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                            salesNotes.answeredConcerns === false
                              ? 'border-destructive bg-destructive/10 text-destructive'
                              : 'border-border hover:border-destructive/50'
                          }`}
                        >
                          否
                        </button>
                      </div>
                    </div>

                    {salesNotes.answeredConcerns === false && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                      >
                        <label className="block text-sm font-medium text-foreground mb-2">
                          原因說明
                        </label>
                        <Textarea
                          placeholder="為什麼沒有解答疑惑？..."
                          value={salesNotes.additionalNotes}
                          onChange={(e) => setSalesNotes({ ...salesNotes, additionalNotes: e.target.value })}
                          className="min-h-[100px] resize-none"
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={resetSalesNotes}
                      className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      重置
                    </button>
                    <button
                      onClick={saveSalesNotes}
                      className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-sage-dark transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      儲存筆記
                    </button>
                  </div>
                </div>
              </TabsContent>

              {/* Pronunciation Activity - Vocabulary Recording Submission */}
              <TabsContent value="pronunciation">
                <div className="space-y-6">
                  {/* Instructions */}
                  <div className="p-6 rounded-2xl bg-muted/50 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="font-serif text-lg font-semibold text-foreground">
                        生詞發音練習與檢測
                      </h3>
                      {isDemoMode && (
                        <span className="px-2 py-1 bg-gold/20 text-gold text-xs font-medium rounded-full">
                          Demo
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      錄製您對每個生詞的發音，完成後可提交給教師評分。系統會自動處理音訊，您可在提交前播放確認。
                    </p>
                  </div>

                  {/* All 10 Vocabulary Words for Recording */}
                  <div className="space-y-4">
                    {practiceVocabulary.length > 0 ? (
                      practiceVocabulary.map((vocab) => (
                        <RecordingSubmission 
                          key={vocab.word} 
                          targetText={vocab.word}
                          targetPinyin={vocab.pinyin}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Library className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>尚無生詞資料</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* References */}
          <ReferencesSection />
        </div>
      </main>
    </div>
  );
};

export default Activities;
