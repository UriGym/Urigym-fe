import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentsApi } from "@/api/payments";
import type { OrderResponse } from "@/api/types";

/** Toss redirects here with these three params after a successful charge. */
const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const orderId = searchParams.get("orderId");
    const paymentKey = searchParams.get("paymentKey");
    const amount = searchParams.get("amount");

    if (!orderId || !paymentKey || !amount) {
      setError("결제 정보를 확인할 수 없습니다.");
      return;
    }

    paymentsApi
      .confirm({ orderId, paymentKey, amount: Number(amount) })
      .then((result) => setOrder(result ?? null))
      .catch((err: Error) => setError(err.message || "결제 승인에 실패했습니다."));
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <p className="font-medium">{error}</p>
        <Button onClick={() => navigate("/mypage")}>마이페이지로 이동</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">결제 승인 처리 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
        <CheckCircle2 className="w-9 h-9 text-green-500" />
      </div>
      <div>
        <h1 className="text-xl font-bold mb-1">결제가 완료되었습니다</h1>
        <p className="text-sm text-muted-foreground">{order.orderName}</p>
        <p className="text-2xl font-bold text-primary mt-2">{order.amount.toLocaleString()}원</p>
      </div>
      <Button variant="gradient" onClick={() => navigate("/mypage/gyms")}>
        등록 체육관에서 확인하기
      </Button>
    </div>
  );
};

export default PaymentSuccess;
