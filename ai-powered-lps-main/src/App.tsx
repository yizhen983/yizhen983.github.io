import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Dialogue from "./pages/Dialogue";
import Essay from "./pages/Essay";
import Vocabulary from "./pages/Vocabulary";
import Activities from "./pages/Activities";
import NotFound from "./pages/NotFound";
import AISiteTour from "./components/AISiteTour";
import { LessonProvider } from "./contexts/LessonContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LessonProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dialogue" element={<Dialogue />} />
            <Route path="/essay" element={<Essay />} />
            <Route path="/vocabulary" element={<Vocabulary />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <AISiteTour />
        </BrowserRouter>
      </LessonProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
