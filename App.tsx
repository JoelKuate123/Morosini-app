import React, { useState, useCallback, useMemo } from 'react';

// --- ICONS ---

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
  </svg>
);

const SpinnerIcon: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const UndoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
    </svg>
);

const RedoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
    </svg>
);

const ZoomInIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
    </svg>
);

const ZoomOutIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM13.5 10.5h-6" />
    </svg>
);

const FitScreenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
    </svg>
);


// --- TYPES & CONSTANTS ---

type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' | 'bottom-center';

interface WatermarkState {
    position: WatermarkPosition;
    opacity: number;
    scale: number;
}

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
    { id: 'top-left', label: 'Haut Gauche' },
    { id: 'top-right', label: 'Haut Droite' },
    { id: 'bottom-left', label: 'Bas Gauche' },
    { id: 'bottom-right', label: 'Bas Droite' },
    { id: 'bottom-center', label: 'Bas Centré' },
    { id: 'center', label: 'Centré' },
];

const INITIAL_STATE: WatermarkState = {
    position: 'bottom-right',
    opacity: 100,
    scale: 15,
};


// --- HELPERS ---

const getWatermarkPreviewStyle = (state: WatermarkState): React.CSSProperties => {
    const style: React.CSSProperties = {
        position: 'absolute',
        opacity: state.opacity / 100,
        width: `${state.scale}%`,
        transition: 'all 0.2s ease-in-out',
    };
    
    const padding = '2%';

    switch (state.position) {
        case 'top-left':
            style.top = padding;
            style.left = padding;
            break;
        case 'top-right':
            style.top = padding;
            style.right = padding;
            break;
        case 'bottom-left':
            style.bottom = padding;
            style.left = padding;
            break;
        case 'bottom-right':
            style.bottom = padding;
            style.right = padding;
            break;
        case 'center':
            style.top = '50%';
            style.left = '50%';
            style.transform = 'translate(-50%, -50%)';
            break;
        case 'bottom-center':
            style.bottom = padding;
            style.left = '50%';
            style.transform = 'translateX(-50%)';
            break;
    }
    return style;
};


// --- COMPONENTS ---

const ImageUploader: React.FC<{
  id: string;
  title: string;
  onImageChange: (file: File | null) => void;
  imageUrl: string | null;
}> = ({ id, title, onImageChange, imageUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onImageChange(file || null);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <h3 className="text-md font-medium text-gray-700 mb-2">{title}</h3>
      <label htmlFor={id} className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors duration-300 overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt="Aperçu" className="h-full w-full object-cover" />
        ) : (
          <div className="text-center text-gray-500 p-4">
            <UploadIcon className="w-10 h-10 mx-auto" />
            <p className="mt-1 text-sm">Cliquez pour choisir</p>
          </div>
        )}
      </label>
      <input
        type="file"
        id={id}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

