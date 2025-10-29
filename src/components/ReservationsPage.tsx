// src/components/ReservationsPage.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Calendar,
  Clock,
  LayoutGrid,
  Plus,
} from "lucide-react";

interface Experience {
  id: string;
  artisanId?: string;      // قد تأتي هكذا في الواجهة
  artisanUid?: string;     // أو هكذا من Firestore
  artisanName: string;
  category: string;
  title: string;
  maxPersons: string;
  allowedGender: string;
  city: string;
  description: string;
  pricePerPerson: string;
  durationHours: string;
}

type ReservationStatus = "pending" | "confirmed" | "cancelled";

interface Booking {
  id: string;
  experienceId: string;
  experienceTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  artisanId: string;
  date: string;
  time: string;
  numberOfPeople: number;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}

interface ReservationsPageProps {
  userType: "user" | "artisan";
  userId: string;
  experiences: Experience[];
  bookings: Booking[];
  onNavigate?: (page: string) => void;
  onAddExperience?: () => void;
  onUpdateBookingStatus?: (
    bookingId: string,
    newStatus: ReservationStatus
  ) => void;
  language?: "ar" | "en";
  t?: any;
}

const statusMap: Record<
  ReservationStatus,
  { label: string; labelEn: string; color: string }
> = {
  pending: {
    label: "مُعلّقة",
    labelEn: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  confirmed: {
    label: "مؤكدة",
    labelEn: "Confirmed",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  cancelled: {
    label: "مُلغاة",
    labelEn: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
  },
};

type ViewType = "products" | "past" | "active";

export function ReservationsPage({
  userType,
  userId,
  experiences,
  bookings,
  onNavigate,
  onAddExperience,
  onUpdateBookingStatus,
  language = "ar",
  t,
}: ReservationsPageProps) {
  const [activeView, setActiveView] = useState<ViewType>("products");
  const isRTL = language === "ar";

  // تتبّع مفيد (مؤقت)
  console.log(
    "[ReservationsPage] userId=",
    userId,
    "experiences=",
    experiences.map((e) => ({
      id: e.id,
      owner: e.artisanId ?? e.artisanUid ?? "",
    }))
  );

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    onUpdateBookingStatus?.(id, newStatus);
  };

  // حجوزات المستخدم أو حجوزات الحرفي
  const userBookings =
    userType === "user"
      ? bookings.filter((b) => b.userId === userId)
      : bookings.filter((b) => b.artisanId === userId);

  // تجارب الحرفي (مقارنة مرنة بين artisanId/Uid و userId)
  const artisanExperiences = experiences.filter((e) => {
    const owner = String(e.artisanId ?? e.artisanUid ?? "");
    return owner === String(userId);
  });

  // فلترة الحجوزات حسب التبويب
  const getFilteredReservations = () => {
    if (activeView === "past") {
      return userBookings.filter((res) => res.status === "cancelled");
    }
    if (activeView === "active") {
      return userBookings.filter(
        (res) => res.status === "pending" || res.status === "confirmed"
      );
    }
    return [];
  };

  // ===== واجهة المستخدم =====
  if (userType === "user") {
    return (
      <div
        className="w-full min-h-[calc(100vh-5rem)] py-16"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="container mx-auto max-w-[1440px] px-8">
          <div className="mb-12">
            <h1 className="text-4xl mb-3 text-[#15442f]">
              {t?.myReservations || "حجوزاتي"}
            </h1>
            <p className="text-muted-foreground">
              {t?.manageAllReservations || "إدارة جميع حجوزاتك في مكان واحد"}
            </p>
          </div>

          {userBookings.length > 0 ? (
            <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t?.eventName || "اسم الفعالية"}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t?.personsCount || "عدد الأشخاص"}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t?.dateTime || "التاريخ والوقت"}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t?.total || "المجموع"}
                    </TableHead>
                    <TableHead className={isRTL ? "text-right" : "text-left"}>
                      {t?.status || "الحالة"}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>{reservation.experienceTitle}</TableCell>
                      <TableCell>{reservation.numberOfPeople}</TableCell>
                      <TableCell>
                        {reservation.date} - {reservation.time}
                      </TableCell>
                      <TableCell>
                        {reservation.totalPrice} {t?.sar || "ريال"}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusMap[reservation.status].color}>
                          {isRTL
                            ? statusMap[reservation.status].label
                            : statusMap[reservation.status].labelEn}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border p-20 text-center">
              <div className="max-w-md mx-auto">
                <div className="h-20 w-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                  <Calendar className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-2xl mb-4 text-[#15442f]">
                  {t?.noReservations || "لا توجد حجوزات بعد"}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {t?.noReservationsDesc ||
                    "استكشف الفعاليات المتاحة وابدأ رحلتك مع الحِرف"}
                </p>
                <Button
                  onClick={() => onNavigate?.("events")}
                  className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
                >
                  {t?.goToEvents || "اذهب لصفحة الفعاليات – احجز الآن"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===== واجهة الحرفي =====
  return (
    <div
      className="w-full min-h-[calc(100vh-5rem)] py-16"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="container mx-auto max-w-[1440px] px-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-3 text-[#15442f]">
              {t?.manageReservations || "إدارة الحجوزات"}
            </h1>
            <p className="text-muted-foreground">
              {t?.manageExperiences || "إدارة تجاربك وحجوزات عملائك"}
            </p>
          </div>
          <Button
            onClick={onAddExperience}
            className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
          >
            <Plus className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
            {t?.addExperience || "إضافة تجربة"}
          </Button>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-12 gap-8 mb-12">
          <div className="col-span-4">
            <button
              onClick={() => setActiveView("products")}
              className={`bg-white rounded-xl border p-8 hover:shadow-lg transition-all text-${
                isRTL ? "right" : "left"
              } group w-full h-full ${
                activeView === "products" ? "ring-2 ring-[#15442f] shadow-lg" : ""
              }`}
            >
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  activeView === "products"
                    ? "bg-[#15442f] text-white"
                    : "bg-[#15442f]/10 text-[#15442f] group-hover:bg-[#15442f]/20"
                }`}
              >
                <LayoutGrid className="h-7 w-7" />
              </div>
              <h3 className="text-xl mb-2 text-[#15442f]">
                {t?.myProducts || "قائمة المنتجات"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t?.myProductsDesc || "إدارة جميع تجاربك"}
              </p>
            </button>
          </div>

          <div className="col-span-4">
            <button
              onClick={() => setActiveView("past")}
              className={`bg-white rounded-xl border p-8 hover:shadow-lg transition-all text-${
                isRTL ? "right" : "left"
              } group w-full h-full ${
                activeView === "past" ? "ring-2 ring-[#15442f] shadow-lg" : ""
              }`}
            >
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  activeView === "past"
                    ? "bg-[#15442f] text-white"
                    : "bg-[#15442f]/10 text-[#15442f] group-hover:bg-[#15442f]/20"
                }`}
              >
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="text-xl mb-2 text-[#15442f]">
                {t?.pastReservations || "الحجوزات السابقة"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t?.pastReservationsDesc || "عرض السجل الكامل"}
              </p>
            </button>
          </div>

          <div className="col-span-4">
            <button
              onClick={() => setActiveView("active")}
              className={`bg-white rounded-xl border p-8 hover:shadow-lg transition-all text-${
                isRTL ? "right" : "left"
              } group w-full h-full ${
                activeView === "active" ? "ring-2 ring-[#15442f] shadow-lg" : ""
              }`}
            >
              <div
                className={`h-14 w-14 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  activeView === "active"
                    ? "bg-[#15442f] text-white"
                    : "bg-[#15442f]/10 text-[#15442f] group-hover:bg-[#15442f]/20"
                }`}
              >
                <Calendar className="h-7 w-7" />
              </div>
              <h3 className="text-xl mb-2 text-[#15442f]">
                {t?.activeReservations || "الحجوزات القائمة"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t?.activeReservationsDesc || "الحجوزات النشطة"}
              </p>
            </button>
          </div>
        </div>

        {/* Content by view */}
        {activeView === "products" && (
          <>
            {artisanExperiences.length > 0 ? (
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl text-[#15442f]">
                    {t?.myProducts || "قائمة المنتجات"}
                  </h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.eventName || "اسم التجربة"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.category || "الفئة"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.city || "المدينة"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.pricePerPerson || "السعر للشخص"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.maxPersons || "العدد الأقصى"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artisanExperiences.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-accent text-accent">
                            {e.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{e.city}</TableCell>
                        <TableCell>
                          {e.pricePerPerson} {t?.sar || "ريال"}
                        </TableCell>
                        <TableCell>{e.maxPersons}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl mb-4 text-[#15442f]">
                    {t?.noExperiences || "لا توجد تجارب/منتجات"}
                  </h3>
                  <p className="text-muted-foreground mb-8">
                    {t?.noExperiencesDesc ||
                      "ابدأ بإضافة تجربتك الأولى ليراها المستخدمون"}
                  </p>
                  <Button
                    onClick={onAddExperience}
                    className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
                  >
                    {t?.addNow || "أضف الآن"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}

        {(activeView === "past" || activeView === "active") && (
          <>
            {getFilteredReservations().length > 0 ? (
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl text-[#15442f]">
                    {activeView === "past"
                      ? t?.pastReservations || "الحجوزات السابقة"
                      : t?.activeReservations || "الحجوزات القائمة"}
                  </h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.eventName || "اسم الفعالية"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.customerName || "اسم العميل"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.customerPhone || "رقم العميل"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.personsCount || "عدد الأشخاص"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.dateTime || "التاريخ والوقت"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.total || "المجموع"}
                      </TableHead>
                      <TableHead className={isRTL ? "text-right" : "text-left"}>
                        {t?.status || "الحالة"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReservations().map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.experienceTitle}</TableCell>
                        <TableCell>{reservation.userName}</TableCell>
                        <TableCell>{reservation.userPhone}</TableCell>
                        <TableCell>{reservation.numberOfPeople}</TableCell>
                        <TableCell>
                          {reservation.date} - {reservation.time}
                        </TableCell>
                        <TableCell>
                          {reservation.totalPrice} {t?.sar || "ريال"}
                        </TableCell>
                        <TableCell>
                          {activeView === "past" ? (
                            <Badge className={statusMap[reservation.status].color}>
                              {isRTL
                                ? statusMap[reservation.status].label
                                : statusMap[reservation.status].labelEn}
                            </Badge>
                          ) : (
                            <Select
                              value={reservation.status}
                              onValueChange={(value: ReservationStatus) =>
                                handleStatusChange(reservation.id, value)
                              }
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">
                                  {t?.pending || "مُعلّقة"}
                                </SelectItem>
                                <SelectItem value="confirmed">
                                  {t?.confirmed || "مؤكدة"}
                                </SelectItem>
                                <SelectItem value="cancelled">
                                  {t?.cancelled || "مُلغاة"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl mb-2 text-[#15442f]">
                    {activeView === "past"
                      ? isRTL
                        ? "لا توجد حجوزات سابقة"
                        : "No past reservations"
                      : isRTL
                      ? "لا توجد حجوزات قائمة"
                      : "No active reservations"}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeView === "past"
                      ? isRTL
                        ? "ستظهر الحجوزات السابقة هنا"
                        : "Past bookings will appear here"
                      : isRTL
                      ? "ستظهر الحجوزات النشطة هنا"
                      : "Active bookings will appear here"}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ReservationsPage;
