import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Main Content Area */}
      <main className="pt-14 pb-20 min-h-screen">
        <div className="container max-w-lg mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
