import { useEffect, useState } from 'react';
import { AlertCircle, CreditCard, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button, ConfirmModal } from '@/components/ui';
import { useBillingStore } from '@/stores/billing.store';
import { BillingProfileCard } from '../components/BillingProfileCard';
import { BillingProfileModal } from '../components/BillingProfileModal';
import type { BillingProfile, CreateBillingProfileInput } from '../types';

export function FaturaBilgileriPage() {
  const {
    profiles,
    loading,
    saving,
    error,
    fetchProfiles,
    createProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
  } = useBillingStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BillingProfile | null>(null);
  const [deletingProfile, setDeletingProfile] = useState<BillingProfile | null>(null);

  useEffect(() => {
    void fetchProfiles().catch(() => undefined);
  }, [fetchProfiles]);

  const handleNewProfile = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: CreateBillingProfileInput) => {
    if (editingProfile) {
      await updateProfile(editingProfile.id, data);
      toast.success('Fatura profili güncellendi');
    } else {
      await createProfile(data);
      toast.success('Fatura profili oluşturuldu');
    }

    await fetchProfiles();
    setIsModalOpen(false);
    setEditingProfile(null);
  };

  const handleSetDefault = async (profile: BillingProfile) => {
    await setDefaultProfile(profile.id);
    toast.success('Varsayılan fatura profili güncellendi');
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProfile) return;
    await deleteProfile(deletingProfile.id);
    toast.success('Fatura profili silindi');
    setDeletingProfile(null);
  };

  if (loading && profiles.length === 0) {
    return (
      <div className="p-8 w-full max-w-300 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-heading-xl text-text-primary">Fatura Bilgileri</h1>
          <div className="w-40 h-9 bg-surface-subtle animate-pulse rounded-radius-md" />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-56 bg-surface-panel border border-border-default rounded-radius-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error && profiles.length === 0) {
    return (
      <div className="p-8 h-full flex flex-col items-center justify-center">
        <AlertCircle size={48} className="text-danger mb-4" />
        <p className="text-body-md text-text-secondary mb-4">{error}</p>
        <Button variant="secondary" onClick={() => void fetchProfiles()} leftIcon={<RefreshCw size={16} />}>
          Yeniden Yükleme
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-300 mx-auto flex flex-col">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-heading-xl text-text-primary">Fatura Bilgileri</h1>
          <p className="text-body-sm text-text-secondary mt-1">
            Fatura profilleri, vergi bilgileri ve sevkiyat adresleri
          </p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={handleNewProfile}>
          Yeni Profil Belgesi
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="flex-1 min-h-120 flex flex-col items-center justify-center bg-surface-panel border border-dashed border-border-strong rounded-radius-lg p-8">
          <div className="w-16 h-16 rounded-full bg-surface-subtle flex items-center justify-center text-text-muted mb-4">
            <CreditCard size={32} strokeWidth={1.5} />
          </div>
          <div className="text-body-xs font-semibold tracking-normal text-text-muted mb-2">
            PROFİL ÖZETİ
          </div>
          <h3 className="text-heading-md text-text-primary mb-1">Fatura profili bulunmamaktadır</h3>
          <p className="text-body-sm text-text-secondary mb-6 max-w-md text-center">
            Sipariş ve ödeme adımlarında kullanılacak kurumsal veya bireysel fatura bilgileri burada saklanır.
          </p>
          <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={handleNewProfile}>
            Yeni Profil Belgesi
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {profiles.map((profile) => (
            <BillingProfileCard
              key={profile.id}
              profile={profile}
              onEdit={(selected) => {
                setEditingProfile(selected);
                setIsModalOpen(true);
              }}
              onDelete={setDeletingProfile}
              onSetDefault={(selected) => void handleSetDefault(selected)}
            />
          ))}
        </div>
      )}

      <BillingProfileModal
        isOpen={isModalOpen}
        profile={editingProfile}
        saving={saving}
        onClose={() => {
          if (saving) return;
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={deletingProfile !== null}
        title="Fatura Profili Silme"
        description="Bu fatura profili hesap kayıtlarından kaldırılır. Sipariş geçmişindeki kayıtlar etkilenmez."
        confirmLabel="Silme Onayı"
        cancelLabel="Güvenli Alan"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProfile(null)}
      />
    </div>
  );
}