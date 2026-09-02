import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleRoute } from "./components/auth/RoleRoute";
import Index from "./pages/Index";
import GymDetail from "./pages/GymDetail";
import Search from "./pages/Search";
import Attendance from "./pages/Attendance";
import MyPage from "./pages/MyPage";
import MyGyms from "./pages/MyGyms";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerApplication from "./pages/OwnerApplication";
import AdminDashboard from "./pages/AdminDashboard";
import Support from "./pages/Support";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NaverCallback from "./pages/NaverCallback";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/oauth/naver/callback" element={<NaverCallback />} />
            <Route
              path="/payments/success"
              element={
                <RoleRoute>
                  <PaymentSuccess />
                </RoleRoute>
              }
            />
            <Route path="/payments/fail" element={<PaymentFail />} />
            <Route path="/gym/:id" element={<GymDetail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route
              path="/mypage/gyms"
              element={
                <RoleRoute>
                  <MyGyms />
                </RoleRoute>
              }
            />
            <Route
              path="/support"
              element={
                <RoleRoute>
                  <Support />
                </RoleRoute>
              }
            />
            <Route
              path="/owner-application"
              element={
                <RoleRoute allow={["USER", "OWNER"]}>
                  <OwnerApplication />
                </RoleRoute>
              }
            />
            <Route
              path="/owner"
              element={
                <RoleRoute allow={["OWNER"]}>
                  <OwnerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute allow={["ADMIN"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
