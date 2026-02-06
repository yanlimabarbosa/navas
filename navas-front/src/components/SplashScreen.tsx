import React, { useEffect, useState } from 'react';
import { Card, CardContent } from './ui/card';

interface SplashScreenProps {
  onBackendReady: () => void;
  onBackendError: (error: string) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onBackendReady, onBackendError }) => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Iniciando aplicação...');
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.onBackendReady(() => {
        setStatus('Aplicação pronta!');
        setProgress(100);
        setTimeout(() => {
          onBackendReady();
        }, 1000);
      });

      window.electronAPI.onBackendError((error: string) => {
        setStatus(`Erro ao iniciar backend: ${error}`);
        onBackendError(error);
      });

      window.electronAPI.onBackendStatus((status: string) => {
        setStatus(status);
        setProgress((prev) => Math.min(prev + 10, 90));
      });
    } else {
      setTimeout(() => {
        setStatus('Modo de desenvolvimento - pulando splash screen');
        setProgress(100);
        setTimeout(() => {
          onBackendReady();
        }, 1000);
      }, 2000);
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1200);

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 700);

    return () => {
      clearInterval(progressInterval);
      clearInterval(dotsInterval);
    };
  }, [onBackendReady, onBackendError]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
      <Card className="w-96 shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Soryan Assessoria</h1>
            <p className="text-sm text-muted-foreground">Iniciando aplicação</p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-700 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{Math.round(progress)}% completo</div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-foreground">
              {status}
              <span className="text-primary">{dots}</span>
            </p>
          </div>

          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>

          <div className="mt-6 pt-4 border-t border-muted">
            <p className="text-xs text-muted-foreground">Aguardando servidor...</p>
            <p className="text-xs text-muted-foreground mt-1">v1.0.0 • Aplicação Soryan</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
