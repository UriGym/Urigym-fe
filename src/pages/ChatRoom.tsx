import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { chatApi } from "@/api/chat";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatMessageResponse, ChatRoomResponse } from "@/api/types";

const POLL_INTERVAL_MS = 3000;

// 라우트 엘리먼트가 재사용되어 roomId 파라미터만 바뀌면(예: 다른 체육관 알림 클릭) 컴포넌트가
// 리마운트되지 않는다 — key={roomId}로 강제 리마운트시켜 messages/room 등 이전 방 상태가
// 새 방에 잔류하는 문제를 근본적으로 막는다.
const ChatRoom = () => {
  const { roomId } = useParams();
  return <ChatRoomView key={roomId} />;
};

const ChatRoomView = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [room, setRoom] = useState<ChatRoomResponse | null>(null);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // 상대방 이름/체육관명은 메시지 API에 없어 방 목록에서 찾아 채운다 — 별도 room-detail API가 계약에 없음.
  useEffect(() => {
    if (!roomId) return;
    chatApi
      .getChatRooms()
      .then((rooms) => setRoom(rooms?.find((r) => r.id === roomId) ?? null))
      .catch(() => setRoom(null));
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const load = async (silent: boolean) => {
      try {
        const list = await chatApi.getChatMessages(roomId);
        if (cancelled) return;
        setMessages(list ?? []);
        setLoadFailed(false);
      } catch (error) {
        if (cancelled) return;
        if (!silent) {
          setLoadFailed(true);
          toast.error(error instanceof Error ? error.message : "메시지를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load(false);
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [roomId]);

  const lastMessageIdRef = useRef<string | null>(null);
  useEffect(() => {
    const lastId = messages.length ? messages[messages.length - 1].id : null;
    if (lastId === lastMessageIdRef.current) return;
    lastMessageIdRef.current = lastId;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || !roomId || isSending) return;

    setIsSending(true);
    try {
      const sent = await chatApi.sendChatMessage(roomId, content);
      if (sent) setMessages((prev) => [...prev, sent]);
      setInput("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "메시지 전송에 실패했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (loadFailed && messages.length === 0) {
    return (
      <div className="min-h-screen bg-background pt-16 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">채팅방을 불러올 수 없습니다.</p>
        <Button onClick={() => navigate(-1)}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="fixed top-16 left-0 right-0 z-40 glass border-b border-border/50">
        <div className="flex items-center gap-3 px-4 py-3 max-w-lg mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="뒤로 가기">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold truncate">{room?.counterpartName ?? "채팅"}</h1>
            {room?.gymName && <p className="text-xs text-muted-foreground truncate">{room.gymName}</p>}
          </div>
        </div>
      </header>

      <main className="pt-32 px-4 max-w-lg mx-auto space-y-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">
            아직 메시지가 없습니다. 첫 메시지를 보내보세요.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === user?.id;
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  {!isMine && message.senderName && (
                    <span className="text-xs text-muted-foreground px-1">{message.senderName}</span>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-secondary text-secondary-foreground rounded-bl-sm"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {new Date(message.createdAt).toLocaleString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {isMine && message.isRead && " · 읽음"}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </main>

      <form
        onSubmit={handleSend}
        className="fixed bottom-20 left-0 right-0 z-40 glass border-t border-border/50 p-3"
      >
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지를 입력하세요"
            disabled={isSending}
            maxLength={1000}
          />
          <Button type="submit" size="icon" variant="gradient" disabled={!input.trim() || isSending}>
            {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatRoom;
