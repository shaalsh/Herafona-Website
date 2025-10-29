// src/components/BookingPage.tsx
import { useState } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { ArrowRight, Calendar, MapPin, User, Mail, Users, CheckCircle2 } from 'lucide-react';

interface Experience {
  id: string;
  artisanId: string;          
  artisanName: string;
  category: string;
  title: string;
  maxPersons: string;
  allowedGender: string;
  city: string;
  description: string;
  pricePerPerson: string;        
  durationHours: string;
  image?: string;
}

interface BookingPageProps {
  experience: Experience;
  onNavigate?: (page: string) => void;
  onBook?: (bookingData: any) => void;
  language?: 'ar' | 'en';
  t?: any;
}

export function BookingPage({
  experience,
  onNavigate,
  onBook,
  language = 'ar',
  t,
}: BookingPageProps) {
  const isRTL = language === 'ar';
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    personsCount: '1',
    date: '',
    time: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const pricePerPersonNum = Number(experience.pricePerPerson) || 0;
  const persons = parseInt(formData.personsCount || '1', 10) || 1;
  const totalPrice = pricePerPersonNum * persons;

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.fullName) newErrors.fullName = 'الاسم الكامل مطلوب';
    if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!validateEmail(formData.email)) newErrors.email = 'رجاءً أدخل بريدًا إلكترونيًّا بصيغة صحيحة';
    if (!formData.personsCount || persons < 1) newErrors.personsCount = 'عدد الأشخاص مطلوب';
    if (!formData.date) newErrors.date = 'التاريخ مطلوب';
    if (!formData.time) newErrors.time = 'الوقت مطلوب';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onBook?.({
      ...formData,
      numberOfPeople: persons,
      totalPrice,
    });
    setShowSuccessModal(true);
  };

  return (
    <>
      <div className="w-full min-h-[calc(100vh-5rem)] py-16" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto max-w-[1200px] px-8">
          {/* Back Link */}
          <button
            onClick={() => onNavigate?.('events')}
            className="flex items-center gap-2 text-[#3F2A22] hover:underline mb-8"
          >
            <ArrowRight className="h-4 w-4" />
            {isRTL ? 'العودة لصفحة الفعاليات' : 'Back to Events'}
          </button>

          <div className="grid grid-cols-12 gap-10">
            {/* Event Summary */}
            <div className="col-span-5">
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden sticky top-24">
                <div className="relative h-64">
                  <ImageWithFallback
                    src={experience.image || 'https://images.unsplash.com/photo-1593671186131-d58817e7dee0?w=800'}
                    alt={experience.title}
                    className="h-full w-full object-cover"
                  />
                  <Badge className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} bg-accent hover:bg-accent text-white`}>
                    {experience.category}
                  </Badge>
                </div>

                <div className="p-8">
                  <h2 className="text-2xl mb-6 text-[#15442f]">{experience.title}</h2>

                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>{experience.artisanName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{experience.city}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl text-[#15442f]">{pricePerPersonNum}</span>
                      <span className="text-muted-foreground">{isRTL ? 'ريال للشخص' : 'SAR per person'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="col-span-7">
              <div className="bg-white rounded-xl border shadow-lg p-10">
                <h1 className="text-3xl mb-3 text-[#15442f]">
                  {t?.completeBooking || 'إتمام الحجز'}
                </h1>
                <p className="text-muted-foreground mb-10">
                  {t?.fillBookingData || 'املأ البيانات التالية لتأكيد حجزك'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="mb-3 block">
                      الاسم الكامل
                    </Label>
                    <div className="relative">
                      <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="أدخل اسمك الكامل"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className={`pr-10 ${errors.fullName ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive mt-2">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="mb-3 block">
                      البريد الإلكتروني
                    </Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`pr-10 ${errors.email ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-2">{errors.email}</p>
                    )}
                  </div>

                  {/* Persons Count */}
                  <div>
                    <Label htmlFor="personsCount" className="mb-3 block">
                      عدد الأشخاص
                    </Label>
                    <div className="relative">
                      <Users className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="personsCount"
                        type="number"
                        min="1"
                        placeholder="1"
                        value={formData.personsCount}
                        onChange={(e) =>
                          setFormData({ ...formData, personsCount: e.target.value })
                        }
                        className={`pr-10 ${errors.personsCount ? 'border-destructive' : ''}`}
                      />
                    </div>
                    {errors.personsCount && (
                      <p className="text-sm text-destructive mt-2">{errors.personsCount}</p>
                    )}
                  </div>

                  {/* Date and Time */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="date" className="mb-3 block">
                        التاريخ
                      </Label>
                      <div className="relative">
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="date"
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className={`pr-10 ${errors.date ? 'border-destructive' : ''}`}
                        />
                      </div>
                      {errors.date && (
                        <p className="text-sm text-destructive mt-2">{errors.date}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="time" className="mb-3 block">
                        الوقت
                      </Label>
                      <Input
                        id="time"
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className={errors.time ? 'border-destructive' : ''}
                      />
                      {errors.time && (
                        <p className="text-sm text-destructive mt-2">{errors.time}</p>
                      )}
                    </div>
                  </div>

                  {/* Price Summary */}
                  <div className="bg-[#FCFBF5] rounded-lg p-8 space-y-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>السعر للشخص × {persons}</span>
                      <span>
                        {pricePerPersonNum} × {persons}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-lg">السعر الإجمالي</span>
                      <span className="text-2xl text-[#15442f]">{totalPrice} ريال</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-[#860A33] hover:bg-[#860A33]/90 text-white"
                    size="lg"
                  >
                    احجز الآن
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-2xl text-[#15442f]">
              تم الحجز بنجاح
            </DialogTitle>
            <DialogDescription className="text-center">
              تم إرسال تفاصيل الحجز إلى بريدك الإلكتروني
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                onNavigate?.('home');
              }}
              className="flex-1 bg-[#860A33] hover:bg-[#860A33]/90 text-white"
            >
              الصفحة الرئيسية
            </Button>
            <Button
              onClick={() => setShowSuccessModal(false)}
              variant="outline"
              className="flex-1"
            >
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
