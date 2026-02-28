import { Suspense } from "react";
import AuthPage from "@/components/Auth/AuthPage";

export const metadata = { title: "Sign In · NepalVoice" };

export default function AuthRoute() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
          Loading…
        </div>
      }
    >
      <AuthPage />
    </Suspense>
  );
}
