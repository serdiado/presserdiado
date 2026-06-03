import { Move } from 'lucide-react';

export function DragHandle({ visible, style }: { visible: boolean; style?: React.CSSProperties }) {
  if (!visible) return null;
  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
      style={style}
    >
      <div className="bg-black/50 rounded-full p-4 border border-white/20 shadow-lg">
        <Move size={48} className="text-white" />
      </div>
    </div>
  );
}
