import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import { Upload, Download, Sliders, Crop as CropIcon, ImageIcon, X, Plus, Layers, Check, Wand2, ArrowLeft, Zap, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageCropTool } from './components/ImageCropTool';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { processImageSource, loadImage, defaultSettings, ImageSettings } from './lib/image-processing';
import { FileInfo } from './types';
import { SeoGeneral, SeoSpecific } from './components/SeoContent';

// Extended formats mapping
const SUPPORTED_FORMATS = [
  { mime: 'image/jpeg', label: 'JPG' },
  { mime: 'image/png', label: 'PNG' },
  { mime: 'image/webp', label: 'WEBP' },
  { mime: 'image/avif', label: 'AVIF' },
  { mime: 'image/bmp', label: 'BMP' },
  { mime: 'image/gif', label: 'GIF' }
] as const;

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ConverterWorkspace />} />
      <Route path="/convert/:slug" element={<ConverterWorkspace />} />
    </Routes>
  );
}

function ConverterWorkspace() {
  const { slug } = useParams();

  // Identify SEO targets from URL bounds (e.g., /convert/heic-to-jpg)
  const sourceParam = slug ? slug.split('-to-')[0]?.toUpperCase() : null;
  const targetParam = slug ? slug.split('-to-')[1]?.toUpperCase() : null;

  const [images, setImages] = useState<FileInfo[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settings, setSettings] = useState<ImageSettings>(defaultSettings);
  const [isCropping, setIsCropping] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [adModal, setAdModal] = useState<{isOpen: boolean, status: 'processing' | 'ready'}>({isOpen: false, status: 'processing'});
  const [countdown, setCountdown] = useState(0);
  const [activeTab, setActiveTab] = useState<'general' | 'colors' | 'effects'>('general');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedImage = images.find(img => img.id === selectedId);

  // SEO Text Dynamic Injection, Meta Tags, JSON-LD Structured Data & Default Settings Override
  useEffect(() => {
    let metaDescription = 'کامل‌ترین ابزار آنلاین برای تغییر سایز، برش، اعمال فیلتر، تغییر فرمت به صورت دسته‌ای و پشتیبانی از فرمت‌های نسل جدید از جمله HEIC, WEBP, AVIF.';
    let metaKeywords = 'ویرایشگر عکس, تغییر سایز عکس, مبدل تصویر, ابزار آنلاین ویرایش عکس, heic to jpg, webp to png';

    if (sourceParam && targetParam) {
      document.title = `تبدیل ${sourceParam} به ${targetParam} - آنلاین و رایگان`;
      metaDescription = `بهترین ابزار برای تبدیل سریع، رایگان و بدون افت کیفیت تصاویر ${sourceParam} به ${targetParam}. هم‌اکنون به صورت دسته‌ای و آنلاین فرمت‌های خود را تغییر دهید.`;
      metaKeywords = `تبدیل ${sourceParam} به ${targetParam}, مبدل ${sourceParam}, تغییر فرمت ${targetParam}, ویرایشگر عکس آنلاین`;
      
      const matchedMime = SUPPORTED_FORMATS.find(f => f.label === targetParam)?.mime;
      if (matchedMime) {
        setSettings(s => ({ ...s, format: matchedMime as any }));
      }
    } else {
      document.title = 'مبدل پیشرفته تصویر - با پشتیبانی از HEIC، WEBP و ویرایش عکس';
    }

    // Safely update Meta Description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', metaDescription);

    // Safely update Meta Keywords
    let metaKeywordsEl = document.querySelector('meta[name="keywords"]');
    if (!metaKeywordsEl) {
      metaKeywordsEl = document.createElement('meta');
      metaKeywordsEl.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywordsEl);
    }
    metaKeywordsEl.setAttribute('content', metaKeywords);

    // Inject JSON-LD Schema (Structured Data)
    let schemaScript = document.querySelector('#seo-schema-jsonld');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.setAttribute('id', 'seo-schema-jsonld');
      document.head.appendChild(schemaScript);
    }
    
    // SoftwareApplication Schema (Highly valued by Google for Tools)
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": sourceParam && targetParam ? `ابزار آنلاین تبدیل ${sourceParam} به ${targetParam}` : "محیط ویرایشگر پیشرفته تصویر",
      "description": metaDescription,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0.00",
        "priceCurrency": "IRR"
      },
      "featureList": [
        "تغییر فرمت تصاویر به صورت گروهی",
        "ویرایش کیفیت و کاهش حجم عکس",
        "فیلترهای تاریک، روشن، سیاه و سفید",
        "پردازش و کانولوشن (فیلترهای لبه و شارپ کن)",
        "پشتیبانی از فرمت‌های HEIC و WEBP"
      ]
    };
    schemaScript.textContent = JSON.stringify(schemaData);

    // Scroll to top when changing tools (important for SPA UX)
    window.scrollTo({ top: 0, behavior: 'smooth' });

  }, [sourceParam, targetParam]);

  const handleFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith('image/') || f.name.toLowerCase().endsWith('.heic'));
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      previewUrl: URL.createObjectURL(file),
      isProcessing: false,
      isCompleted: false,
    }));
    
    setImages(prev => {
      const merged = [...prev, ...newImages];
      if (!selectedId && merged.length > 0) {
         setSelectedId(merged[0].id);
      }
      return merged;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  // Real-time Preview Generation
  useEffect(() => {
    if (!selectedImage || isCropping) return;
    const generate = async () => {
      setIsGeneratingPreview(true);
      try {
        const img = await loadImage(selectedImage.file);
        const settingsForPreview = { ...settings, crop: selectedImage.crop };
        // Preview uses a lighter quality for pure speed
        const previewSettings = { ...settingsForPreview, format: 'image/webp' as any, quality: 0.6 };
        const url = await processImageSource(img, previewSettings);
        setLivePreviewUrl(url);
      } catch (err) {
        console.error("Preview Generation Failed:", err);
      }
      setIsGeneratingPreview(false);
    };

    // Fast debounce for immediate live response even during comparison
    const timer = setTimeout(generate, 100);
    return () => clearTimeout(timer);
  }, [settings, selectedImage?.id, selectedImage?.crop, isCropping]);

  const handleDownloadSingle = () => {
    if (!selectedImage) return;
    setIsConverting(true);
    setAdModal({ isOpen: true, status: 'processing' });
    setCountdown(7);
    
    let timeLeft = 7;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        setTimeout(async () => {
          try {
            const imgEl = await loadImage(selectedImage.file);
            const imgSettings = { ...settings, crop: selectedImage.crop };
            const dataUrl = await processImageSource(imgEl, imgSettings);
            
            let ext = settings.format.split('/')[1] === 'jpeg' ? 'jpg' : settings.format.split('/')[1];
            if (ext.includes('+')) ext = ext.split('+')[0]; // fallback for weird mimes
            
            const rawName = selectedImage.file.name.substring(0, selectedImage.file.name.lastIndexOf('.')) || selectedImage.file.name;
            
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `${rawName}_converted.${ext}`;
            a.click();
            
            setAdModal({ isOpen: true, status: 'ready' });
          } catch (err) {
            console.error('Export single failed', err);
            alert('خطا در خروجی. لطفاً دوباره تلاش کنید.');
            setAdModal({ isOpen: false, status: 'ready' });
          }
          setIsConverting(false);
        }, 50); // slight UI delay after clearing interval
      }
    }, 1000);
  };

  const handleDownloadAll = () => {
    setIsConverting(true);
    setAdModal({ isOpen: true, status: 'processing' });
    setCountdown(7);

    let timeLeft = 7;
    const timer = setInterval(() => {
      timeLeft -= 1;
      setCountdown(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        setTimeout(async () => {
          try {
            const zip = new JSZip();
            for (const img of images) {
              try {
                const imgEl = await loadImage(img.file);
                const imgSettings = { ...settings, crop: img.crop };
                const dataUrl = await processImageSource(imgEl, imgSettings);
                
                const base64Data = dataUrl.split(',')[1];
                let ext = settings.format.split('/')[1] === 'jpeg' ? 'jpg' : settings.format.split('/')[1];
                if (ext.includes('+')) ext = ext.split('+')[0];
                
                const rawName = img.file.name.substring(0, img.file.name.lastIndexOf('.')) || img.file.name;
                zip.file(`${rawName}_converted.${ext}`, base64Data, { base64: true });
              } catch(e) {
                console.error(`Failed exporting ${img.file.name}`, e);
              }
            }
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_images.zip`;
            a.click();
            URL.revokeObjectURL(url);
            
            setAdModal({ isOpen: true, status: 'ready' });
          } catch (err) {
            console.error('Export failed', err);
            alert('خطا در خروجی. لطفاً دوباره تلاش کنید.');
            setAdModal({ isOpen: false, status: 'ready' });
          }
          setIsConverting(false);
        }, 50);
      }
    }, 1000);
  };

  const removeImage = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages(prev => {
      const filtered = prev.filter(i => i.id !== id);
      if (selectedId === id) setSelectedId(filtered[0]?.id || null);
      if (filtered.length === 0) setLivePreviewUrl('');
      return filtered;
    });
  };

  const updateCrop = (cropData: any) => {
    if (!selectedId) return;
    setImages(prev => prev.map(img => img.id === selectedId ? { ...img, crop: cropData } : img));
  };


  // --- Render Un-Uploaded State (SEO Focused) ---
  if (images.length === 0) {
    return (
      <div className="min-h-screen flex flex-col pt-8 pb-12 relative overflow-y-auto cool-scrollbar bg-[#050505] antialiased selection:bg-cyan-500/30">
        
        {/* Dynamic Header */}
        <header className="px-6 py-4 flex items-center justify-between z-20 max-w-7xl mx-auto w-full">
           <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-tr from-cyan-500 to-purple-500 p-2 rounded-lg shadow-lg group-hover:shadow-cyan-500/30 transition-all">
                <Layers className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-white hidden sm:block">مبدل پیشرفته <span className="text-cyan-400">تصویر</span></h1>
           </Link>
           {slug && (
              <Link to="/" className="glass-button text-sm flex items-center gap-2 text-white">
                 <ArrowLeft size={16} /> بازگشت به خانه
              </Link>
           )}
        </header>

        <div className="text-center z-10 w-full mb-10 max-w-4xl mx-auto mt-10 px-4">
            <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-lg mb-6 leading-tight">
              {sourceParam && targetParam 
                ? `مبدل هوشمند ${sourceParam} به ${targetParam}` 
                : 'مبدل و ویرایشگر پیشرفته تصویر'}
            </h1>
            <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-2xl mx-auto">
               کامل‌ترین ابزار آنلاین برای تغییر سایز، برش، اعمال فیلتر، تغییر فرمت به صورت دسته‌ای و 
               پشتیبانی از فرمت‌های نسل جدید از جمله HEIC, WEBP, AVIF.
            </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="glass-panel hover:bg-white/10 w-full max-w-3xl min-h-[300px] mx-auto rounded-3xl flex flex-col items-center justify-center cursor-pointer border-dashed border-2 border-cyan-500/30 hover:border-cyan-400 transition-all group shadow-[0_0_50px_rgba(6,182,212,0.15)] mb-16 relative overflow-hidden"
        >
          {/* subtle glow behind drop zone */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-purple-500/5 pointer-events-none"></div>

          <div className="p-8 rounded-full bg-cyan-500/20 text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/30 transition-all duration-500 mb-6 shadow-xl shadow-cyan-500/10 z-10">
            <Upload size={48} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 text-center z-10">
            {sourceParam ? `فایل‌های ${sourceParam} خود را اینجا رها کنید` : 'فایل‌های تصویر خود را اینجا رها کنید'}
          </h2>
          <p className="text-gray-400 text-sm text-center z-10 block mb-2 px-4">یا کلیک کنید تا از گالری انتخاب نمایید (پردازش ۱۰۰٪ لوکال و امن)</p>
          <input type="file" multiple accept="image/*,.heic" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        </motion.div>

        {/* SEO Multi-Routing Grid */}
        <div className="max-w-6xl mx-auto w-full px-4 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 pr-2 border-r-4 border-cyan-500">تبدیل‌های پرطرفدار</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
               <ConversionCard src="HEIC" tgt="JPG" />
               <ConversionCard src="WEBP" tgt="PNG" />
               <ConversionCard src="JPG" tgt="PNG" />
               <ConversionCard src="PNG" tgt="JPG" />
               <ConversionCard src="JPG" tgt="WEBP" />
               <ConversionCard src="SVG" tgt="PNG" />
               <ConversionCard src="PNG" tgt="WEBP" />
               <ConversionCard src="AVIF" tgt="JPG" />
               <ConversionCard src="HEIC" tgt="PNG" />
            </div>
        </div>

        {/* Inject dynamic SEO wall-of-text components */}
        {sourceParam && targetParam ? (
            <SeoSpecific source={sourceParam} target={targetParam} />
        ) : (
            <SeoGeneral />
        )}
      </div>
    );
  }

  // --- Active Workspace Render ---
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#050505] overflow-y-auto cool-scrollbar">
      {/* Top Header */}
      <header className="h-16 flex items-center justify-between px-4 md:px-6 glass-panel border-b border-l-0 border-r-0 border-t-0 rounded-none z-30 sticky top-0">
         <div className="flex items-center gap-2 md:gap-3">
            <Link to="/" className="flex items-center gap-2 md:gap-3 group">
              <div className="bg-gradient-to-tr from-cyan-500 to-purple-500 p-1.5 md:p-2 rounded-lg shadow-lg group-hover:shadow-cyan-500/30 group-hover:scale-105 transition-all cursor-pointer">
                <Layers className="text-white w-5 h-5 md:w-6 md:h-6" />
              </div>
              <h1 className="text-base md:text-xl font-black tracking-tight text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
                 {sourceParam && targetParam ? `مبدل ${sourceParam} به ${targetParam}` : 'محیط ویرایشگر پیشرفته'}
              </h1>
            </Link>
         </div>
         <div className="flex items-center gap-2 md:gap-4">
            <button className="glass-button text-xs md:text-sm !px-3 md:!px-4 flex items-center gap-1.5" onClick={() => fileInputRef.current?.click()}>
              <Plus size={16}/> <span className="hidden md:inline">افزودن</span>
            </button>
            <button 
              className="glass-button-primary text-xs md:text-sm !px-3 md:!px-4 disabled:opacity-50" 
              onClick={handleDownloadAll}
              disabled={isConverting}
            >
              {isConverting ? (
                <span className="animate-pulse">در حال ذخیره...</span>
              ) : (
                <><Download size={16} /> <span className="hidden lg:inline">دانلود همه (ZIP)</span></>
              )}
            </button>
            <input type="file" multiple accept="image/*,.heic" className="hidden" ref={fileInputRef} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
         </div>
      </header>

      {/* Main Content Area - Responsive Flex */}
      <div className="flex flex-col-reverse lg:flex-row min-h-[calc(100vh-64px)] relative">
         {/* Settings Sidebar */}
        <aside className="w-full lg:w-[380px] flex-shrink-0 lg:h-full lg:m-4 m-0 rounded-t-3xl lg:rounded-3xl glass-panel lg:border border-t border-white/10 flex flex-col sticky bottom-0 lg:top-[80px] z-20 lg:z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-2xl overflow-y-auto cool-scrollbar max-h-[45vh] lg:max-h-[calc(100vh-110px)] bg-black/80 lg:bg-black/40">
          <div className="p-3 lg:p-4 border-b border-white/10 flex flex-col gap-3 sticky top-0 bg-black/80 backdrop-blur-xl z-20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <Sliders className="text-cyan-400" size={18} />
                  <h2 className="font-bold text-sm lg:text-base text-white">تنظیمات اصلی</h2>
              </div>
              <button 
                onClick={() => setSettings(defaultSettings)}
                className="text-[10px] lg:text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 bg-white/5 rounded-md border border-white/10"
              >
                بازنشانی همه
              </button>
            </div>
            
            {/* Tabs Row */}
            <div className="flex bg-black/50 p-1 rounded-lg border border-white/10 mt-1">
               <button onClick={() => setActiveTab('general')} className={`flex-1 text-[10px] lg:text-xs py-1.5 rounded-md transition-all font-bold ${activeTab === 'general' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-gray-400 hover:text-white'}`}>عمومی</button>
               <button onClick={() => setActiveTab('colors')} className={`flex-1 text-[10px] lg:text-xs py-1.5 rounded-md transition-all font-bold ${activeTab === 'colors' ? 'bg-purple-500/20 text-purple-300 shadow-sm' : 'text-gray-400 hover:text-white'}`}>رنگ‌ها</button>
               <button onClick={() => setActiveTab('effects')} className={`flex-1 text-[10px] lg:text-xs py-1.5 rounded-md transition-all font-bold ${activeTab === 'effects' ? 'bg-cyan-500/20 text-cyan-300 shadow-sm' : 'text-gray-400 hover:text-white'}`}>افکت‌های ویژه</button>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-5 lg:gap-8 overflow-x-hidden pb-8 lg:pb-10">
            
            {/* --- TAB: GENERAL (Format, Quality, Resize) --- */}
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                {/* Format Section */}
                <section className="mb-6 lg:mb-8">
                  <label className="glass-label mb-2 flex items-center gap-2 text-xs lg:text-sm"><ImageIcon size={14}/> فرمت خروجی</label>
                  <div className="grid grid-cols-3 gap-2 lg:gap-3">
                    {SUPPORTED_FORMATS.map(({mime, label}) => {
                      const isActive = settings.format === mime;
                      return (
                        <button 
                          key={mime} 
                          onClick={() => setSettings(s => ({...s, format: mime as any}))}
                          className={`py-2 rounded-lg text-xs font-bold border transition-all ${isActive ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Quality Settings for supported formats */}
                  {(settings.format === 'image/jpeg' || settings.format === 'image/webp' || settings.format === 'image/avif') && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                      <FilterSlider label="کیفیت فشرده‌سازی (حجم)" val={settings.quality * 100} onChange={v => setSettings(s => ({...s, quality: v / 100}))} min={10} max={100} />
                      <p className="text-[10px] text-gray-500 mt-1">کاهش کیفیت باعث کاهش حجم عکس جهت استفاده در سایت می‌شود.</p>
                    </div>
                  )}
                </section>

                {/* Resize Section */}
                <section>
                  <div className="flex items-center justify-between mb-3">
                     <label className="glass-label flex items-center gap-2 mb-0"><CropIcon size={16}/> تغییر ابعاد رسانه (طول × عرض)</label>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">عرض (پیکسل)</span>
                      <input type="number" placeholder="اصلی" className="glass-input w-full text-center text-sm p-1.5" value={settings.resize.width || ''} onChange={e => setSettings(s => ({...s, resize: {...s.resize, width: e.target.value ? Number(e.target.value) : null}}))} />
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 mb-1 block">ارتفاع (پیکسل)</span>
                      <input type="number" placeholder="اصلی" className="glass-input w-full text-center text-sm p-1.5" value={settings.resize.height || ''} onChange={e => setSettings(s => ({...s, resize: {...s.resize, height: e.target.value ? Number(e.target.value) : null}}))} />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-[10px] lg:text-xs text-gray-400 cursor-pointer hover:text-cyan-300 p-2 bg-white/5 rounded-lg border border-white/5 transition-colors">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${settings.resize.maintainAspectRatio ? 'bg-cyan-500 border-cyan-400 text-white' : 'border-white/20'}`}>
                      {settings.resize.maintainAspectRatio && <Check size={10} />}
                    </div>
                    <input type="checkbox" className="hidden" checked={settings.resize.maintainAspectRatio} onChange={e => setSettings(s => ({...s, resize: {...s.resize, maintainAspectRatio: e.target.checked}}))} />
                    حفظ تناسب نسبی سایز کادر
                  </label>
                </section>
              </motion.div>
            )}

            {/* --- TAB: COLORS (Brightness, Contrast, etc.) --- */}
            {activeTab === 'colors' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
                <section className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 text-purple-300 font-bold mb-2">
                     <Wand2 size={16}/> <h3>تنظیمات نور و رنگ</h3>
                  </div>
                  
                  <FilterSlider label="روشنایی (Brightness)" val={settings.filters.brightness} onChange={v => setSettings(prev => ({ ...prev, filters: { ...prev.filters, brightness: v } }))} min={0} max={200} />
                  <FilterSlider label="کنتراست (Contrast)" val={settings.filters.contrast} onChange={v => setSettings(prev => ({ ...prev, filters: { ...prev.filters, contrast: v } }))} min={0} max={200} />
                  <FilterSlider label="غلظت رنگ (Saturation)" val={settings.filters.saturation} onChange={v => setSettings(prev => ({ ...prev, filters: { ...prev.filters, saturation: v } }))} min={0} max={200} />
                  
                  <div className="border-t border-white/5 pt-4 mt-2"></div>
                  
                  <FilterSlider label="مات‌کننده / Blur (پیکسل)" val={settings.filters.blur} onChange={v => setSettings(prev => ({ ...prev, filters: { ...prev.filters, blur: v } }))} min={0} max={20} />
                  <FilterSlider label="گِرِه‌اِسکِیل / سیاه و سفید" val={settings.filters.grayscale} onChange={v => setSettings(prev => ({ ...prev, filters: { ...prev.filters, grayscale: v } }))} min={0} max={100} />
                </section>
              </motion.div>
            )}

            {/* --- TAB: ADVANCED EFFECTS (CV Kernels) --- */}
            {activeTab === 'effects' && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <section>
                  <label className="glass-label mb-2 flex items-center gap-2 text-cyan-400 font-bold"><Layers size={16}/> الگوریتم‌های پردازش پیکسلی (CV Kernels)</label>
                  <p className="text-[10px] lg:text-xs text-gray-400 mb-5 leading-relaxed bg-cyan-900/10 p-3 rounded-lg border border-cyan-500/10">
                    این افکت‌ها با استفاده از ماتریس‌های کانولوشن (طول و عرض پیکسل‌ها) پردازش عمیق و پیچیده‌تری نسبت به فیلترهای رنگی معمولی روی تصویر شما اعمال می‌کنند. این پردازش کاملاً روی سخت‌افزار شما صورت می‌پذیرد.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setSettings(s => ({...s, cvKernel: 'none'}))}
                      className={`py-3 rounded-xl text-xs font-bold border transition-all ${settings.cvKernel === 'none' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      بدون افکت
                    </button>
                    <button 
                      onClick={() => setSettings(s => ({...s, cvKernel: 'sharpen'}))}
                      className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${settings.cvKernel === 'sharpen' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      وضوح عمیق (Sharpen)
                      <span className="text-[9px] font-normal opacity-60">مناسب تار بودن</span>
                    </button>
                    <button 
                      onClick={() => setSettings(s => ({...s, cvKernel: 'edge'}))}
                      className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${settings.cvKernel === 'edge' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      تشخیص لبه (Edge)
                      <span className="text-[9px] font-normal opacity-60">نمای شماتیک</span>
                    </button>
                    <button 
                      onClick={() => setSettings(s => ({...s, cvKernel: 'emboss'}))}
                      className={`py-3 rounded-xl text-xs font-bold border flex flex-col items-center justify-center gap-1 transition-all ${settings.cvKernel === 'emboss' ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      برجسته‌سازی (Emboss)
                      <span className="text-[9px] font-normal opacity-60">بافت ۳ بُعدی</span>
                    </button>
                  </div>
                </section>
              </motion.div>
            )}

          </div>
        </aside>

        {/* Main Editor View */}
        <main className="flex-1 flex flex-col p-2 lg:p-4 lg:pr-0 relative overflow-hidden h-[55vh] lg:h-auto">
          
          {/* Main Preview Container */}
          <div className="flex-1 glass-panel lg:rounded-3xl rounded-2xl relative overflow-hidden flex flex-col group border border-white/5 shadow-inner">
              
              {/* Top Bar inside Preview Container */}
              <div className="absolute top-2 left-2 lg:top-4 lg:left-4 z-40 flex flex-wrap items-center gap-1.5 lg:gap-2 w-[calc(100%-2rem)]">
                 <button 
                   onClick={() => { setIsCropping(false); setIsComparing(!isComparing); }} 
                   className={`glass-button text-[10px] lg:text-sm !px-2 lg:!px-4 transition-colors ${isComparing ? 'bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : ''}`}
                 >
                    <ArrowLeftRight size={14} className="lg:w-4 lg:h-4" /> {isComparing ? 'خروج از مقایسه' : 'مقایسه'}
                 </button>
                 <button onClick={() => { setIsComparing(false); setIsCropping(!isCropping); }} className={`glass-button text-[10px] lg:text-sm !px-2 lg:!px-4 ${isCropping ? 'bg-cyan-600/30 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.4)]' : ''}`}>
                    <CropIcon size={14} className="lg:w-4 lg:h-4" /> {isCropping ? 'تأیید برش' : 'برش'}
                 </button>
                 {!isCropping && !isComparing && selectedImage && (
                   <button 
                     onClick={handleDownloadSingle} 
                     disabled={isGeneratingPreview || isConverting} 
                     className="glass-button text-[10px] lg:text-sm !px-2 lg:!px-4 hover:bg-cyan-500/20 hover:border-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
                   >
                      <Download size={14} className="lg:w-4 lg:h-4" /> <span className="hidden sm:inline">دانلود</span>
                   </button>
                 )}
                 
                 {/* Live Loading Indicator */}
                 {isGeneratingPreview && (
                   <div className="mr-auto hidden sm:flex items-center gap-2 text-cyan-400 text-[10px] lg:text-xs bg-black/40 px-3 py-1.5 rounded-full border border-cyan-500/20">
                     <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                     در حال پردازش زنده...
                   </div>
                 )}
              </div>

              {selectedImage ? (
                <div className="flex-1 flex items-center justify-center p-2 lg:p-12 relative w-full h-full overflow-hidden">
                   {isCropping ? (
                      <div className="absolute inset-2 z-10 flex items-center justify-center bg-black/40 rounded-xl">
                        <ImageCropTool 
                          imageSrc={selectedImage.previewUrl} 
                          initialCrop={selectedImage.crop} 
                          onCropChange={updateCrop} 
                        />
                      </div>
                   ) : isComparing ? (
                      <div className="absolute inset-2 lg:inset-8 z-10 bg-black/40 rounded-2xl overflow-hidden border border-white/10">
                        <BeforeAfterSlider 
                          originalSrc={selectedImage.previewUrl} 
                          modifiedSrc={livePreviewUrl || selectedImage.previewUrl} 
                        />
                      </div>
                   ) : (
                     <div className="relative w-full h-full flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center -z-10 text-white/5">
                           <ImageIcon size={60} className="lg:w-[100px] lg:h-[100px]" />
                        </div>
                        <motion.img 
                          key={selectedImage.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isGeneratingPreview ? 0.3 : 1 }}
                          transition={{ duration: 0.2 }}
                          src={livePreviewUrl || selectedImage.previewUrl} 
                          className="max-w-full max-h-full object-contain drop-shadow-2xl pointer-events-none rounded sm:rounded-lg"
                        />
                        <AnimatePresence>
                          {isGeneratingPreview && (
                              <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="absolute bottom-4 lg:bottom-6 bg-black/60 backdrop-blur-md text-cyan-300 px-3 py-1 lg:px-6 lg:py-2 rounded-full font-bold shadow-[0_0_20px_rgba(6,182,212,0.2)] border border-cyan-500/20 text-[10px] lg:text-sm"
                              >
                                پردازش...
                              </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                   )}
                </div>
              ) : null}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="h-[70px] lg:h-28 mt-2 lg:mt-4 glass-panel rounded-2xl lg:rounded-3xl p-1.5 lg:p-3 flex gap-2 lg:gap-3 overflow-x-auto cool-scrollbar border border-white/5 items-center">
             {images.map(img => (
               <div 
                 key={img.id} 
                 onClick={() => { setSelectedId(img.id); setIsCropping(false); setIsComparing(false); }}
                 className={`relative w-14 h-14 lg:w-20 lg:h-20 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${selectedId === img.id ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105' : 'border-transparent hover:border-white/30 opacity-60 hover:opacity-100'}`}
               >
                 <img src={img.previewUrl} className="w-full h-full object-cover" />
                 <button 
                   onClick={(e) => removeImage(img.id, e)}
                   className="absolute top-0.5 right-0.5 lg:top-1 lg:right-1 bg-black/50 text-white rounded-full p-1 opacity-0 hover:opacity-100 hover:bg-red-500 transition-all group-hover/btn lg:parent-hover"
                 >
                   <X size={10} className="lg:w-3 lg:h-3" />
                 </button>
                 {img.crop && (
                   <div className="absolute bottom-0.5 left-0.5 lg:bottom-1 lg:left-1 bg-cyan-500/80 p-0.5 lg:p-1 rounded backdrop-blur">
                     <CropIcon size={8} className="lg:w-2.5 lg:h-2.5 text-white"/>
                   </div>
                 )}
               </div>
             ))}
          </div>
        </main>
      </div>

      {/* Ad Modal (Triggered on Download) */}
      <AnimatePresence>
        {adModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="glass-panel p-6 lg:p-8 rounded-3xl max-w-lg w-full relative flex flex-col items-center shadow-2xl border border-white/10"
            >
              {adModal.status === 'ready' && (
                <button 
                  onClick={() => setAdModal({isOpen: false, status: 'processing'})} 
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
                >
                  <X size={18} />
                </button>
              )}
              
              <h3 className="text-xl lg:text-2xl font-black text-white mb-2 text-center mt-2">
                {adModal.status === 'processing' ? 'در حال آماده‌سازی فایل شما...' : 'دانلود با موفقیت آغاز شد!'}
              </h3>
              <p className="text-sm text-gray-400 mb-6 text-center leading-relaxed">
                {adModal.status === 'processing' 
                  ? `لطفاً ${countdown} ثانیه شکیبا باشید. این کار به رایگان ماندن ابزار ما کمک می‌کند.` 
                  : 'از اینکه مبدل ما را برای کارهای خود انتخاب کردید سپاسگزاریم.'}
              </p>

              {/* Adivery Placeholder / Ad Space */}
              <motion.div 
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-full bg-[#050505] border border-cyan-500/30 rounded-2xl flex flex-col items-center justify-center p-4 mb-8 relative group overflow-hidden min-h-[250px] shadow-[0_0_30px_rgba(6,182,212,0.1)]"
              >
                 <span className="text-[10px] text-gray-500 absolute top-2 right-3 font-mono">ADVERTISEMENT (ADIVERY)</span>
                 {/* 
                    This is where the actual Adivery Ad tag will go.
                    Example for user: <div id="adivery-space-id"></div> 
                 */}
                 <div className="flex flex-col items-center text-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-3">
                      <Zap className="text-cyan-400" size={32} />
                    </div>
                    <span className="text-sm font-bold text-gray-300">جایگاه تبلیغات ادیوری (۳۰۰×۲۵۰)</span>
                    <span className="text-xs text-gray-500 mt-1">پس از افزودن اسکریپت ادیوری در این قسمت به نمایش در می‌آید</span>
                 </div>
              </motion.div>

              {adModal.status === 'processing' ? (
                <div className="flex items-center gap-3 text-cyan-400 font-bold">
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  شروع دانلود در {countdown} ثانیه...
                </div>
              ) : (
                <button 
                  onClick={() => setAdModal({isOpen: false, status: 'processing'})} 
                  className="glass-button-primary w-full py-3 text-lg"
                >
                  بستن پنجره
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEO Content Appended Below Workspace */}
      <div className="mt-8 z-10 relative">
        <div className="bg-black/40 border-t border-white/5 py-12">
          {sourceParam && targetParam ? (
              <SeoSpecific source={sourceParam} target={targetParam} />
          ) : (
              <SeoGeneral />
          )}
        </div>

        <div className="bg-[#020202] border-t border-white/5 pt-12 pb-20">
          <div className="max-w-6xl mx-auto w-full px-4">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-6 pr-4 border-r-4 border-cyan-500 bg-gradient-to-l from-cyan-500/10 to-transparent py-2">سایر ابزارهای پرکاربرد</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 <ConversionCard src="HEIC" tgt="JPG" />
                 <ConversionCard src="WEBP" tgt="PNG" />
                 <ConversionCard src="JPG" tgt="PNG" />
                 <ConversionCard src="PNG" tgt="JPG" />
                 <ConversionCard src="JPG" tgt="WEBP" />
                 <ConversionCard src="SVG" tgt="PNG" />
              </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Micro Component for Sliders
function FilterSlider({ label, val, onChange, min, max }: { label: string, val: number, onChange: (v: number) => void, min: number, max: number }) {
  return (
    <div className="group">
      <div className="flex justify-between text-[10px] lg:text-xs font-semibold text-gray-400 mb-1 lg:mb-2 group-hover:text-cyan-300 transition-colors">
        <span>{label}</span>
        <span className="text-gray-500 bg-white/5 px-1.5 py-0.5 rounded-sm">{val}</span>
      </div>
      <input 
        type="range" 
        className="w-full h-1 lg:h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300"
        min={min} max={max} value={val} 
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// Card for SEO Links (Now uses real React Router Links)
function ConversionCard({src, tgt}: {src: string, tgt:string}) {
  return (
    <Link 
      to={`/convert/${src.toLowerCase()}-to-${tgt.toLowerCase()}`}
      className="glass-panel hover:bg-white/5 p-4 md:p-6 rounded-2xl cursor-pointer transition-all hover:scale-105 border border-white/5 hover:border-cyan-500/50 flex flex-col group block"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="bg-black/50 text-gray-300 py-1 px-3 rounded-lg font-mono text-sm">{src}</span>
        <span className="text-white/20">➔</span>
        <span className="bg-cyan-500/20 text-cyan-300 py-1 px-3 rounded-lg font-mono text-sm font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">{tgt}</span>
      </div>
      <h3 className="text-white font-bold mb-2 group-hover:text-cyan-300 transition-colors text-right">تبدیل آنلاین {src} به {tgt}</h3>
      <p className="text-xs text-gray-500 flex-1 leading-relaxed text-right">
        بهترین ابزار برای تبدیل سریع و بدون افت کیفیت فرمت {src} به {tgt} کاملاً رایگان.
      </p>
    </Link>
  );
}
