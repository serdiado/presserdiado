// "Resimleri Eşleştir" butonu — interaktif eşleştirme inceleme modalını açar.
// Hem Ürün Listelerim hem Ürün Resimleri sayfasında aynı işlevle kullanılır.

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RematchModal } from './RematchModal';

interface RematchImagesButtonProps {
  onDone?: () => void;
}

export function RematchImagesButton({ onDone }: RematchImagesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="md"
        leftIcon={<Wand2 size={16} />}
        onClick={() => setIsOpen(true)}
      >
        Resimleri Eşleştir
      </Button>

      <RematchModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSaved={() => onDone?.()}
      />
    </>
  );
}
