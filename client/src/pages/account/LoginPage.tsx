import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock } from 'lucide-react';
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

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(t('account.emailPasswordRequired'));
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError(t('account.loginFailed'));
      }
    } catch {
      setError(t('account.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-sm">
         <div className="text-center mb-8">
           <h1 className="text-2xl font-semibold text-foreground tracking-tight">{t('account.login')}</h1>
           <p className="text-muted-foreground mt-1.5 text-sm">{t('account.loginDesc')}</p>
         </div>

         <Card className="border border-border shadow-sm rounded-lg overflow-hidden">
           <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <LogIn className="w-4 h-4 text-primary" />
                {t('account.login')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('account.loginDesc')}
              </CardDescription>
           </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
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
                     className="pl-9 h-10 rounded-md text-sm"
                   />
                </div>
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
                     className="pl-9 h-10 rounded-md text-sm"
                   />
                </div>
              </div>

               {error && (
                 <div className="text-sm text-destructive bg-destructive/10 p-2.5 rounded-md text-center text-xs">
                   {error}
                 </div>
               )}

               <div className="bg-muted/50 border border-border rounded-md p-2.5 text-xs text-muted-foreground flex items-start gap-2">
                 <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-primary" />
                 <span>{t('account.demoModeHint')}</span>
               </div>
            </CardContent>
             <CardFooter className="flex-col gap-3 pb-5">
               <Button
                 type="submit"
                 size="default"
                 className="w-full rounded-md h-10 font-medium"
                 disabled={loading}
               >
                  {loading ? t('common.loading') : t('account.login')}
               </Button>
             </CardFooter>
          </form>
        </Card>

          <div className="text-center mt-5 text-sm text-muted-foreground">
            {t('account.noAccount')}{' '}
            <Link
              to="/account/register"
              className="text-primary hover:underline"
            >
              {t('account.signUpNow')}
            </Link>
          </div>
      </div>
    </div>
  );
}
