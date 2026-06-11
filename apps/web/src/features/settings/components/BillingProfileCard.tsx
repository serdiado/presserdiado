import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Building2, CheckCircle2, Home, MoreVertical, Pencil, Star, Trash2, UserRound } from 'lucide-react';
import type { BillingProfile } from '../types';

interface BillingProfileCardProps {
  profile: BillingProfile;
  onEdit: (profile: BillingProfile) => void;
  onDelete: (profile: BillingProfile) => void;
  onSetDefault: (profile: BillingProfile) => void;
}

const overlineClass = 'text-body-xs font-semibold tracking-normal text-text-muted';

export function BillingProfileCard({
  profile,
  onEdit,
  onDelete,
  onSetDefault,
}: BillingProfileCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCorporate = profile.type === 'corporate';

  useEffect(() => {
    if (!isMenuOpen) return;
    const close = () => setIsMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isMenuOpen]);

  return (
    <article className="relative bg-surface-panel border border-border-default rounded-radius-lg p-6 transition-colors hover:border-border-strong">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full bg-surface-subtle text-text-secondary flex items-center justify-center shrink-0">
          {isCorporate ? <Building2 size={20} /> : <UserRound size={20} />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className={overlineClass}>PROFİL ÖZETİ</div>
              <h3 className="text-heading-md text-text-primary mt-1 truncate">{profile.title}</h3>
              <p className="text-body-sm text-text-secondary mt-1">
                {isCorporate ? 'Kurumsal fatura profili' : 'Bireysel fatura profili'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {profile.isDefault && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-radius-md border border-border-default bg-surface-subtle text-body-xs text-text-primary">
                  <CheckCircle2 size={14} className="text-primary" />
                  Varsayılan
                </span>
              )}

              <div className="relative" onMouseDown={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsMenuOpen((current) => !current);
                  }}
                  className="h-8 w-8 rounded-radius-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle flex items-center justify-center transition-colors"
                  aria-label="Profil menüsü"
                >
                  <MoreVertical size={16} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-1 z-50 w-44 bg-surface-panel border border-border-default rounded-radius-md shadow-drop-lg py-1 animate-in fade-in slide-in-from-top-2 duration-100">
                    <MenuButton
                      icon={<Pencil size={14} />}
                      label="Profil Düzenleme"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onEdit(profile);
                      }}
                    />
                    {!profile.isDefault && (
                      <MenuButton
                        icon={<Star size={14} />}
                        label="Varsayılan Profil"
                        onClick={() => {
                          setIsMenuOpen(false);
                          onSetDefault(profile);
                        }}
                      />
                    )}
                    <MenuButton
                      icon={<Trash2 size={14} />}
                      label="Profil Silme"
                      danger
                      onClick={() => {
                        setIsMenuOpen(false);
                        onDelete(profile);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <AddressBlock title="Fatura Adresi" value={profile.invoiceAddress} />
            <AddressBlock title="Sevk Adresi" value={profile.shippingAddress} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-body-xs text-text-secondary">
            {isCorporate && profile.taxOffice && <MetaPill label="Vergi Dairesi" value={profile.taxOffice} />}
            {isCorporate && profile.taxNumber && <MetaPill label="Vergi No" value={profile.taxNumber} />}
            {!isCorporate && profile.idNumber && <MetaPill label="TCKN" value={profile.idNumber} />}
          </div>
        </div>
      </div>
    </article>
  );
}

function AddressBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-subtle p-3">
      <div className="flex items-center gap-2 text-label-md text-text-primary mb-1.5">
        <Home size={14} />
        {title}
      </div>
      <p className="text-body-sm text-text-secondary leading-relaxed line-clamp-3">{value}</p>
    </div>
  );
}

function MetaPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-radius-md border border-border-default bg-surface-subtle">
      <span className="text-text-muted">{label}</span>
      <span className="text-text-primary">{value}</span>
    </span>
  );
}

function MenuButton({
  icon,
  label,
  danger = false,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full px-3 py-2 text-left text-body-xs flex items-center gap-2 cursor-pointer transition-colors',
        danger
          ? 'text-danger hover:bg-danger-subtle hover:text-danger-hover'
          : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary',
      ].join(' ')}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}