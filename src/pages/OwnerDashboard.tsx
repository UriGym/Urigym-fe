import { useState } from "react";
import { 
  Users, 
  MessageSquare, 
  Calendar, 
  Bell,
  TrendingUp,
  UserPlus,
  Clock,
  Star,
  ChevronRight,
  Building2,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OwnerDashboard = () => {
  const [selectedGym] = useState({
    name: "파워짐 피트니스",
    memberCount: 156,
    todayAttendance: 42,
    rating: 4.8,
  });

  const absentMembers = [
    { name: "김영희", days: 14, lastVisit: "2024.12.25" },
    { name: "박철수", days: 10, lastVisit: "2024.12.29" },
    { name: "이지민", days: 8, lastVisit: "2024.12.31" },
  ];

  const recentReviews = [
    { name: "김*수", rating: 5, text: "시설이 정말 좋아요!", date: "1시간 전" },
    { name: "박*영", rating: 4, text: "트레이너 선생님 친절합니다", date: "3시간 전" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">관장 대시보드</h1>
          </div>
          <Badge className="gradient-warm text-white border-0">
            {selectedGym.name}
          </Badge>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4 max-w-4xl mx-auto space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
          <div className="gym-card p-4">
            <Users className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold">{selectedGym.memberCount}</p>
            <p className="text-xs text-muted-foreground">총 관원</p>
          </div>
          <div className="gym-card p-4">
            <TrendingUp className="w-5 h-5 text-green-500 mb-2" />
            <p className="text-2xl font-bold">{selectedGym.todayAttendance}</p>
            <p className="text-xs text-muted-foreground">오늘 출석</p>
          </div>
          <div className="gym-card p-4">
            <Star className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold">{selectedGym.rating}</p>
            <p className="text-xs text-muted-foreground">평균 평점</p>
          </div>
          <div className="gym-card p-4">
            <Clock className="w-5 h-5 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{absentMembers.length}</p>
            <p className="text-xs text-muted-foreground">장기 미출석</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <Button variant="gradient" className="h-14 text-base">
            <Bell className="w-5 h-5 mr-2" />
            공지 등록
          </Button>
          <Button variant="outline" className="h-14 text-base">
            <MessageSquare className="w-5 h-5 mr-2" />
            단체 메시지
          </Button>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="members" className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <TabsList className="w-full grid grid-cols-4 bg-secondary/50">
            <TabsTrigger value="members">관원</TabsTrigger>
            <TabsTrigger value="attendance">출석</TabsTrigger>
            <TabsTrigger value="reviews">리뷰</TabsTrigger>
            <TabsTrigger value="events">이벤트</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="mt-4 space-y-4">
            {/* Add Member Button */}
            <Button variant="soft" className="w-full h-12">
              <UserPlus className="w-5 h-5 mr-2" />
              신규 관원 등록
            </Button>

            {/* Absent Members Alert */}
            <div className="gym-card p-4 border-l-4 border-accent">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                장기 미출석 관원
              </h3>
              <div className="space-y-3">
                {absentMembers.map((member) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        마지막 방문: {member.lastVisit}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">{member.days}일</Badge>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                미출석 관원에게 메시지 보내기
              </Button>
            </div>

            {/* Member List Preview */}
            <div className="gym-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">전체 관원 목록</h3>
                <Button variant="ghost" size="sm">
                  전체보기 <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {[
                  { name: "김민수", attendance: 92, status: "active" },
                  { name: "이수진", attendance: 78, status: "active" },
                  { name: "박지훈", attendance: 45, status: "warning" },
                ].map((member) => (
                  <div key={member.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{member.name[0]}</span>
                      </div>
                      <span>{member.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">출석률 {member.attendance}%</span>
                      <Badge 
                        variant={member.status === "warning" ? "destructive" : "secondary"}
                        className={member.status === "active" ? "bg-green-500/10 text-green-500" : ""}
                      >
                        {member.status === "active" ? "활발" : "주의"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-4 space-y-4">
            <div className="gym-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">오늘 출석 현황</h3>
                <Badge variant="secondary">{selectedGym.todayAttendance}명</Badge>
              </div>
              <div className="h-32 bg-secondary/30 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">출석 통계 그래프</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            <div className="gym-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">최근 리뷰</h3>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-accent text-accent" />
                  <span className="font-bold">{selectedGym.rating}</span>
                </div>
              </div>
              <div className="space-y-4">
                {recentReviews.map((review, index) => (
                  <div key={index} className="pb-4 border-b border-border last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{review.name}</span>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{review.text}</p>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="events" className="mt-4 space-y-4">
            <Button variant="gradient" className="w-full h-12">
              <Calendar className="w-5 h-5 mr-2" />
              새 이벤트 등록
            </Button>
            
            <div className="gym-card p-4">
              <h3 className="font-semibold mb-3">예정된 이벤트</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">승급 심사</p>
                    <p className="text-xs text-muted-foreground">2024.01.20</p>
                  </div>
                  <Badge>D-12</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="font-medium">신년 이벤트</p>
                    <p className="text-xs text-muted-foreground">2024.01.31</p>
                  </div>
                  <Badge variant="secondary">D-23</Badge>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OwnerDashboard;
