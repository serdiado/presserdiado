// Yeni kullanıcı ilk kurulum wizard'ı — mevcut iki modalı sırayla orkestre eder.
// Kendi UI'ı yalnızca karşılama (welcome) ve tamamlandı (done) ekranlarıdır;
// ürün ve resim adımlarında ExcelImportModal / ProductImageUploadModal'ı isOpen ile sürer.
// Tek modal kuralı: her adımda ekranda yalnızca tek backdrop/modal bulunur (asla üst üste).

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ExcelImportModal } from './ExcelImportModal';
import { ProductImageUploadModal } from './ProductImageUploadModal';

interface WelcomeWizardModalProps {
  isOpen: boolean;
  onClose: () => void; // her kapanış/erteleme — AnaSayfa dismissed işaretler
  onComplete?: () => void; // başarılı import sonrası AnaSayfa sayımı tazelesin
}

type Step = 'welcome' | 'excel' | 'images' | 'done';

export function WelcomeWizardModal({ isOpen, onClose, onComplete }: WelcomeWizardModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('welcome');
  const [productCount, setProductCount] = useState<number | null>(null);
  const [imageCount, setImageCount] = useState<number | null>(null);

  // Açılışta her zaman karşılama adımından başla.
  useEffect(() => {
    if (isOpen) setStep('welcome');
  }, [isOpen]);

  // Done adımına gelince eklenen ürün/resim sayımlarını çek ve dashboard'a haber ver.
  useEffect(() => {
    if (step !== 'done') return;
    onComplete?.();
    let active = true;
    void (async () => {
      try {
        const [prodRes, imgRes] = await Promise.all([
          api.get('/products'),
          api.get('/product-images'),
        ]);
        if (!active) return;
        setProductCount(prodRes.data?.total ?? prodRes.data?.data?.length ?? 0);
        setImageCount(Array.isArray(imgRes.data) ? imgRes.data.length : 0);
      } catch {
        if (!active) return;
        setProductCount((c) => c ?? 0);
        setImageCount((c) => c ?? 0);
      }
    })();
    return () => {
      active = false;
    };
  }, [step, onComplete]);

  if (!isOpen) return null;

  // Ürün/resim adımları: yalnızca ilgili çocuk modal render edilir.
  if (step === 'excel') {
    return (
      <ExcelImportModal
        isOpen
        onImported={() => setStep('images')}
        onClose={onClose}
      />
    );
  }

  if (step === 'images') {
    return (
      <ProductImageUploadModal
        isOpen
        onSaved={() => setStep('done')}
        onClose={() => setStep('done')}
      />
    );
  }

  // welcome / done — wizard'ın kendi modal kabuğu.
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-md shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Kapat"
        >
          <X size={20} />
        </button>

        {step === 'welcome' && (
          <div className="px-8 py-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-4">
              <Sparkles size={26} />
            </div>
            <h2 className="text-heading-xl text-text-primary">🎉 Presserdiado'ya Hoş Geldiniz!</h2>
            <p className="text-body-md text-text-secondary mt-2 max-w-sm">
              Ürün havuzunuzu kurarak tasarım yapmaya başlayabilirsiniz. 3 adımda 5 dakikada
              hazır olursunuz.
            </p>
            <div className="flex flex-col items-center gap-2 mt-8 w-full">
              <Button
                variant="primary"
                size="md"
                onClick={() => setStep('excel')}
                className="w-full"
              >
                Ürün Listemi Yükle
                <ArrowRight size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Daha Sonra
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="px-8 py-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-surface-subtle text-success flex items-center justify-center mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h2 className="text-heading-xl text-text-primary">✅ Harika! Ürün havuzunuz hazır.</h2>
            <p className="text-body-md text-text-secondary mt-2">
              {productCount ?? 0} ürün ve {imageCount ?? 0} resim eklendi.
            </p>
            <div className="flex flex-col items-center gap-2 mt-8 w-full">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/new')}
                className="w-full"
              >
                Tasarım Yapmaya Başla
                <ArrowRight size={16} />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Dashboard'a Dön
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
