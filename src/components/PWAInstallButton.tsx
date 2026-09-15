import React, { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2E2822] text-[#FAF7F2] hover:bg-[#1E1915] active:scale-95 transition-all shadow-sm"
        title="Instalar como App en celular o tableta"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#D5CCBE] bg-[#FAF7F2] text-[#4A3E34] hover:bg-[#F0ECE1] active:scale-95 transition-all"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Instalar en iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-sm rounded-2xl bg-[#FAF7F2] border border-[#D5CCBE] p-5 shadow-2xl text-[#2D2A26]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E1D5]">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#8C6D46]" />
                  Instalar en iPhone o iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-md text-stone-500 hover:text-stone-800 hover:bg-stone-200/50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="mt-3 text-sm text-stone-600 leading-relaxed">
                Para usar la libreta en pantalla completa como una app nativa:
              </p>
              <ol className="mt-3 text-sm text-stone-700 space-y-2 list-decimal list-inside bg-[#F2EDE2] p-3 rounded-xl border border-[#E0D8C8]">
                <li>Toca el botón <strong>Compartir</strong> <span className="text-xs bg-stone-200 px-1.5 py-0.5 rounded">↑</span> en Safari.</li>
                <li>Desplaza hacia abajo y selecciona <strong>«Agregar al inicio»</strong>.</li>
                <li>Toca <strong>Agregar</strong> en la esquina superior.</li>
              </ol>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#2E2822] text-[#FAF7F2] font-semibold text-sm hover:bg-[#1E1915]"
              >
                Entendido
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
