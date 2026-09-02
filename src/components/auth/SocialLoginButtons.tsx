import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { isKakaoLoginConfigured, loginWithKakao } from "@/lib/kakaoAuth";
import { isNaverLoginConfigured, loginWithNaver } from "@/lib/naverAuth";

/**
 * Kakao pops up its own login window and returns an access token synchronously, so it
 * finishes on this page. Naver's flow instead redirects away — its result is handled by
 * NaverCallback.tsx, not here.
 */
export const SocialLoginButtons = () => {
  const navigate = useNavigate();
  const { loginWithOAuth } = useAuth();
  const [loadingProvider, setLoadingProvider] = useState<"KAKAO" | "NAVER" | null>(null);

  const handleKakao = async () => {
    if (!isKakaoLoginConfigured()) {
      toast.error("카카오 로그인이 설정되지 않았습니다. VITE_KAKAO_APP_KEY를 확인해주세요.");
      return;
    }

    setLoadingProvider("KAKAO");
    try {
      const accessToken = await loginWithKakao();
      await loginWithOAuth("KAKAO", accessToken);
      toast.success("카카오로 로그인했습니다.");
      navigate("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "카카오 로그인에 실패했습니다.");
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleNaver = async () => {
    if (!isNaverLoginConfigured()) {
      toast.error("네이버 로그인이 설정되지 않았습니다. VITE_NAVER_CLIENT_ID를 확인해주세요.");
      return;
    }

    setLoadingProvider("NAVER");
    try {
      await loginWithNaver(); // navigates away; nothing after this runs
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "네이버 로그인에 실패했습니다.");
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#FDD835] hover:text-[#191919]"
        onClick={handleKakao}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "KAKAO" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <KakaoIcon className="w-4 h-4 mr-2" />
        )}
        카카오로 로그인
      </Button>
      <Button
        type="button"
        variant="outline"
        className="w-full bg-[#03C75A] border-[#03C75A] text-white hover:bg-[#02b350] hover:text-white"
        onClick={handleNaver}
        disabled={loadingProvider !== null}
      >
        {loadingProvider === "NAVER" ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <span className="w-4 h-4 mr-2 font-bold text-xs flex items-center justify-center">N</span>
        )}
        네이버로 로그인
      </Button>
    </div>
  );
};

const KakaoIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 3C6.48 3 2 6.48 2 10.8c0 2.76 1.84 5.19 4.6 6.58-.2.73-.73 2.68-.84 3.1-.13.51.19.5.4.37.16-.11 2.6-1.77 3.66-2.49.7.1 1.42.16 2.18.16 5.52 0 10-3.48 10-7.72S17.52 3 12 3z" />
  </svg>
);