const LivePreview: React.FC<{
    mainImageUrl: string | null;
    watermarkUrl: string | null;
    watermarkState: WatermarkState;
    previewZoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
}> = ({ mainImageUrl, watermarkUrl, watermarkState, previewZoom, onZoomIn, onZoomOut, onResetZoom }) => {
    if (!mainImageUrl) {
        return (
            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 shadow-inner">
                <p>L'aperçu apparaîtra ici.</p>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full bg-gray-200 rounded-lg overflow-hidden shadow-inner">
             <div 
                className="w-full h-full transition-transform duration-200 ease-in-out"
                style={{ transform: `scale(${previewZoom})` }}
            >
                <div className="relative w-full h-full">
                    <img 
                        src={mainImageUrl} 
                        alt="Aperçu de l'image principale" 
                        className="w-full h-full object-cover" 
                    />
                    {watermarkUrl && (
                        <img 
                            src={watermarkUrl}
                            alt="Aperçu du filigrane"
                            style={getWatermarkPreviewStyle(watermarkState)}
                        />
                    )}
                </div>
            </div>

            <div className="absolute bottom-3 right-3 z-10 flex items-center bg-white/80 backdrop-blur-sm rounded-lg shadow-md p-1 space-x-1">
                <button onClick={onZoomOut} title="Zoom Arrière" className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50" disabled={previewZoom <= 0.2}>
                    <ZoomOutIcon className="w-5 h-5" />
                </button>
                <button onClick={onResetZoom} title="Réinitialiser" className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50" disabled={previewZoom === 1}>
                    <FitScreenIcon className="w-5 h-5" />
                </button>
                <button onClick={onZoomIn} title="Zoom Avant" className="p-2 rounded-md hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-50" disabled={previewZoom >= 3}>
                    <ZoomInIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}

const App: React.FC = () => {
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [watermark, setWatermark] = useState<File | null>(null);
  const [history, setHistory] = useState<WatermarkState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const [previewZoom, setPreviewZoom] = useState(1);

  const mainImageUrl = useMemo(() => mainImage ? URL.createObjectURL(mainImage) : null, [mainImage]);
  const watermarkUrl = useMemo(() => watermark ? URL.createObjectURL(watermark) : null, [watermark]);

  const currentState = history[historyIndex];
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const updateWatermarkState = (newState: Partial<WatermarkState>) => {
    const nextState = { ...currentState, ...newState };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(nextState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => { if (canUndo) setHistoryIndex(historyIndex - 1) };
  const handleRedo = () => { if (canRedo) setHistoryIndex(historyIndex + 1) };

  const handleZoomIn = () => setPreviewZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 0.2, 0.2));
  const handleResetZoom = () => setPreviewZoom(1);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
      img.src = src;
    });
  };

  const handleMergeAndDownload = async () => {
    if (!mainImage || !watermark || !mainImageUrl || !watermarkUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const mainImg = await loadImage(mainImageUrl);
      const watermarkImg = await loadImage(watermarkUrl);

      const canvas = document.createElement('canvas');
      canvas.width = mainImg.width;
      canvas.height = mainImg.height;
      const ctx = canvas.getContext('2d');

      if (!ctx) throw new Error("Impossible d'obtenir le contexte du canvas.");

      ctx.drawImage(mainImg, 0, 0);
      ctx.globalAlpha = currentState.opacity / 100;

      const padding = canvas.width * 0.02;
      const watermarkAspectRatio = watermarkImg.width / watermarkImg.height;
      let wmWidth = canvas.width * (currentState.scale / 100);
      let wmHeight = wmWidth / watermarkAspectRatio;

      let x = 0, y = 0;
      switch (currentState.position) {
        case 'top-left': x = padding; y = padding; break;
        case 'top-right': x = canvas.width - wmWidth - padding; y = padding; break;
        case 'bottom-left': x = padding; y = canvas.height - wmHeight - padding; break;
        case 'bottom-right': x = canvas.width - wmWidth - padding; y = canvas.height - wmHeight - padding; break;
        case 'bottom-center': x = (canvas.width - wmWidth) / 2; y = canvas.height - wmHeight - padding; break;
        case 'center': x = (canvas.width - wmWidth) / 2; y = (canvas.height - wmHeight) / 2; break;
      }
      
      ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          setError("Erreur lors de la création de l'image finale.");
          setIsLoading(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const newDownloadCount = downloadCount + 1;
        setDownloadCount(newDownloadCount);
        a.download = `Morosini - ${newDownloadCount}.png`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsLoading(false);
      }, 'image/png', 0.95);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors du traitement des images.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Filigrane Facile</h1>
          <p className="text-gray-500 mt-2">Ajoutez un filigrane à votre image avec une prévisualisation en direct.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN: UPLOAD & CONTROLS --- */}
          <div className="flex flex-col space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ImageUploader id="main-image-upload" title="1. Image principale" onImageChange={setMainImage} imageUrl={mainImageUrl}/>
                <ImageUploader id="watermark-upload" title="2. Filigrane" onImageChange={setWatermark} imageUrl={watermarkUrl}/>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-700">3. Personnalisation</h3>
                <div className="flex space-x-2">
                    <button onClick={handleUndo} disabled={!canUndo} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><UndoIcon className="w-5 h-5" /></button>
                    <button onClick={handleRedo} disabled={!canRedo} className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><RedoIcon className="w-5 h-5" /></button>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                    <label className="block text-md font-medium text-gray-600 mb-2">Position</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POSITIONS.map(pos => (
                            <div key={pos.id}>
                                <input type="radio" id={pos.id} name="position" value={pos.id} checked={currentState.position === pos.id} onChange={() => updateWatermarkState({ position: pos.id })} className="hidden peer" />
                                <label htmlFor={pos.id} className="inline-flex items-center justify-center w-full p-3 text-gray-500 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:text-indigo-600 hover:text-gray-600 hover:bg-gray-100 transition-colors">                           
                                    <div className="block"><div className="w-full text-sm font-semibold">{pos.label}</div></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor="opacity-slider" className="block text-md font-medium text-gray-600 mb-2">Opacité: <span className="font-bold text-indigo-600">{currentState.opacity}%</span></label>
                    <input id="opacity-slider" type="range" min="0" max="100" value={currentState.opacity} onChange={(e) => updateWatermarkState({ opacity: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>

                <div>
                    <label htmlFor="scale-slider" className="block text-md font-medium text-gray-600 mb-2">Taille: <span className="font-bold text-indigo-600">{currentState.scale}%</span></label>
                    <input id="scale-slider" type="range" min="1" max="50" value={currentState.scale} onChange={(e) => updateWatermarkState({ scale: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PREVIEW --- */}
          <div className="lg:sticky lg:top-8 h-96 lg:h-auto">
            <h3 className="text-lg font-medium text-gray-700 mb-2 text-center lg:text-left">Aperçu en direct</h3>
            <LivePreview 
                mainImageUrl={mainImageUrl} 
                watermarkUrl={watermarkUrl} 
                watermarkState={currentState}
                previewZoom={previewZoom}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
            />
          </div>
        </div>
        
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-6 text-center" role="aleaxrt">
                <span className="block sm:inline">{error}</span>
            </div>
        )}

        <div className="text-center mt-8 pt-8 border-t">
          <button
            onClick={handleMergeAndDownload}
            disabled={!mainImage || !watermark || isLoading}
            className="w-full max-w-md inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 text-lg"
          >
            {isLoading ? (<><SpinnerIcon /><span>Traitement...</span></>) : ('4. Fusionner et Télécharger')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
