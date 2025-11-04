import { Button } from './ui/button';
import heroHeader from '../assets/new-header.png';
import type { PageString } from "../App";

interface HomePageProps {
onNavigate?: (page: PageString) => void
  language?: 'ar' | 'en';
  t?: any;
}

export function HomePage({ onNavigate, language = 'ar', t }: HomePageProps) {
  const isRTL = language === 'ar';

  return (
    <div className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* ================= Hero ================= */}
      <section className="relative h-[600px] overflow-hidden">
  {/* الصورة */}
  <img
    src={heroHeader}
    alt=""
    aria-hidden="true"
    className="absolute inset-0 z-0 h-full w-full object-cover"
    loading="eager"
    decoding="async"
  />

  {/* طبقة بُنّية خفيفة ترفع التباين */}
  <div className="absolute inset-0 z-10 pointer-events-none bg-[#3F2A22]/40 mix-blend-multiply" />

  {/* التدرّج الداكن من جهة النص */}
 <div
  className="absolute inset-0 z-20 pointer-events-none"
  style={{
    backgroundImage: isRTL
      ? 'linear-gradient(to left, rgba(0,0,0,.6), rgba(0,0,0,.3), rgba(0,0,0,0))'
      : 'linear-gradient(to right, rgba(0,0,0,.6), rgba(0,0,0,.3), rgba(0,0,0,0))',
  }}
/>


  {/* المحتوى فوق الكل */}
  <div className="relative z-30 container mx-auto max-w-[1440px] px-8 h-full flex items-center">
    <div className="max-w-2xl text-white">
      <h1 className="text-5xl mb-6 leading-snug">
        {t?.heroTitle ?? 'من يد الحرفة، إلى قلب التجربة'}
      </h1>
      <p className="text-xl mb-10 opacity-90">
        {t?.heroSubtitle ?? 'اكتشف الحِرف السعودية الأصيلة بتجارب عملية مميزة'}
      </p>
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => onNavigate?.('events')}
          className="bg-[#860A33] hover:bg-[#860A33]/90 text-white px-8"
        >
          {t?.exploreNow ?? 'استكشف التجارب'}
        </Button>
        <Button
          size="lg"
          variant="outline"
          onClick={() => onNavigate?.('login')}
          className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm px-8"
        >
          {isRTL ? 'انضم كحرفي' : 'Join as Artisan'}
        </Button>
      </div>
    </div>
  </div>
</section>


      {/* ================= Features ================= */}
      <section className="py-24 bg-[#FCFBF5]">
        <div className="container mx-auto max-w-[1440px] px-8">
          <h2 className="text-3xl font-semibold text-[#3F2A22] text-center mb-12">
            {t?.featuresTitle ?? (isRTL ? 'لماذا حِرفُنا؟' : 'Why Herafona?')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-white border-2 border-[#3F2A22] mx-auto mb-6" />
              <h3 className="text-2xl mb-3 text-[#3F2A22]">
                {t?.featureQuality ?? (isRTL ? 'طبيعة أصيلة' : 'Guaranteed Quality')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t?.featureQualityDesc ??
                  (isRTL
                    ? 'استمتع بجمال الطبيعة السعودية التي تلهم الحِرف وتغذي روح الإبداع'
                    : 'We ensure an exceptional experience with certified artisans')}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-white border-2 border-[#3F2A22] mx-auto mb-6" />
              <h3 className="text-2xl mb-3 text-[#3F2A22]">
                {t?.featureEasy ?? (isRTL ? 'حجز سهل وسريع' : 'Easy Booking')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t?.featureEasyDesc ??
                  (isRTL
                    ? 'احجز تجربتك بسهولة، واختر الوقت المناسب، وادفع بأمان'
                    : 'Book in simple, quick steps')}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center">
              <div className="h-24 w-24 rounded-full bg-white border-2 border-[#3F2A22] mx-auto mb-6" />
              <h3 className="text-2xl mb-3 text-[#3F2A22]">
                {t?.featureSafe ?? (isRTL ? 'هويّة ثقافية' : 'Secure Payment')}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {t?.featureSafeDesc ??
                  (isRTL
                    ? 'اكتشف نقوشًا وزخارف تنبض بعبق التاريخ وأصالة التراث'
                    : 'Trusted, protected payments for peace of mind')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-24">
        <div className="container mx-auto max-w-[1440px] px-8">
          <div className="bg-[#15442f] rounded-2xl p-16 text-white text-center">
            <h2 className="text-4xl mb-4">
              {isRTL ? 'ابدأ رحلتك مع الحِرف اليوم' : 'Start Your Craft Journey Today'}
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              {isRTL
                ? 'انضم إلى مئات المستفيدين واكتشف عالم الحِرف السعودية الأصيلة'
                : 'Join hundreds of participants and discover the world of authentic Saudi crafts'}
            </p>
            <Button
              size="lg"
              onClick={() => onNavigate?.('events')}
              className="bg-white text-[#15442f] hover:bg-white/90 px-10"
            >
              {isRTL ? 'تصفح الفعاليات' : 'Browse Events'}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
