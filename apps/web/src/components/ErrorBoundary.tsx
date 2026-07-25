import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

// Beklenmedik render hatalarında tüm uygulamanın boş beyaz ekrana düşmesini önler.
// Hata raporlama servisi yok — şimdilik console.error'a loglanır.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Yakalanmamış render hatası:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-2">Bir şeyler ters gitti</h1>
          <p className="text-sm text-slate-500 mb-6">
            Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyin; sorun devam ederse bizimle iletişime geçin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }
}
