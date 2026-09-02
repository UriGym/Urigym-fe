import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { readNaverCallbackToken } from "@/lib/naverAuth";

/**
 * Naver redirects here with the access token in the URL hash after login. This page's
 * only job is to hand that token to the backend and continue on — see naverAuth.ts for
 * why Naver needs a dedicated route instead of resolving inline like Kakao.
 */
const NaverCallback = () => {
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const token = readNaverCallbackToken();
    if (!token) {
      setError("네이버 로그인 정보를 확인할 수 없습니다. 다시 시도해주세요.");
      return;
    }

    loginWithOAuth("NAVER", token.accessToken)
      .then(() => navigate("/", { replace: true }))
      .catch((err: Error) => setError(err.message || "네이버 로그인에 실패했습니다."));
  }, [loginWithOAuth, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertTriangle className="w-10 h-10 text-destructive" />
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => navigate("/login", { replace: true })}>로그인으로 돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">네이버 로그인 처리 중...</p>
    </div>
  );
};

export default NaverCallback;
