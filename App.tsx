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

interface ImageItem {
    id: string;
    file: File;
    url: string;
    name: string;
}

interface AspectRatioPreset {
    id: string;
    label: string;
    ratio: number | null;
    description: string;
}

const POSITIONS: { id: WatermarkPosition; label: string }[] = [
    { id: 'top-left', label: 'Haut Gauche' },
    { id: 'top-right', label: 'Haut Droite' },
    { id: 'bottom-left', label: 'Bas Gauche' },
    { id: 'bottom-right', label: 'Bas Droite' },
    { id: 'bottom-center', label: 'Bas Centré' },
    { id: 'center', label: 'Centré' },
];

const PRESETS: AspectRatioPreset[] = [
    { id: 'original', label: 'Original', ratio: null, description: 'Résolution native de la photo' },
    { id: '1:1', label: '1:1 (Instagram)', ratio: 1, description: 'Format carré post classique' },
    { id: '4:5', label: '4:5 (Instagram)', ratio: 4/5, description: 'Format portrait optimal' },
    { id: '9:16', label: '9:16 (Story / Reel)', ratio: 9/16, description: 'Format plein écran mobile' },
    { id: '16:9', label: '16:9 (Paysage)', ratio: 16/9, description: 'Format standard paysage' },
];

const CATEGORIES = [
    "Acoustique",
    "Plafond tendu",
    "Placard sur mesure",
    "Meuble sur mesure",
    "Dressing",
    "Bibliothèque",
    "Cuisine",
    "Rénovation cuisine",
    "Covering",
    "Store"
];

const INITIAL_STATE: WatermarkState = {
    position: 'bottom-right',
    opacity: 60, // Default to 60 as requested
    scale: 18,  // Default to 18 as requested
};

// --- DEFAULT LOGO ---
const DEFAULT_WATERMARK_URL = "https://images.weserv.nl/?url=https%3A%2F%2Flebilleteco.com%2Fwp-content%2Fuploads%2F2026%2F07%2FNouveau-projet-1.png";


// --- HELPERS ---

interface CropBounds {
    sourceX: number;
    sourceY: number;
    targetWidth: number;
    targetHeight: number;
}

const getCropBounds = (width: number, height: number, ratio: number | null): CropBounds => {
    if (!ratio) {
        return { sourceX: 0, sourceY: 0, targetWidth: width, targetHeight: height };
    }
    let targetWidth = width;
    let targetHeight = height;
    if (width / height > ratio) {
        // Wider than target ratio: crop sides
        targetWidth = Math.round(height * ratio);
        targetHeight = height;
    } else {
        // Taller than target ratio: crop top & bottom
        targetWidth = width;
        targetHeight = Math.round(width / ratio);
    }
    const sourceX = Math.round((width - targetWidth) / 2);
    const sourceY = Math.round((height - targetHeight) / 2);
    return { sourceX, sourceY, targetWidth, targetHeight };
};

