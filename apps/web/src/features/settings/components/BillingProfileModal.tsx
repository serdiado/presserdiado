import React, { useEffect, useState } from 'react';
import { Building2, Loader2, UserRound, X } from 'lucide-react';
import { Button, SegmentedControl } from '@/components/ui';
import type {
  BillingProfile,
  BillingProfileType,
  CreateBillingProfileInput,
} from '../types';

interface BillingProfileModalProps {
  isOpen: boolean;
  profile?: BillingProfile | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBillingProfileInput) => Promise<void>;
}

const emptyForm: CreateBillingProfileInput = {
  type: 'corporate',
  title: '',
  taxOffice: '',
  taxNumber: '',
  idNumber: '',
  invoiceAddress: '',
  shippingAddress: '',
  isDefault: false,
};

const fieldClass =
  'w-full h-10 px-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong placeholder:text-text-muted';

const textAreaClass =
  'w-full min-h-28 p-3 border border-border-default hover:border-border-strong rounded-radius-md text-body-md text-text-primary bg-surface-panel focus:outline-none focus:ring-2 focus:ring-border-strong resize-none placeholder:text-text-muted';

const overlineClass = 'text-body-xs font-semibold tracking-normal text-text-muted';

export function BillingProfileModal({
  isOpen,
  profile,
  saving = false,
  onClose,
  onSubmit,
}: BillingProfileModalProps) {
  const [form, setForm] = useState<CreateBillingProfileInput>(emptyForm);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      profile
        ? {
            type: profile.type,
            title: profile.title,
            taxOffice: profile.taxOffice ?? '',
            taxNumber: profile.taxNumber ?? '',
            idNumber: profile.idNumber ?? '',
            invoiceAddress: profile.invoiceAddress,
            shippingAddress: profile.shippingAddress,
            isDefault: profile.isDefault,
          }
        : emptyForm,
    );
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const updateField = <K extends keyof CreateBillingProfileInput>(
    key: K,
    value: CreateBillingProfileInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CreateBillingProfileInput = {
      type: form.type ?? 'corporate',
      title: form.title.trim(),
      taxOffice: form.taxOffice?.trim() || null,
      taxNumber: form.taxNumber?.trim() || null,
      idNumber: form.idNumber?.trim() || null,
      invoiceAddress: form.invoiceAddress.trim(),
      shippingAddress: form.shippingAddress.trim(),
      isDefault: form.isDefault ?? false,
    };

    await onSubmit(payload);
  };

  const isCorporate = (form.type ?? 'corporate') === 'corporate';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-99999 animate-fade-in">
      <div className="bg-surface-panel border border-border-default rounded-radius-xl w-full max-w-5xl shadow-drop-lg animate-in fade-in zoom-in-95 duration-150 relative max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center">
              {isCorporate ? <Building2 size={18} /> : <UserRound size={18} />}
            </div>
            <div>
              <h2 className="text-heading-xl text-text-primary">Fatura ve Sevkiyat Ayarları</h2>
              <p className="text-body-sm text-text-secondary mt-0.5">
                Fatura adresi, vergi bilgileri ve sevkiyat parametreleri
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Kapat"
            className="h-8 w-8 flex items-center justify-center rounded-radius-md text-text-muted hover:text-text-primary hover:bg-surface-subtle transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        <form id="billing-profile-form" onSubmit={handleSubmit} className="overflow-y-auto flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            <section className="bg-surface-panel border border-border-default rounded-radius-lg p-6 space-y-4">
              <div className={overlineClass}>KURUMSAL KİMLİK BİLGİLERİ</div>

              <SegmentedControl
                options={[
                  { label: 'Kurumsal', value: 'corporate' },
                  { label: 'Bireysel', value: 'individual' },
                ]}
                value={form.type ?? 'corporate'}
                onChange={(value) => updateField('type', value as BillingProfileType)}
                disabled={saving}
              />

              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  {isCorporate ? 'Şirket Unvanı' : 'Ad Soyad'} <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={255}
                  value={form.title}
                  onChange={(event) => updateField('title', event.target.value)}
                  className={fieldClass}
                />
              </div>

              {isCorporate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-text-primary mb-1.5">Vergi Dairesi</label>
                    <input
                      type="text"
                      maxLength={150}
                      value={form.taxOffice ?? ''}
                      onChange={(event) => updateField('taxOffice', event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-text-primary mb-1.5">Vergi Numarası</label>
                    <input
                      type="text"
                      maxLength={20}
                      value={form.taxNumber ?? ''}
                      onChange={(event) => updateField('taxNumber', event.target.value)}
                      className={fieldClass}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-label-md text-text-primary mb-1.5">TCKN</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={11}
                    value={form.idNumber ?? ''}
                    onChange={(event) => updateField('idNumber', event.target.value)}
                    className={fieldClass}
                  />
                </div>
              )}

              <label className="flex items-center gap-3 p-3 rounded-radius-md border border-border-default bg-surface-subtle text-body-sm text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault ?? false}
                  onChange={(event) => updateField('isDefault', event.target.checked)}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                Varsayılan fatura profili
              </label>
            </section>

            <section className="bg-surface-panel border border-border-default rounded-radius-lg p-6 space-y-4">
              <div className={overlineClass}>TESLİMAT PARAMETRELERİ</div>

              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  Fatura Adresi <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  value={form.invoiceAddress}
                  onChange={(event) => updateField('invoiceAddress', event.target.value)}
                  className={textAreaClass}
                />
              </div>

              <div>
                <label className="block text-label-md text-text-primary mb-1.5">
                  Sevk Adresi <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  value={form.shippingAddress}
                  onChange={(event) => updateField('shippingAddress', event.target.value)}
                  className={textAreaClass}
                />
              </div>
            </section>
          </div>
          <div className="px-6 py-4 border-t border-border-default flex items-center justify-end gap-3 shrink-0">
            <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>
              Güvenli Çıkış
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={saving} className="min-w-32">
              <span className="inline-flex items-center gap-1.5">
                {saving && <Loader2 size={14} className="animate-spin" />}
                Kayıt Onayı
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}