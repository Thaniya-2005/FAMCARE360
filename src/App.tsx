import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import ParentDashboard from "./pages/ParentDashboard";
import ChildDashboard from "./pages/ChildDashboard";
import BMICalculator from "./pages/BMICalculator";
import MealTracker from "./pages/MealTracker";
import ExerciseTracker from "./pages/ExerciseTracker";
import DailyRoutine from "./pages/DailyRoutine";
import Login from "./pages/Login";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/child" element={<ChildDashboard />} />
            <Route path="/bmi" element={<BMICalculator />} />
            <Route path="/meals" element={<MealTracker />} />
            <Route path="/exercise" element={<ExerciseTracker />} />
            <Route path="/routine" element={<DailyRoutine />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