const getWatermarkPreviewStyle = (state: WatermarkState): React.CSSProperties => {
    const style: React.CSSProperties = {
        position: 'absolute',
        opacity: state.opacity / 100,
        width: `${state.scale}%`,
        transition: 'all 0.2s ease-in-out',
    };
    
    const padding = '4%';

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
      {title && <h3 className="text-md font-medium text-gray-700 mb-2">{title}</h3>}
      <label htmlFor={id} className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex justify-center items-center cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-colors duration-300 overflow-hidden bg-gray-55/40">
        {imageUrl ? (
          <img src={imageUrl} alt="Aperçu" className="h-full w-full object-contain p-2" />
        ) : (
          <div className="text-center text-gray-500 p-4">
            <UploadIcon className="w-8 h-8 mx-auto" />
            <p className="mt-1 text-xs font-medium">Cliquez pour choisir</p>
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

const MultiImageUploader: React.FC<{
  images: ImageItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onAddImages: (files: FileList | null) => void;
}> = ({ images, selectedId, onSelect, onRemove, onAddImages }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onAddImages(e.dataTransfer.files);
  };

  return (
    <div className="w-full flex flex-col">
      <h3 className="text-md font-medium text-gray-700 mb-2">1. Image(s) principale(s)</h3>
      
      {images.length === 0 ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300 ${
            isDragOver ? 'border-indigo-600 bg-indigo-50 scale-[1.01]' : 'border-gray-300 hover:border-indigo-500 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById('multi-file-input')?.click()}
        >
          <UploadIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          <p className="text-xs text-gray-600 font-semibold text-center px-2">Déposez des images ou cliquez pour choisir</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Plus de 8 images supportées</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 flex flex-col space-y-2">
          <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
            <span>{images.length} image{images.length > 1 ? 's' : ''} chargée{images.length > 1 ? 's' : ''}</span>
            <button 
              type="button"
              onClick={() => document.getElementById('multi-file-input')?.click()}
              className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Ajouter
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-0.5">
            {images.map((img) => (
              <div 
                key={img.id}
                className={`relative aspect-square rounded-md overflow-hidden border-2 cursor-pointer group transition-all ${
                  selectedId === img.id ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => onSelect(img.id)}
              >
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(img.id);
                  }}
                  className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity hover:bg-red-700 shadow"
                  title="Supprimer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                {selectedId === img.id && (
                  <div className="absolute bottom-0 inset-x-0 bg-indigo-600/80 text-white text-[9px] text-center py-0.5 font-bold">
                    Actif
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <input
        type="file"
        id="multi-file-input"
        accept="image/png, image/jpeg, image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          onAddImages(e.target.files);
          e.target.value = '';
        }}
      />
    </div>
  );
};

const WatermarkSelector: React.FC<{
  watermarkType: 'default' | 'custom';
  onTypeChange: (type: 'default' | 'custom') => void;
  customWatermarkUrl: string | null;
  onCustomWatermarkChange: (file: File | null) => void;
}> = ({ watermarkType, onTypeChange, customWatermarkUrl, onCustomWatermarkChange }) => {
  return (
    <div className="w-full flex flex-col">
      <h3 className="text-md font-medium text-gray-700 mb-2">2. Filigrane</h3>
      
      <div className="flex bg-gray-100 p-1 rounded-lg mb-2">
        <button
          type="button"
          onClick={() => onTypeChange('default')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            watermarkType === 'default' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Logo par défaut
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('custom')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            watermarkType === 'custom' 
              ? 'bg-white text-indigo-600 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Logo personnalisé
        </button>
      </div>

      {watermarkType === 'default' ? (
        <div className="w-full h-32 border border-gray-200 rounded-lg flex flex-col justify-center items-center bg-gray-50 p-2 text-center">
          <div className="bg-neutral-800 rounded p-1.5 max-w-full overflow-hidden flex items-center justify-center shadow-inner">
            <img 
              src={DEFAULT_WATERMARK_URL} 
              alt="Logo Morosini" 
              className="max-h-12 h-auto object-contain" 
            />
          </div>
          <span className="text-[10px] text-gray-500 mt-1.5 font-bold tracking-wider text-indigo-600">MOROSINI LOGO</span>
        </div>
      ) : (
        <ImageUploader 
          id="custom-watermark-upload" 
          title="" 
          onImageChange={onCustomWatermarkChange} 
          imageUrl={customWatermarkUrl}
        />
      )}
    </div>
  );
};

const LivePreview: React.FC<{
    images: ImageItem[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    watermarkUrl: string | null;
    watermarkState: WatermarkState;
    previewZoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
    onResetZoom: () => void;
    activePreset: AspectRatioPreset;
}> = ({ images, selectedId, onSelect, watermarkUrl, watermarkState, previewZoom, onZoomIn, onZoomOut, onResetZoom, activePreset }) => {
    const activeIndex = images.findIndex(img => img.id === selectedId);
    const activeImage = images[activeIndex] || null;

    if (images.length === 0 || !activeImage) {
        return (
            <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 border border-gray-200 p-8 min-h-[300px]">
                <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm font-medium">L'aperçu apparaîtra ici.</p>
                </div>
            </div>
        )
    }

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        const prevIndex = (activeIndex - 1 + images.length) % images.length;
        onSelect(images[prevIndex].id);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        const nextIndex = (activeIndex + 1) % images.length;
        onSelect(images[nextIndex].id);
    };

    return (
        <div className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex justify-center items-center min-h-[340px] group">
            <div 
                className="w-full h-full transition-transform duration-200 ease-in-out flex items-center justify-center p-4"
                style={{ transform: `scale(${previewZoom})` }}
            >
                <div 
                    className="relative overflow-hidden shadow-sm rounded bg-white flex items-center justify-center transition-all duration-200"
                    style={{
                        aspectRatio: activePreset.ratio || undefined,
                        maxWidth: '100%',
                        maxHeight: '360px',
                        width: activePreset.ratio ? (activePreset.ratio >= 1 ? '100%' : 'auto') : 'auto',
                        height: activePreset.ratio ? (activePreset.ratio < 1 ? '360px' : 'auto') : '360px',
                    }}
                >
                    <img 
                        src={activeImage.url} 
                        alt={activeImage.name} 
                        className={`select-none pointer-events-none transition-all duration-200 ${activePreset.ratio ? 'w-full h-full object-cover' : 'max-h-[360px] w-auto object-contain'}`}
                    />
                    {watermarkUrl && (
                        <img 
                            src={watermarkUrl}
                            alt="Filigrane"
                            style={getWatermarkPreviewStyle(watermarkState)}
                            className="select-none pointer-events-none"
                        />
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <>
                    {/* Left Slide Arrow */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md opacity-0 group-hover:opacity-100 duration-200"
                        title="Image Précédente"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Right Slide Arrow */}
                    <button
                        onClick={handleNext}
                        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md opacity-0 group-hover:opacity-100 duration-200"
                        title="Image Suivante"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Active slide badge */}
                    <div className="absolute top-3 left-3 z-10 bg-black/70 backdrop-blur-sm text-white text-[11px] px-3 py-1 rounded-full font-medium shadow flex items-center gap-1.5 select-none">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        Aperçu filigrane &bull; {activeIndex + 1} / {images.length}
                    </div>

                    {/* Navigation Dots Indicator */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-1.5 bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow max-w-[90%] overflow-x-auto scrollbar-none">
                        {images.map((img, idx) => (
                            <button
                                key={img.id}
                                onClick={(e) => { e.stopPropagation(); onSelect(img.id); }}
                                className={`w-2 h-2 rounded-full transition-all shrink-0 ${idx === activeIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/80'}`}
                                title={`Image ${idx + 1}: ${img.name}`}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex items-center bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 space-x-1 border border-gray-200">
                <button onClick={onZoomOut} title="Zoom Arrière" className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-30" disabled={previewZoom <= 0.4}>
                    <ZoomOutIcon className="w-4 h-4" />
                </button>
                <button onClick={onResetZoom} title="Réinitialiser" className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-30" disabled={previewZoom === 1}>
                    <FitScreenIcon className="w-4 h-4" />
                </button>
                <button onClick={onZoomIn} title="Zoom Avant" className="p-1.5 rounded hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800 disabled:opacity-30" disabled={previewZoom >= 3}>
                    <ZoomInIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

const App: React.FC = () => {
  const [mainImages, setMainImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [watermarkType, setWatermarkType] = useState<'default' | 'custom'>('default');
  const [customWatermarkFile, setCustomWatermarkFile] = useState<File | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('original');
  const [selectedCategory, setSelectedCategory] = useState<string>(CATEGORIES[0]);
  const [customCategoryText, setCustomCategoryText] = useState<string>('');
  
  const [history, setHistory] = useState<WatermarkState[]>([INITIAL_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const [previewZoom, setPreviewZoom] = useState(1);

  const effectiveCategory = useMemo(() => {
    if (selectedCategory === '__custom__') {
      return customCategoryText.trim() || 'Personnalisé';
    }
    return selectedCategory;
  }, [selectedCategory, customCategoryText]);

  const activePreset = useMemo(() => {
    return PRESETS.find(p => p.id === selectedPresetId) || PRESETS[0];
  }, [selectedPresetId]);

  const selectedImage = useMemo(() => {
    return mainImages.find(img => img.id === selectedImageId) || null;
  }, [mainImages, selectedImageId]);

  const mainImageUrl = selectedImage ? selectedImage.url : null;
  
  const customWatermarkUrl = useMemo(() => {
    return customWatermarkFile ? URL.createObjectURL(customWatermarkFile) : null;
  }, [customWatermarkFile]);

  const watermarkUrl = useMemo(() => {
    if (watermarkType === 'default') {
      return DEFAULT_WATERMARK_URL;
    }
    return customWatermarkUrl;
  }, [watermarkType, customWatermarkUrl]);

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
  const handleZoomOut = () => setPreviewZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleResetZoom = () => setPreviewZoom(1);

  const handleAddImages = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substring(2, 9);
        const url = URL.createObjectURL(file);
        newItems.push({
          id,
          file,
          url,
          name: file.name
        });
      }
    }
    setMainImages(prev => {
      const updated = [...prev, ...newItems];
      if (!selectedImageId && updated.length > 0) {
        setSelectedImageId(updated[0].id);
      }
      return updated;
    });
  }, [selectedImageId]);

  const handleRemoveImage = useCallback((id: string) => {
    setMainImages(prev => {
      const target = prev.find(img => img.id === id);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const updated = prev.filter(img => img.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(updated.length > 0 ? updated[0].id : null);
      }
      return updated;
    });
  }, [selectedImageId]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      if (src.startsWith('http') || src.startsWith('//')) {
        img.crossOrigin = 'anonymous';
      }
      const timeout = setTimeout(() => {
        img.src = '';
        reject(new Error("Le chargement de l'image a expiré (timeout)."));
      }, 12000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };
      img.onerror = (err) => {
        clearTimeout(timeout);
        reject(new Error("Erreur de décodage de l'image ou format invalide."));
      };
      img.src = src;
    });
  };

  const generateWatermarkedBlob = async (imgItem: ImageItem, state: WatermarkState): Promise<Blob> => {
    if (!watermarkUrl) throw new Error("Aucun filigrane disponible.");
    const mainImg = await loadImage(imgItem.url);
    const watermarkImg = await loadImage(watermarkUrl);

    // Get crop bounds based on preset ratio to maintain original high resolution
    const crop = getCropBounds(mainImg.width, mainImg.height, activePreset.ratio);

    const canvas = document.createElement('canvas');
    canvas.width = crop.targetWidth;
    canvas.height = crop.targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error("Impossible de créer le contexte de dessin 2D.");

    // Draw cropped portion of the original high-res image
    ctx.drawImage(
      mainImg,
      crop.sourceX,
      crop.sourceY,
      crop.targetWidth,
      crop.targetHeight,
      0,
      0,
      crop.targetWidth,
      crop.targetHeight
    );
    
    ctx.globalAlpha = state.opacity / 100;

    const padding = canvas.width * 0.04;
    const watermarkAspectRatio = watermarkImg.width / watermarkImg.height;
    let wmWidth = canvas.width * (state.scale / 100);
    let wmHeight = wmWidth / watermarkAspectRatio;

    let x = 0, y = 0;
    switch (state.position) {
      case 'top-left': x = padding; y = padding; break;
      case 'top-right': x = canvas.width - wmWidth - padding; y = padding; break;
      case 'bottom-left': x = padding; y = canvas.height - wmHeight - padding; break;
      case 'bottom-right': x = canvas.width - wmWidth - padding; y = canvas.height - wmHeight - padding; break;
      case 'bottom-center': x = (canvas.width - wmWidth) / 2; y = canvas.height - wmHeight - padding; break;
      case 'center': x = (canvas.width - wmWidth) / 2; y = (canvas.height - wmHeight) / 2; break;
    }
    
    ctx.drawImage(watermarkImg, x, y, wmWidth, wmHeight);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("La génération de l'image finale a échoué."));
          return;
        }
        resolve(blob);
      }, 'image/png', 0.95);
    });
  };

  const processSingleImage = async (imgItem: ImageItem, state: WatermarkState, index?: number): Promise<void> => {
    const blob = await generateWatermarkedBlob(imgItem, state);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    if (index !== undefined) {
      a.download = `Morosini - ${effectiveCategory} - ${index}.png`;
    } else {
      a.download = `Morosini - ${effectiveCategory}.png`;
    }

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const handleDownloadSelected = async () => {
    if (!selectedImage || !watermarkUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      await processSingleImage(selectedImage, currentState);
      setDownloadCount(prev => prev + 1);
    } catch (err) {
      console.error(err);
      setError("Erreur : " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadAll = async () => {
    if (mainImages.length === 0 || !watermarkUrl) return;

    setIsLoading(true);
    setError(null);
    setBatchProgress({ current: 0, total: mainImages.length });

    try {
      for (let i = 0; i < mainImages.length; i++) {
        setBatchProgress({ current: i + 1, total: mainImages.length });
        await processSingleImage(mainImages[i], currentState, i + 1);
        
        // Brief sleep to avoid browser rate limits or blocking sequential triggers
        if (i < mainImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 400));
        }
      }
      setDownloadCount(prev => prev + mainImages.length);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du traitement par lot : " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
      setBatchProgress(null);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Filigrane Facile</h1>
          <p className="text-gray-500 mt-2 text-md">Ajoutez un filigrane à vos images avec une prévisualisation en direct et un traitement par lot.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* --- LEFT COLUMN: UPLOAD & CONTROLS --- */}
          <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MultiImageUploader 
                  images={mainImages} 
                  selectedId={selectedImageId} 
                  onSelect={setSelectedImageId} 
                  onRemove={handleRemoveImage} 
                  onAddImages={handleAddImages}
                />
                
                <WatermarkSelector 
                  watermarkType={watermarkType} 
                  onTypeChange={setWatermarkType} 
                  customWatermarkUrl={customWatermarkUrl} 
                  onCustomWatermarkChange={setCustomWatermarkFile}
                />
            </div>
            
            <div className="border-t pt-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-bold text-gray-800 uppercase tracking-wider">3. Personnalisation</h3>
                <div className="flex space-x-1.5">
                    <button onClick={handleUndo} disabled={!canUndo} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Annuler"><UndoIcon className="w-4 h-4" /></button>
                    <button onClick={handleRedo} disabled={!canRedo} className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors" title="Rétablir"><RedoIcon className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Format / Réseau Social</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {PRESETS.map(preset => (
                            <button
                                key={preset.id}
                                type="button"
                                onClick={() => setSelectedPresetId(preset.id)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-all select-none ${
                                    selectedPresetId === preset.id
                                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100 font-semibold'
                                        : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                                title={preset.description}
                            >
                                <span className="text-xs font-semibold">{preset.label}</span>
                                <span className="text-[9px] text-gray-400 mt-0.5 font-medium">{preset.id === 'original' ? 'Plein format' : preset.id}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie pour le renommage</label>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                    >
                        {CATEGORIES.map(category => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                        <option value="__custom__">✨ Autre (texte personnalisé...)</option>
                    </select>

                    {selectedCategory === '__custom__' && (
                        <div className="mt-2">
                            <input
                                type="text"
                                placeholder="Entrez votre catégorie personnalisée..."
                                value={customCategoryText}
                                onChange={(e) => setCustomCategoryText(e.target.value)}
                                className="w-full px-3 py-2 bg-white border border-indigo-200 rounded-lg text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
                            />
                        </div>
                    )}

                    <div className="mt-2 p-2 bg-gray-50 rounded-md border border-gray-100 text-[11px] text-gray-500 font-mono break-all">
                        <span className="font-semibold text-gray-600 block mb-0.5">Aperçu du nom final :</span>
                        Morosini - <span className="text-indigo-600 font-semibold">{effectiveCategory}</span>.png
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Position du filigrane</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        {POSITIONS.map(pos => (
                            <div key={pos.id}>
                                <input type="radio" id={pos.id} name="position" value={pos.id} checked={currentState.position === pos.id} onChange={() => updateWatermarkState({ position: pos.id })} className="hidden peer" />
                                <label htmlFor={pos.id} className="inline-flex items-center justify-center w-full p-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg cursor-pointer peer-checked:border-indigo-600 peer-checked:text-indigo-600 hover:bg-gray-50 transition-all text-center select-none">                           
                                    <span>{pos.label}</span>
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="opacity-slider" className="text-sm font-semibold text-gray-700">Opacité</label>
                        <span className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{currentState.opacity}%</span>
                    </div>
                    <input id="opacity-slider" type="range" min="0" max="100" value={currentState.opacity} onChange={(e) => updateWatermarkState({ opacity: Number(e.target.value) })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="scale-slider" className="text-sm font-semibold text-gray-700">Taille du filigrane</label>
                        <span className="font-bold text-sm text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{currentState.scale}%</span>
                    </div>
                    <input id="scale-slider" type="range" min="1" max="50" value={currentState.scale} onChange={(e) => updateWatermarkState({ scale: Number(e.target.value) })} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: PREVIEW & ACTION --- */}
          <div className="flex flex-col justify-between h-full space-y-4">
            <div>
              <h3 className="text-md font-bold text-gray-800 uppercase tracking-wider mb-2 text-center lg:text-left">Aperçu en direct</h3>
              <LivePreview 
                  images={mainImages}
                  selectedId={selectedImageId}
                  onSelect={setSelectedImageId}
                  watermarkUrl={watermarkUrl} 
                  watermarkState={currentState}
                  previewZoom={previewZoom}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onResetZoom={handleResetZoom}
                  activePreset={activePreset}
              />
            </div>
            
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium text-center" role="alert">
                    <span>{error}</span>
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleDownloadSelected}
                  disabled={mainImages.length === 0 || !watermarkUrl || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isLoading && !batchProgress ? (
                    <span className="flex items-center"><SpinnerIcon />Traitement...</span>
                  ) : (
                    "Télécharger l'image active"
                  )}
                </button>

                <button
                  onClick={handleDownloadAll}
                  disabled={mainImages.length === 0 || !watermarkUrl || isLoading}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isLoading && batchProgress && !error ? (
                    <span className="flex items-center">
                      <SpinnerIcon />
                      En cours ({batchProgress.current}/{batchProgress.total})...
                    </span>
                  ) : (
                    `Tout télécharger un par un (${mainImages.length})`
                  )}
                </button>
              </div>

              {mainImages.length > 0 && (
                <p className="text-[11px] text-gray-400 text-center font-medium">
                  Astuce : Utilisez les flèches ou les points sur l'aperçu pour faire défiler vos photos avec leurs filigranes.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
