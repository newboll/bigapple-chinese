import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Lock, BookMarked, AlertCircle } from 'lucide-react';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { useAdmin } from './AdminContext';
import { useTranslation } from '@client/src/i18n/useTranslation';

export default function AdminLoginPage() {
  const { login, admin } = useAdmin();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (admin) {
    return <Navigate to="/admin" replace />;
  }

  const from = (location.state as { from?: string } | null)?.from || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError(t('admin.usernamePasswordRequired'));
      return;
    }
    const success = await login(username, password);
    if (success) {
      navigate(from, { replace: true });
    } else {
      setError(t('admin.invalidCredentials'));
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-rose-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <BookMarked className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-1">Big Apple Admin</h1>
          <p className="text-muted-foreground text-sm">
            {t('admin.loginSubtitle')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg border border-border shadow-sm p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-foreground mb-1">
            {t('admin.signInTitle')}
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-rose-600 rounded-md text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('admin.username')}
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              {t('admin.password')}
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
            />
          </div>

          <Button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-md">
            <Lock className="w-4 h-4 mr-2" />
            {t('admin.signIn')}
          </Button>

          <div className="text-center text-xs text-muted-foreground pt-3 border-t border-border">
            {t('admin.defaultCredentials')}
          </div>
        </form>
      </div>
    </div>
  );
}
