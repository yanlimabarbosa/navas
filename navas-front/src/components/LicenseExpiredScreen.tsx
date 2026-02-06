import { AlertTriangle, MessageCircle, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface LicenseStatus {
    valid: boolean;
    reason?: string;
    message?: string;
    planType?: string;
    clientName?: string;
    activationDate?: string;
    expirationDate?: string;
    daysExpired?: number;
}

interface LicenseExpiredScreenProps {
    licenseStatus: LicenseStatus;
}

const WHATSAPP_NUMBER = '5583999037637';
const WHATSAPP_MESSAGE = encodeURIComponent(
    'Olá! Gostaria de renovar minha licença do Gerador de Encartes.'
);

const planLabels: Record<string, string> = {
    mensal: 'Mensal (30 dias)',
    trimestral: 'Trimestral (90 dias)',
    semestral: 'Semestral (180 dias)',
    anual: 'Anual (365 dias)',
};

export function LicenseExpiredScreen({ licenseStatus }: LicenseExpiredScreenProps) {
    const handleWhatsAppClick = () => {
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;
        window.open(whatsappUrl, '_blank');
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg border-red-200 dark:border-red-800 shadow-2xl">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-red-700 dark:text-red-400">
                        Licença Expirada
                    </CardTitle>
                    <CardDescription className="text-base">
                        {licenseStatus.reason === 'no_license'
                            ? 'Nenhuma licença foi encontrada para este aplicativo.'
                            : licenseStatus.reason === 'time_manipulation'
                                ? 'Foi detectada uma alteração na data do sistema. A licença foi bloqueada por segurança.'
                                : licenseStatus.reason === 'tampered'
                                    ? 'O arquivo de licença foi adulterado ou está corrompido.'
                                    : licenseStatus.reason === 'invalid'
                                        ? 'A licença é inválida ou está incompleta.'
                                        : licenseStatus.reason === 'offline_too_long'
                                            ? 'Verificação online necessária. Conecte à internet e reabra o aplicativo.'
                                            : licenseStatus.reason === 'first_run_offline'
                                                ? 'A primeira execução requer conexão com a internet para validar a licença.'
                                                : licenseStatus.reason === 'blacklisted'
                                                    ? 'Sua licença foi revogada. Entre em contato para mais informações.'
                                                    : 'Sua licença de uso expirou. Entre em contato para renovar.'}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {licenseStatus.reason === 'expired' && (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Informações da Licença
                            </h3>

                            {licenseStatus.clientName && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Cliente:</span>
                                    <span className="font-medium">{licenseStatus.clientName}</span>
                                </div>
                            )}

                            {licenseStatus.planType && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Plano:</span>
                                    <span className="font-medium">
                                        {planLabels[licenseStatus.planType] || licenseStatus.planType}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Ativação:
                                </span>
                                <span className="font-medium">{formatDate(licenseStatus.activationDate)}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    Expirou em:
                                </span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    {formatDate(licenseStatus.expirationDate)}
                                </span>
                            </div>

                            {licenseStatus.daysExpired && (
                                <div className="mt-2 text-center py-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-400 text-sm font-medium">
                                    Expirou há {licenseStatus.daysExpired} dia{licenseStatus.daysExpired > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-3">
                        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                            Para renovar sua licença, entre em contato pelo WhatsApp:
                        </p>

                        <Button
                            onClick={handleWhatsAppClick}
                            className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all"
                        >
                            <MessageCircle className="h-6 w-6 mr-3" />
                            Renovar pelo WhatsApp
                        </Button>
                    </div>

                    <p className="text-center text-xs text-gray-500 dark:text-gray-500">
                        Soryan Assessoria • Gerador de Encartes
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
