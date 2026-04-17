import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeftRight } from 'lucide-react';

export function BeforeAfterSlider({ originalSrc, modifiedSrc }: { originalSrc: string, modifiedSrc: string }) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center select-none" 
      dir="ltr"
    >
       {/* Background Image (Modified / After) */}
       <img 
         src={modifiedSrc} 
         className="absolute w-full h-full object-contain max-w-full max-h-full pointer-events-none drop-shadow-2xl" 
         alt="پس از ویرایش" 
       />
       
       {/* Foreground Image (Original / Before - Clipped) */}
       <div 
         className="absolute w-full h-full flex items-center justify-center pointer-events-none"
         style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
       >
         <img 
           src={originalSrc} 
           className="absolute w-full h-full object-contain max-w-full max-h-full" 
           alt="قبل از ویرایش" 
         />
       </div>
       
       {/* Range Slider for Interaction */}
       <input 
         type="range" min="0" max="100" value={sliderPos}
         onChange={e => setSliderPos(Number(e.target.value))}
         className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0"
       />

       {/* Visible Line & Handle Indicator */}
       <div 
         className="absolute top-0 bottom-0 w-1 bg-white/80 pointer-events-none z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center"
         style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
       >
          <div className="w-8 h-8 rounded-full bg-cyan-500 border border-white/50 backdrop-blur-md shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110">
             <ArrowLeftRight size={14} className="text-white" />
          </div>
          
          {/* Labels for Before / After */}
          <div className="absolute top-4 left-4 bg-black/60 text-white/90 text-xs px-2 py-1 rounded-md backdrop-blur whitespace-nowrap">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-black/60 text-cyan-300 text-xs px-2 py-1 rounded-md backdrop-blur whitespace-nowrap transform translate-x-full">
            After
          </div>
       </div>

       {/* Instruction Overlay (Fades out when user clicks/moves) */}
       {sliderPos === 50 && (
         <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="absolute bottom-6 bg-black/60 backdrop-blur-md text-white/80 px-4 py-1.5 rounded-full font-bold shadow-xl border border-white/10 text-xs pointer-events-none hidden md:block"
         >
           برای مقایسه لغزنده را جابه‌جا کنید
         </motion.div>
       )}
    </div>
  );
}
