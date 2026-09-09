import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";

/**
 * Shared chrome for every in-app screen. Header and BottomNav are `fixed`,
 * so every route rendered through here gets identical top/bottom padding
 * to avoid its content sliding under them — no page renders its own
 * Header/BottomNav anymore, which is what let some screens lose them.
 */
export const AppLayout = () => (
  <div className="min-h-screen bg-background pb-20">
    <Header />
    <main className="pt-16">
      <Outlet />
    </main>
    <BottomNav />
  </div>
);
