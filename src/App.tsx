import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { StoryProvider } from "@/context/StoryContext";
import { LanguageProvider } from "@/context/LanguageContext";
import Welcome from "./pages/Welcome";
import Projects from "./pages/Projects";
import Project from "./pages/Project";
import StoryOverview from "./pages/project/StoryOverview";
import Outline from "./pages/project/Outline";
import Chapters from "./pages/project/Chapters";
import Characters from "./pages/project/Characters";
import Lore from "./pages/project/Lore";
import StoryMap from "./pages/project/StoryMap";
import WritingStudio from "./pages/project/WritingStudio";
import Settings from "./pages/project/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <StoryProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/project/:projectId" element={<Project />}>
                  <Route path="overview" element={<StoryOverview />} />
                  <Route path="outline" element={<Outline />} />
                  <Route path="chapters" element={<Chapters />} />
                  <Route path="characters" element={<Characters />} />
                  <Route path="lore" element={<Lore />} />
                  <Route path="map" element={<StoryMap />} />
                  <Route path="studio" element={<WritingStudio />} />
                  <Route path="settings" element={<Settings />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </StoryProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
