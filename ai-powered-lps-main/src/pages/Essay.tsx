import { motion } from "framer-motion";
import { FileText, Info, BookOpen } from "lucide-react";
import Navigation from "@/components/Navigation";
import KeywordTooltip from "@/components/KeywordTooltip";
import VocabularyFlashcard from "@/components/VocabularyFlashcard";
import { essayContent, essayVocabulary, essayGrammar, VocabularyItem } from "@/data/content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const keywordMap: Record<string, VocabularyItem> = {};
essayVocabulary.forEach(v => {
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

const Essay = () => {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy/10 text-navy text-sm font-medium mb-4">
              <FileText className="w-4 h-4" />
              短文篇
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4">
              {essayContent.title}
            </h1>
            <p className="text-muted-foreground">
              將滑鼠移至標記詞彙上方，查看多語定義與例句
            </p>
          </motion.div>

          {/* Warm-up Questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 p-6 rounded-2xl bg-muted/50 border border-border"
          >
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-secondary" />
              課前暖身
            </h2>
            <ol className="space-y-2 list-decimal list-inside text-muted-foreground">
              {essayContent.warmUp.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </motion.div>

          {/* Essay Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 p-8 rounded-2xl bg-card border border-border shadow-card"
          >
            <div className="prose prose-lg max-w-none">
              {essayContent.paragraphs.map((paragraph, index) => (
                <p 
                  key={index}
                  className="text-foreground leading-loose mb-6 last:mb-0 indent-8"
                >
                  {highlightKeywords(paragraph)}
                </p>
              ))}
            </div>
          </motion.article>

          {/* Grammar Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Tabs defaultValue="vocabulary" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-6">
                <TabsTrigger value="vocabulary">生詞二</TabsTrigger>
                <TabsTrigger value="grammar">語法點二</TabsTrigger>
              </TabsList>
              
              <TabsContent value="vocabulary">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {essayVocabulary.map((vocab, index) => (
                    <VocabularyFlashcard key={index} vocabulary={vocab} />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="grammar">
                <div className="space-y-4">
                  {essayGrammar.map((grammar, index) => (
                    <div 
                      key={index}
                      className="p-5 rounded-xl bg-card border border-border shadow-card"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="w-5 h-5 text-secondary" />
                        <span className="font-serif text-lg font-bold text-foreground">
                          {grammar.pattern}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-muted text-muted-foreground">
                          Level {grammar.level}
                        </span>
                      </div>
                      <p className="text-sm text-secondary font-medium mb-2">{grammar.english}</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {grammar.example}
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Essay;
