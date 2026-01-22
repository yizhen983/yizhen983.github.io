import { motion } from "framer-motion";
import { 
  FileText, 
  Library, 
  BookOpen, 
  Mic,
  ExternalLink,
  MessageCircle,
  Upload,
  AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import KeywordTooltip from "@/components/KeywordTooltip";
import VocabularyFlashcard from "@/components/VocabularyFlashcard";
import RecordingSubmission from "@/components/RecordingSubmission";
import { VocabularyItem } from "@/data/content";
import { useLessonContext } from "@/contexts/LessonContext";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// APA Reference component with hanging indent
const APAReference = ({ author, year, title, source, url }: { 
  author: string; 
  year: string; 
  title: string; 
  source?: string;
  url: string;
}) => (
  <p className="text-xs text-muted-foreground leading-relaxed pl-8 -indent-8 mb-2">
    {author}. ({year}). <em>{title}</em>.{source && ` ${source}.`}{" "}
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="text-gold hover:text-gold-dark break-all"
    >
      {url}
    </a>
  </p>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isParsed, isDemoMode, lessonData } = useLessonContext();

  // If not parsed, show empty state
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
                <AlertCircle className="w-12 h-12 text-muted-foreground" />
              </div>
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
                  尚未上傳教材
                </h1>
                <p className="text-muted-foreground mb-6">
                  請先上傳課程檔案，系統將自動解析並生成教學模組
                </p>
              </div>
              <Button
                onClick={() => navigate("/")}
                className="gap-2 bg-gold hover:bg-gold-dark text-navy"
              >
                <Upload className="w-4 h-4" />
                返回上傳頁面
              </Button>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // Check if content is empty (upload mode with no real data)
  const hasDialogueContent = lessonData.dialogue.content.lines && lessonData.dialogue.content.lines.length > 0;
  const hasEssayContent = lessonData.essay.content.paragraphs && lessonData.essay.content.paragraphs.length > 0;
  const hasVocabulary = (lessonData.dialogue.vocabulary && lessonData.dialogue.vocabulary.length > 0) || 
                        (lessonData.essay.vocabulary && lessonData.essay.vocabulary.length > 0);
  const hasGrammar = (lessonData.dialogue.grammar && lessonData.dialogue.grammar.length > 0) || 
                     (lessonData.essay.grammar && lessonData.essay.grammar.length > 0);
  const hasContent = hasDialogueContent || hasEssayContent || hasVocabulary || hasGrammar;

  // Get all vocabulary (10 words) for Module 4
  const allVocabulary = [
    ...lessonData.dialogue.vocabulary.slice(0, 5),
    ...lessonData.essay.vocabulary.slice(0, 5),
  ].slice(0, 10);

  // Combined grammar
  const allGrammar = [
    ...lessonData.dialogue.grammar.slice(0, 2),
    ...lessonData.essay.grammar.slice(0, 2),
  ];

  // Create keyword map for highlighting
  const keywordMap: Record<string, VocabularyItem> = {};
  [...lessonData.dialogue.vocabulary, ...lessonData.essay.vocabulary].forEach(v => {
    keywordMap[v.word] = v;
  });

  const highlightKeywords = (text: string) => {
    const keywords = Object.keys(keywordMap);
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
    const regex = new RegExp(`(${sortedKeywords.join('|')})`, 'g');
    
    let match;
    const allMatches: { index: number; word: string }[] = [];
    
    while ((match = regex.exec(text)) !== null) {
      allMatches.push({ index: match.index, word: match[0] });
    }
    
    allMatches.forEach((m, i) => {
      if (m.index > lastIndex) {
        parts.push(text.slice(lastIndex, m.index));
      }
      const keyword = keywordMap[m.word];
      parts.push(
        <KeywordTooltip key={`${m.word}-${i}`} keyword={keyword}>
          {m.word}
        </KeywordTooltip>
      );
      lastIndex = m.index + m.word.length;
    });
    
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    
    return parts.length > 0 ? parts : text;
  };

  // Removed the "Technical development in progress" block to allow real content display
  // If no content is found after parsing, we still show the dashboard but it might look empty
  // The user can always go back and upload again.

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header - Demo Mode shows Silicon Island details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            {isDemoMode && (
              <>
                {/* Demo Lesson Title */}
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-3">
                  矽島的抉擇——在半導體與水田之間
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  永續發展下的產業挑戰
                </p>
                {/* Demo Stats Tags */}
                <div className="flex flex-wrap justify-center gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium">
                    TBCL Level 5
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
                    Advanced Business Mandarin
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy/10 text-navy text-sm font-medium">
                    40+ Core Vocab
                  </span>
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-muted text-muted-foreground text-sm font-medium">
                    13 Grammar Points
                  </span>
                </div>
              </>
            )}
            {!isDemoMode && (
              <>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 text-gold text-sm font-medium mb-4">
                  自訂課程
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">
                  教學模組總覽
                </h1>
                <p className="text-muted-foreground">
                  {lessonData.dialogue.content.title}
                </p>
              </>
            )}
          </motion.div>

          {/* Accordion Sections - 4 Teaching Modules */}
          <Accordion type="multiple" defaultValue={["content"]} className="space-y-4">
            {/* Module 1: 課文學習 (Content Learning) */}
            <AccordionItem value="content" id="content" className="border border-border rounded-xl overflow-visible bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-semibold text-foreground">📖 課文學習</h2>
                    <p className="text-sm text-muted-foreground">Content Learning</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 overflow-visible">
                {/* Silicon Island Theme Banner - Only in Demo Mode */}
                {isDemoMode && (
                  <div className="mb-6 p-6 rounded-xl bg-gradient-to-r from-secondary via-secondary/90 to-sage border border-secondary/30 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-bold text-secondary-foreground">
                          矽島台灣 永續×創新
                        </h3>
                        <p className="text-sm text-secondary-foreground/80">
                          Silicon Island Taiwan: Sustainability × Innovation
                        </p>
                        <p className="text-secondary-foreground/70">
                          本課探討半導體產業在環境永續下的挑戰與抉擇。
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-foreground/20 text-secondary-foreground text-xs font-medium">
                          TBCL Level 5
                        </span>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary-foreground/20 text-secondary-foreground text-xs font-medium">
                          情境主題：科技、環境
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Tabs for Conversation / Short Passage */}
                <Tabs defaultValue="conversation" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="conversation" className="gap-2">
                      <MessageCircle className="w-4 h-4" />
                      會話篇
                    </TabsTrigger>
                    <TabsTrigger value="passage" className="gap-2">
                      <FileText className="w-4 h-4" />
                      短文篇
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Tab A: Conversation */}
                  <TabsContent value="conversation" className="mt-0">
                    <div className="rounded-xl border border-gold/20 bg-gold/5 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-gold text-navy rounded-full text-sm font-bold">A</span>
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          會話篇 - {lessonData.dialogue.content.title}
                        </h3>
                      </div>
                      
                      <div className="space-y-4 mb-6">
                        {lessonData.dialogue.content.lines.slice(0, 8).map((line, index) => (
                          <div key={index} className="pl-4 border-l-2 border-gold/40">
                            <p className="text-sm font-medium text-gold mb-1">{line.speaker}：</p>
                            <p className="text-foreground leading-relaxed">
                              {highlightKeywords(line.text)}
                            </p>
                          </div>
                        ))}
                        <div className="text-center py-4">
                          <Link 
                            to="/dialogue" 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors text-sm font-medium"
                          >
                            查看完整對話
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      
                      {/* APA References - Conversation */}
                      <div className="p-4 rounded-lg bg-background border-l-4 border-gold">
                        <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">參考資料 (References)</p>
                        {lessonData.dialogue.references.map((ref) => (
                          <APAReference 
                            key={ref.id}
                            author={ref.author}
                            year={ref.year}
                            title={ref.title}
                            source={ref.source}
                            url={ref.url}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Tab B: Short Passage */}
                  <TabsContent value="passage" className="mt-0">
                    <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-bold">B</span>
                        <h3 className="font-serif text-lg font-semibold text-foreground">
                          短文篇 - {lessonData.essay.content.title}
                        </h3>
                      </div>
                      
                      <div className="mb-6 space-y-4">
                        {lessonData.essay.content.paragraphs.slice(0, 2).map((para, index) => (
                          <p key={index} className="text-foreground leading-loose indent-8">
                            {highlightKeywords(para)}
                          </p>
                        ))}
                        <div className="text-center py-4">
                          <Link 
                            to="/essay" 
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors text-sm font-medium"
                          >
                            查看完整短文
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                      
                      {/* APA References - Passage */}
                      <div className="p-4 rounded-lg bg-background border-l-4 border-secondary">
                        <p className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">參考資料 (References)</p>
                        {lessonData.essay.references.map((ref) => (
                          <APAReference 
                            key={ref.id}
                            author={ref.author}
                            year={ref.year}
                            title={ref.title}
                            source={ref.source}
                            url={ref.url}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </AccordionContent>
            </AccordionItem>

            {/* Module 2: 生詞庫 (Vocabulary Bank) */}
            <AccordionItem value="vocabulary" className="border border-border rounded-xl overflow-hidden bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                    <Library className="w-4 h-4 text-navy" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-semibold text-foreground">📇 生詞庫</h2>
                    <p className="text-sm text-muted-foreground">Vocabulary Bank</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <p className="text-sm text-muted-foreground mb-4">
                  點擊 🔊 收聽標準發音 · 點擊卡片翻轉查看翻譯
                </p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allVocabulary.slice(0, 9).map((vocab, index) => (
                    <VocabularyFlashcard key={index} vocabulary={vocab} />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link 
                    to="/vocabulary"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 transition-colors text-sm font-medium"
                  >
                    查看全部詞彙
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Module 3: 語法重點 (Grammar Points) */}
            <AccordionItem value="grammar" id="grammar" className="border border-border rounded-xl overflow-hidden bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-semibold text-foreground">🧩 語法重點</h2>
                    <p className="text-sm text-muted-foreground">Grammar Points</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-3">
                  {allGrammar.map((grammar, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-serif font-bold text-foreground">
                          {grammar.pattern}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gold/10 text-gold">
                          Level {grammar.level}
                        </span>
                      </div>
                      <p className="text-sm text-gold font-medium mb-1">{grammar.english}</p>
                      <p className="text-sm text-muted-foreground">
                        {grammar.example}
                      </p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Module 4: 課堂活動 (Classroom Activity) */}
            <AccordionItem value="activity" className="border border-border rounded-xl overflow-hidden bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center">
                    <Mic className="w-4 h-4 text-navy" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-serif text-lg font-semibold text-foreground">🎙️ 課堂活動</h2>
                    <p className="text-sm text-muted-foreground">Classroom Activity</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 space-y-6">
                {/* Activity Description */}
                <div className="p-4 rounded-lg bg-gold/10 border border-gold/20">
                  <h3 className="font-medium text-foreground mb-2">生詞發音練習與檢測</h3>
                  <p className="text-sm text-muted-foreground">
                    Vocabulary Pronunciation Practice
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    練習以下 10 個核心生詞的發音，錄音後提交給教師評分
                  </p>
                </div>

                {/* All 10 Vocabulary Recording Submissions */}
                <div>
                  <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs">錄音作業</span>
                    錄音作業提交 Recording Submission ({allVocabulary.length} 個詞彙)
                  </h3>
                  <div className="grid gap-4">
                    {allVocabulary.map((word, index) => (
                      <RecordingSubmission 
                        key={index}
                        targetText={word.word}
                        targetPinyin={word.pinyin}
                      />
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
