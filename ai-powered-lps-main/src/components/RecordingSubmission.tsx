import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, RotateCcw, Volume2, Play, Send, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface RecordingSubmissionProps {
  targetText: string;
  targetPinyin?: string;
}

const RecordingSubmission = ({ targetText, targetPinyin }: RecordingSubmissionProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
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
        setIsProcessing(true);
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Simulate noise cancellation
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setRecordedAudioUrl(audioUrl);
        setIsProcessing(false);

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
      toast.error("無法存取麥克風，請檢查權限設定");
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
    setRecordedAudioUrl(null);
    setIsSubmitted(false);
    setIsProcessing(false);
  };

  const submitRecording = () => {
    setIsSubmitted(true);
    toast.success("檔案已儲存，已傳送至教師後台", {
      description: "File saved successfully. Sent to teacher dashboard.",
    });
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
          title="聽標準發音"
        >
          <Volume2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Recording Controls */}
      {!recordedAudioUrl && !isProcessing && (
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

      {/* Processing State */}
      {isProcessing && (
        <div className="flex flex-col items-center gap-4 py-8">
          <motion.div
            className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          />
          <p className="text-muted-foreground font-medium">
            降噪處理中... (Reducing Noise...)
          </p>
        </div>
      )}

      {/* Recording Ready for Review/Submit */}
      <AnimatePresence>
        {recordedAudioUrl && !isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-4 py-4"
          >
            {isSubmitted ? (
              /* Submitted State */
              <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-secondary" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-foreground flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-secondary" />
                    待評分 (Pending Review)
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    已傳送至教師後台
                  </p>
                </div>
                
                {/* Still allow playback */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playRecording}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  播放錄音
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 text-muted-foreground"
                  onClick={reset}
                >
                  <RotateCcw className="w-4 h-4" />
                  重新錄製
                </Button>
              </div>
            ) : (
              /* Ready to Submit State */
              <>
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
                  <Mic className="w-8 h-8 text-gold" />
                </div>
                <p className="text-sm text-muted-foreground">錄音完成！請檢查後提交</p>
                
                {/* Playback Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={playRecording}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" />
                  播放我的錄音
                </Button>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={reset}
                  >
                    <RotateCcw className="w-4 h-4" />
                    重新錄音
                  </Button>
                  
                  <Button
                    className="gap-2 bg-gold hover:bg-gold-dark text-navy"
                    onClick={submitRecording}
                  >
                    <Send className="w-4 h-4" />
                    提交給教師評分
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RecordingSubmission;
