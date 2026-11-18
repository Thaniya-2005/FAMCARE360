import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ChildDashboard from "./pages/ChildDashboard";
import BMICalculator from "./pages/BMICalculator";
import MealTracker from "./pages/MealTracker";
import ExerciseTracker from "./pages/ExerciseTracker";
import DailyRoutine from "./pages/DailyRoutine";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

// Redesigned Parent Pages matching References 1-5
import ParentHome from "./pages/parent/ParentHome";
import ParentFamily from "./pages/parent/ParentFamily";
import ParentHealth from "./pages/parent/ParentHealth";
import ParentCare from "./pages/parent/ParentCare";
import ParentMore from "./pages/parent/ParentMore";
import ParentNotifications from "./pages/parent/ParentNotifications";
import ParentMemberDetails from "./pages/parent/ParentMemberDetails";

// Redesigned Child Pages matching References 1-6
import ChildHome from "./pages/child/ChildHome";
import ChildHealth from "./pages/child/ChildHealth";
import ChildCheckIn from "./pages/child/ChildCheckIn";
import ChildMedicines from "./pages/child/ChildMedicines";
import ChildAppointments from "./pages/child/ChildAppointments";
import ChildProfile from "./pages/child/ChildProfile";
import ChildNotifications from "./pages/child/ChildNotifications";
import { NotificationProvider } from "./contexts/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            {/* Redesigned Parent Application Routes */}
            <Route
              path="/parent"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/family"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentFamily />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/health"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentHealth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/care"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentCare />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/more"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentMore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/notifications"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentNotifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/parent/member/:memberId"
              element={
                <ProtectedRoute allowedRoles={["parent"]}>
                  <ParentMemberDetails />
                </ProtectedRoute>
              }
            />
            {/* Redesigned Child Application Routes */}
            <Route
              path="/child"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/health"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildHealth />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/check-in"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildCheckIn />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/medicines"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildMedicines />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/appointments"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildAppointments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/profile"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/child/notifications"
              element={
                <ProtectedRoute allowedRoles={["child"]}>
                  <ChildNotifications />
                </ProtectedRoute>
              }
            />
            <Route path="/bmi" element={<BMICalculator />} />
            <Route
              path="/meals"
              element={
                <ProtectedRoute>
                  <MealTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercise"
              element={
                <ProtectedRoute>
                  <ExerciseTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/routine"
              element={
                <ProtectedRoute>
                  <DailyRoutine />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
