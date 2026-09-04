import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Check, X, ArrowLeft } from 'lucide-react';
import { AddressSearchField } from '@/components/common/AddressSearchField';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    fullName: '',
    phone: '',
    address: '',
  });

  // Password validation checks
  const passwordValidation = useMemo(() => {
    const password = formData.password;
    return {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
  }, [formData.password]);

  const isPasswordValid = passwordValidation.minLength &&
                          passwordValidation.hasUppercase &&
                          passwordValidation.hasSpecialChar;

  // Password match check
  const passwordMatchStatus = useMemo(() => {
    if (!formData.passwordConfirm) return 'empty';
    return formData.password === formData.passwordConfirm ? 'match' : 'mismatch';
  }, [formData.password, formData.passwordConfirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('비밀번호 조건을 모두 충족해주세요.');
      return;
    }

    if (passwordMatchStatus !== 'match') {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
      });
      toast.success('회원가입 성공!');
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 left-4"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gradient">우리짐</CardTitle>
          <CardDescription>새 계정을 만드세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일 *</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">이름</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="홍길동"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                체육관에서 전화번호로 출석 체크할 때 사용됩니다.
              </p>
            </div>
            <AddressSearchField
              value={formData.address}
              onPicked={(result) => setFormData({ ...formData, address: result.address })}
            />
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호 *</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              {formData.password && (
                <div className="space-y-1 mt-2">
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.minLength ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidation.minLength ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>8자 이상</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasUppercase ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidation.hasUppercase ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>대문자 포함</span>
                  </div>
                  <div className={`flex items-center gap-2 text-xs ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-red-500'}`}>
                    {passwordValidation.hasSpecialChar ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                    <span>특수문자 포함 (!@#$%^&* 등)</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인 *</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required
              />
              {passwordMatchStatus === 'mismatch' && (
                <p className="text-red-500 text-xs mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
              {passwordMatchStatus === 'match' && (
                <p className="text-green-500 text-xs mt-1">비밀번호가 일치합니다!</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !isPasswordValid || passwordMatchStatus !== 'match'}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                '회원가입'
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              로그인
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
