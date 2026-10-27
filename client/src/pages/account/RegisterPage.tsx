import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, User, Mail, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@client/src/components/ui/card';
import { useApp } from '@client/src/store/AppContext';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = '请输入姓名';
    }

    if (!email.trim()) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 6) {
      newErrors.password = '密码至少需要6位';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = '请确认密码';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) {
        navigate('/');
      } else {
        setErrors({ email: '该邮箱已被注册' });
      }
    } catch {
      setErrors({ email: '注册失败，请重试' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
         <div className="text-center mb-8">
           <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t('account.register')}</h1>
           <p className="text-muted-foreground mt-1.5 text-sm">{t('account.registerDesc')}</p>
         </div>

         <Card className="border border-border shadow-sm rounded-lg overflow-hidden">
           <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-primary" />
                {t('account.register')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('account.registerDesc')}
              </CardDescription>
           </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t('checkout.name')}
                  </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="name"
                     type="text"
                      placeholder={t('checkout.namePlaceholder')}
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className={`pl-9 h-10 rounded-md text-sm ${errors.name ? 'border-destructive' : ''}`}
                   />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t('account.email')}
                  </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="email"
                     type="email"
                      placeholder={t('account.emailPlaceholder')}
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     className={`pl-9 h-10 rounded-md text-sm ${errors.email ? 'border-destructive' : ''}`}
                   />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t('account.password')}
                  </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="password"
                     type="password"
                      placeholder={t('account.passwordPlaceholder')}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     className={`pl-9 h-10 rounded-md text-sm ${errors.password ? 'border-destructive' : ''}`}
                   />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
                 {password.length > 0 && password.length >= 6 && (
                   <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1">
                     <CheckCircle className="w-3 h-3" />
                     密码长度符合要求
                   </p>
                 )}
              </div>

              <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    {t('account.confirmPassword')}
                  </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                   <Input
                     id="confirmPassword"
                     type="password"
                      placeholder={t('account.confirmPasswordPlaceholder')}
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className={`pl-9 h-10 rounded-md text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                   />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                )}
                {confirmPassword.length > 0 && password === confirmPassword && !errors.confirmPassword && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    两次密码一致
                  </p>
                )}
              </div>
            </CardContent>
             <CardFooter className="flex-col gap-3 pb-5">
               <Button
                 type="submit"
                 size="default"
                 className="w-full rounded-md h-10 font-medium"
                 disabled={loading}
               >
                  {loading ? t('common.loading') : t('account.register')}
               </Button>
             </CardFooter>
          </form>
        </Card>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            {t('account.hasAccount')}{' '}
            <Link
              to="/account/login"
              className="text-primary hover:underline"
            >
              {t('account.signInNow')}
            </Link>
          </div>
      </div>
    </div>
  );
}
