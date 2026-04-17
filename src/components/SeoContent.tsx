import React from 'react';
import { Zap, ShieldCheck, FileImage, Settings2, ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';

export const SeoGeneral = () => (
  <article className="max-w-5xl mx-auto mt-20 mb-32 px-4 rtl text-gray-300">
    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
        <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3">
            <Sparkles className="text-cyan-400" size={32} />
            تبدیل فرمت عکس آنلاین و قدرتمند
        </h2>
        
        <div className="grid md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <p className="leading-loose text-lg">
                    در دنیای دیجیتال امروز، <strong>تبدیل فرمت عکس</strong> و <strong>کاهش حجم تصویر</strong> از اهمیت بالایی برخوردار است. 
                    سامانه پیشرفته ما به شما این امکان را می‌دهد تا به سادگی و کاملاً رایگان، تصاویر خود را لا به هم تبدیل کنید. 
                    چه بخواهید تبدیل png به jpg انجام دهید، چه فرمت سیستم‌عامل اپل را باز کنید، این ابزار بهترین انتخاب شماست.
                </p>
                <div className="bg-black/40 rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Settings2 className="text-purple-400" /> ویرایشگر داخلی</h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                      تنها با کشیدن و رها کردن فایل‌ها (Drag & Drop)، نه‌تنها به مبدل دسترسی دارید، بلکه می‌توانید از ابزارهای 
                      تغییر سایز حرفه‌ای، برش (Crop) و فیلترهای رنگی نیز استفاده نمایید. پردازشگر بومی توانایی اجرای الگوریتم‌های 
                      پیچیده بینایی ماشین را برای تشخیص لبه‌ها و برجسته‌سازی داراست.
                    </p>
                </div>
            </div>
            
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">ویژگی‌های برجسته</h3>
                <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-gray-200 block mb-1">امنیت ۱۰۰٪ و حفظ حریم خصوصی</strong>
                            <span className="text-sm text-gray-400 leading-relaxed">تمامی پردازش‌ها مستقیماً درون مرورگر شما انجام می‌شود. هیچ فایلی به سرورهای ما ارسال نمی‌گردد.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-gray-200 block mb-1">پردازش دسته‌ای (Batch Processing)</strong>
                            <span className="text-sm text-gray-400 leading-relaxed">صدها عکس را به صورت همزمان وارد کنید، تغییرات لازم را اعمال کرده و همه را در یک فایل ZIP دانلود کنید.</span>
                        </div>
                    </li>
                    <li className="flex items-start gap-3">
                        <CheckCircle2 className="text-green-400 mt-1 flex-shrink-0" />
                        <div>
                            <strong className="text-gray-200 block mb-1">پشتیبانی از فرمت‌های مدرن</strong>
                            <span className="text-sm text-gray-400 leading-relaxed">پشتیبانی کامل از فرمت‌های نسل جدید نظیر پردازش بومی HEIC، تبدیل WebP و خروجی فوق سبک AVIF.</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  </article>
);

export const SeoSpecific = ({ source, target }: { source: string, target: string }) => (
  <article className="max-w-5xl mx-auto mt-20 mb-32 px-4 rtl text-gray-300">
    <div className="bg-gradient-to-br from-cyan-950/40 to-purple-950/40 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-sm">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-8 flex items-center gap-3">
            <ImageIcon className="text-cyan-400" size={36} />
            تبدیل {source} به {target} بدون افت کیفیت
        </h2>
        
        <div className="prose prose-invert prose-cyan max-w-none">
            <p className="text-lg leading-loose mb-8">
                اگر به دنبال بهترین و سریع‌ترین روش برای <strong>تبدیل فایل {source} به {target}</strong> هستید، درست آمده‌اید. 
                ابزار حرفه‌ای ما به گونه‌ای طراحی شده که می‌توانید فرمت عکس‌های خود را با حفظ بالاترین استانداردهای کیفی تغییر دهید. 
                این مبدل آنلاین کاملاً رایگان بوده و نیاز به نصب هیچ‌گونه نرم‌افزار اضافی روی کامپیوتر یا موبایل شما ندارد.
            </p>

            <div className="grid md:grid-cols-2 gap-8 my-10">
                <div className="bg-black/30 p-6 rounded-2xl border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4">چرا فایل‌های {source} را تبدیل کنیم؟</h3>
                    <p className="text-sm leading-loose text-gray-400">
                        فرمت {source} ویژگی‌های خاص خود را دارد، اما ممکن است در تمامی دستگاه‌ها، مرورگرها 
                        یا شبکه‌های اجتماعی پشتیبانی نشود. گاهی اوقات برای آپلود یک تصویر در سامانه‌های اداری 
                        و یا استفاده در طراحی سایت، نیاز به فرمت استانداردتری مانند {target} دارید. 
                        همچنین این تبدیل می‌تواند به <strong>کاهش حجم عکس</strong> و بهینه‌سازی (SEO) سایت شما نیز کمک شایانی کند.
                    </p>
                </div>
                
                <div className="bg-black/30 p-6 rounded-2xl border border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-4">چگونه {source} را به {target} تبدیل کنیم؟</h3>
                    <ol className="text-sm leading-loose text-gray-400 ml-4 list-decimal marker:text-cyan-400 space-y-2">
                        <li>فایل یا فایلهای {source} خود را در کادر بالا رها کنید (کادر نقطه‌چین).</li>
                        <li>در منوی تنظیمات، در بخش تخصصی "فرمت نهایی"، گزینه <strong>{target}</strong> را انتخاب کنید.</li>
                        <li>(اختیاری) می‌توانید از ابزارهای برش، تغییر سایز و یا فیلترهای نوری استفاده نمایید.</li>
                        <li>در نهایت دکمه <strong>دانلود همه</strong> را بزنید تا فایل(های) پردازش شده دریافت گردد.</li>
                    </ol>
                </div>
            </div>

            <p className="text-center font-bold text-cyan-200 mt-8 py-4 bg-cyan-950/30 rounded-xl border border-cyan-500/20">
                امنیت تضمینی: تمامی پردازش‌های تبدیل {source} به {target} به صورت Offline-in-Browser انجام می‌گیرد.
            </p>
        </div>
    </div>
  </article>
);
