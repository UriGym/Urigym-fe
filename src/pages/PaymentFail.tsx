import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Toss redirects here (no server call needed) when the user cancels or the charge fails. */
const PaymentFail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "결제가 취소되었거나 실패했습니다.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
        <XCircle className="w-9 h-9 text-destructive" />
      </div>
      <div>
        <h1 className="text-xl font-bold mb-1">결제에 실패했습니다</h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" onClick={() => navigate(-1)}>
        돌아가기
      </Button>
    </div>
  );
};

export default PaymentFail;
