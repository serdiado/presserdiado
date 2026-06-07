import { useEffect, useState } from 'react';
import { useUIStore } from '@/stores/studio';
import { Minus, Plus } from 'lucide-react';

export function ZoomWidget() {
  const userScale = useUIStore((s) => s.userScale);
  const setUserZoom = useUIStore((s) => s.setUserZoom);
  const resetZoom = useUIStore((s) => s.resetZoom);

  const [inputValue, setInputValue] = useState(`${Math.round(userScale * 100)}%`);

  useEffect(() => {
    setInputValue(`${Math.round(userScale * 100)}%`);
  }, [userScale]);

  const handleZoomIn = () => {
    const next = Math.min(4.0, Math.round((userScale + 0.1) * 10) / 10);
    setUserZoom(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(0.1, Math.round((userScale - 0.1) * 10) / 10);
    setUserZoom(next);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    applyTypedZoom();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      applyTypedZoom();
    } else if (e.key === 'Escape') {
      setInputValue(`${Math.round(userScale * 100)}%`);
      e.currentTarget.blur();
    }
  };

  const applyTypedZoom = () => {
    const parsed = parseInt(inputValue.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 10 && parsed <= 400) {
      setUserZoom(parsed / 100);
    } else {
      setInputValue(`${Math.round(userScale * 100)}%`);
    }
  };

  return (
    <div className="flex items-center bg-surface-panel border border-border-strong rounded-radius-md h-8 overflow-hidden shrink-0">
      {/* Zoom Out Button */}
      <button
        onClick={handleZoomOut}
        title="Uzaklaştır"
        className="h-full px-2 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors border-r border-border-default"
      >
        <Minus size={14} />
      </button>

      {/* Percent Input */}
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        className="w-12 h-full text-center text-body-md font-medium text-text-secondary focus:text-text-primary bg-transparent focus:outline-none focus:bg-surface-subtle transition-all"
      />

      {/* Zoom In Button */}
      <button
        onClick={handleZoomIn}
        title="Yakınlaştır"
        className="h-full px-2 flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors border-l border-border-default"
      >
        <Plus size={14} />
      </button>

      {/* Fit Button */}
      <button
        onClick={resetZoom}
        title="Sığdır (100%)"
        className="h-full px-3 flex items-center justify-center text-body-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors border-l border-border-strong bg-surface-subtle/50"
      >
        Fit
      </button>
    </div>
  );
}
