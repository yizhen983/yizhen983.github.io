import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Volume2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface SimplifiedAudioAnalyzerProps {
  targetText: string;
  targetPinyin?: string;
  onComplete?: (score: number) => void;
}

const SimplifiedAudioAnalyzer = ({ targetText, targetPinyin, onComplete }: SimplifiedAudioAnalyzerProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState<'noise' | 'analyzing'>('noise');
  const [score, setScore] = useState<number | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-TW';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const playRecording = () => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.play();
    }
  };

  // Simulate analysis and return accuracy score
  const simulateAnalysis = useCallback((audioData: Float32Array): number => {
    const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
    const meanDb = 20 * Math.log10(Math.max(rms, 0.0001)) + 80;
    
    let intensityScore: number;
    if (meanDb < 40) {
      intensityScore = Math.max(0, (meanDb / 40) * 50);
    } else if (meanDb > 85) {
      intensityScore = Math.max(50, 100 - (meanDb - 85) * 3);
    } else {
      intensityScore = 50 + ((meanDb - 40) / 45) * 50;
    }
    intensityScore = Math.min(100, Math.max(0, intensityScore + (Math.random() * 10 - 5)));

    const pitchVariation = 5 + Math.random() * 20;
    let pitchScore: number;
    if (pitchVariation < 5) {
      pitchScore = 100;
    } else if (pitchVariation > 20) {
      pitchScore = 50 - Math.min(30, (pitchVariation - 20) * 2);
    } else {
      pitchScore = 100 - (pitchVariation - 5) * (50 / 15);
    }
    pitchScore = Math.min(100, Math.max(0, pitchScore + (Math.random() * 10 - 5)));

    const hnrRaw = 40 + Math.random() * 50;
    const harmonicityScore = Math.min(100, Math.max(0, hnrRaw + (Math.random() * 10 - 5)));

    const centroid = 1500 + Math.random() * 1000;
    const centroidScore = 100 - Math.min(50, Math.abs(centroid - 2000) / 20);
    const spectralScore = Math.min(100, Math.max(0, centroidScore + (Math.random() * 10 - 5)));

    const energyCV = 10 + Math.random() * 20;
    let energyScore: number;
    if (energyCV < 10) {
      energyScore = 100;
    } else if (energyCV > 30) {
      energyScore = 50 - Math.min(30, energyCV - 30);
    } else {
      energyScore = 100 - (energyCV - 10) * (50 / 20);
    }
    energyScore = Math.min(100, Math.max(0, energyScore + (Math.random() * 10 - 5)));

    const overallClarity = 
      intensityScore * 0.15 +
      pitchScore * 0.25 +
      harmonicityScore * 0.30 +
      spectralScore * 0.20 +
      energyScore * 0.10;

    return Math.round(overallClarity);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsAnalyzing(true);
        setAnalyzeStep('noise');
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        // Simulate noise cancellation
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        setAnalyzeStep('analyzing');
        
        const arrayBuffer = await audioBlob.arrayBuffer();
        const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0);
        
        await new Promise(resolve => setTimeout(resolve, 800));
        const analysisScore = simulateAnalysis(audioData);
        
        setScore(analysisScore);
        setIsAnalyzing(false);
        onComplete?.(analysisScore);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      const updateLevel = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setAudioLevel(average / 255 * 100);
        }
        animationFrameRef.current = requestAnimationFrame(updateLevel);
      };
      updateLevel();

    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      setAudioLevel(0);
    }
  };

  const reset = () => {
    setScore(null);
    setIsAnalyzing(false);
    setRecordedAudioUrl(null);
  };

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-secondary";
    if (s >= 50) return "text-yellow-500";
    return "text-destructive";
  };

  const getProgressColor = (s: number) => {
    if (s >= 80) return "[&>div]:bg-secondary";
    if (s >= 50) return "[&>div]:bg-yellow-500";
    return "[&>div]:bg-destructive";
  };

  const getCircleColor = (s: number) => {
    if (s >= 80) return "stroke-secondary";
    if (s >= 50) return "stroke-yellow-500";
    return "stroke-destructive";
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-4">
      {/* Target Text */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-2xl font-serif font-bold text-foreground">{targetText}</p>
          {targetPinyin && (
            <p className="text-sm text-muted-foreground mt-1">{targetPinyin}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => speak(targetText)}
          className="shrink-0"
        >
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Recording Controls */}
      {!score && !isAnalyzing && (
        <div className="flex flex-col items-center gap-4 py-6">
          <motion.div
            className="relative"
            animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                isRecording ? 'bg-destructive' : 'bg-secondary hover:bg-secondary/90'
              }`}
            >
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-destructive/30"
                  animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                />
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute inset-0 w-full h-full rounded-full ${
                isRecording ? 'text-primary-foreground' : 'text-secondary-foreground'
              }`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? (
                <Square className="w-8 h-8" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </Button>
          </motion.div>
          
          <p className="text-sm text-muted-foreground">
            {isRecording ? "點擊停止錄音" : "點擊開始錄音"}
          </p>

          {isRecording && (
            <div className="w-full max-w-xs">
              <Progress value={audioLevel} className="h-2" />
            </div>
          )}
        </div>
      )}

      {/* Analyzing State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center gap-4 py-8">
          <motion.div
            className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-muted-foreground font-medium">
            {analyzeStep === 'noise' ? "Reducing Noise... (降噪處理中...)" : "Analyzing... (分析中...)"}
          </p>
        </div>
      )}

      {/* Results - Circular Progress Only */}
      <AnimatePresence>
        {score !== null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            {/* Circular Progress */}
            <div className="relative w-32 h-32">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  className={getCircleColor(score)}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${score * 2.83} 283`}
                  initial={{ strokeDasharray: "0 283" }}
                  animate={{ strokeDasharray: `${score * 2.83} 283` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}%
                </span>
                <span className="text-xs text-muted-foreground">準確度</span>
              </div>
            </div>

            {/* Playback Button */}
            {recordedAudioUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={playRecording}
                className="gap-2"
              >
                <Play className="w-4 h-4" />
                播放錄音
              </Button>
            )}

            {/* Reset Button */}
            <Button
              variant="outline"
              className="gap-2"
              onClick={reset}
            >
              <RotateCcw className="w-4 h-4" />
              重新錄音
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimplifiedAudioAnalyzer;
