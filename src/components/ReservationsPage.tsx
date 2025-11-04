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
import { Calendar, Clock, LayoutGrid, Plus } from "lucide-react";

import type { Experience, Booking } from "../App";

type ReservationStatus = "pending" | "confirmed" | "cancelled";

interface ReservationsPageProps {
  userType: "user" | "artisan" | "tourist";
  userId: string;
  experiences: Experience[];
  bookings: Booking[];
  onNavigate?: (page: "events" | "reservations" | "home" | "profile") => void;
  onAddExperience?: () => void;
  onUpdateBookingStatus?: (bookingId: string, newStatus: ReservationStatus) => void;
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
    color: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  },
  confirmed: {
    label: "مؤكدة",
    labelEn: "Confirmed",
    color: "bg-green-100 text-green-800 border border-green-200",
  },
  cancelled: {
    label: "مُلغاة",
    labelEn: "Cancelled",
    color: "bg-red-100 text-red-800 border border-red-200",
  },
};

type ViewType = "products" | "past" | "active";

function toDateSafe(d: any): Date | null {
  if (!d) return null;
  if (typeof d?.toDate === "function") return d.toDate();
  if (typeof d === "string" || typeof d === "number") return new Date(d);
  if (d?.seconds) return new Date(d.seconds * 1000);
  return null;
}

export default function ReservationsPage({
  userType,
  userId,
  experiences,
  bookings,
  onNavigate,
  onAddExperience,
  onUpdateBookingStatus,
  language = "ar",
  t = {},
}: ReservationsPageProps) {
  const [activeView, setActiveView] = useState<ViewType>("products");
  const isRTL = language === "ar";

  const artisanExperiences = (experiences ?? []).filter(
    (e) => String(e.artisanUid ?? "") === String(userId ?? "")
  );

  const userBookings: Booking[] =
    userType === "user"
      ? (bookings ?? []).filter((b) => String(b.userID) === String(userId))
      : (bookings ?? []).filter((b) => String(b.artisanID) === String(userId));

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

  const handleStatusChange = (id: string, newStatus: ReservationStatus) => {
    onUpdateBookingStatus?.(id, newStatus);
  };

  if (userType === "user") {
    return (
      <div className="w-full min-h-[calc(100vh-5rem)] py-16" dir={isRTL ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-[1440px] px-8">
          <div className="mb-12">
            <h1 className="text-4xl mb-3 text-[#15442f]">
              {t.myReservations || "حجوزاتي"}
            </h1>
            <p className="text-muted-foreground">
              {t.manageAllReservations || "إدارة جميع حجوزاتك في مكان واحد"}
            </p>
          </div>

          {userBookings.length > 0 ? (
            <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.eventName || "اسم الفعالية"}</TableHead>
                    <TableHead>{t.personsCount || "عدد الأشخاص"}</TableHead>
                    <TableHead>{t.dateTime || "التاريخ والوقت"}</TableHead>
                    <TableHead>{t.total || "المجموع"}</TableHead>
                    <TableHead>{t.status || "الحالة"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userBookings.map((reservation) => {
                    const dt = toDateSafe(reservation.bookingDate);
                    return (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.experienceTitle}</TableCell>
                        <TableCell>{reservation.numberOfPeople}</TableCell>
                        <TableCell>{dt ? dt.toLocaleString() : "-"}</TableCell>
                        <TableCell>
                          {reservation.totalPrice} {t.sar || "ريال"}
                        </TableCell>
                        <TableCell>
                          <Badge className={statusMap[reservation.status].color}>
                            {isRTL
                              ? statusMap[reservation.status].label
                              : statusMap[reservation.status].labelEn}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                  {t.noReservations || "لا توجد حجوزات بعد"}
                </h3>
                <p className="text-muted-foreground mb-8">
                  {t.noReservationsDesc ||
                    "استكشف الفعاليات المتاحة وابدأ رحلتك مع الحِرف"}
                </p>
                <Button
                  onClick={() => onNavigate?.("events")}
                  className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
                >
                  {t.goToEvents || "اذهب لصفحة الفعاليات – احجز الآن"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] py-16" dir={isRTL ? "rtl" : "ltr"}>
      <div className="container mx-auto max-w-[1440px] px-8">
        {/* Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl mb-3 text-[#15442f]">
              {t.manageReservations || "إدارة الحجوزات"}
            </h1>
            <p className="text-muted-foreground">
              {t.manageExperiences || "إدارة تجاربك وحجوزات عملائك"}
            </p>
          </div>
          <Button
            onClick={onAddExperience}
            className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
          >
            <Plus className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4`} />
            {t.addExperience || "إضافة تجربة"}
          </Button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
          {[
            { key: "active", title: "الحجوزات القائمة", icon: <Calendar />, desc: "الحجوزات النشطة" },
            { key: "past", title: "الحجوزات السابقة", icon: <Clock />, desc: "عرض السجل الكامل" },
            { key: "products", title: "قائمة المنتجات", icon: <LayoutGrid />, desc: "إدارة جميع تجاربك" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveView(item.key as ViewType)}
              className={`bg-white rounded-xl border p-8 h-36 w-full
                          flex items-center justify-center text-center
                          hover:shadow-lg transition-all
                          ${activeView === item.key ? "ring-2 ring-[#15442f] shadow-lg" : ""}`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div
                  className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors
                    ${activeView === item.key ? "bg-[#15442f] text-white" : "bg-[#15442f]/10 text-[#15442f]"}`}
                >
                  {item.icon}
                </div>
                <div className="font-medium text-[#15442f]">{item.title}</div>
                <div className="text-sm text-muted-foreground">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Products */}
        {activeView === "products" && (
          <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
            {artisanExperiences.length > 0 ? (
              <>
                <div className="p-6 border-b">
                  <h2 className="text-xl text-[#15442f] font-semibold">
                    {t.myProducts || "قائمة المنتجات"}
                  </h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم التجربة</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead>المدينة</TableHead>
                      <TableHead>السعر للشخص</TableHead>
                      <TableHead>العدد الأقصى</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artisanExperiences.map((e) => (
                      <TableRow key={e.id}>
                        <TableCell>{e.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{e.category}</Badge>
                        </TableCell>
                        <TableCell>{e.city}</TableCell>
                        <TableCell>{e.pricePerPerson} ريال</TableCell>
                        <TableCell>{e.maxPersons}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="p-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <LayoutGrid className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl mb-4 text-[#15442f]">لا توجد تجارب/منتجات</h3>
                  <p className="text-muted-foreground mb-8">
                    ابدأ بإضافة تجربتك الأولى ليراها المستخدمون
                  </p>
                  <Button
                    onClick={onAddExperience}
                    className="bg-[#860A33] hover:bg-[#860A33]/90 text-white"
                  >
                    أضف الآن
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Active & Past Reservations */}
        {(activeView === "past" || activeView === "active") && (
          <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
            {getFilteredReservations().length > 0 ? (
              <>
                <div className="p-6 border-b">
                  <h2 className="text-xl text-[#15442f] font-semibold">
                    {activeView === "past" ? "الحجوزات السابقة" : "الحجوزات القائمة"}
                  </h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الفعالية</TableHead>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>عدد الأشخاص</TableHead>
                      <TableHead>المجموع</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getFilteredReservations().map((reservation) => (
                      <TableRow key={reservation.id}>
                        <TableCell>{reservation.experienceTitle}</TableCell>
                        <TableCell>{reservation.userID}</TableCell>
                        <TableCell>{reservation.numberOfPeople}</TableCell>
                        <TableCell>{reservation.totalPrice} ريال</TableCell>
                        <TableCell>
                          {activeView === "past" ? (
                            <Badge className={statusMap[reservation.status].color}>
                              {statusMap[reservation.status].label}
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
                                <SelectItem value="pending">مُعلّقة</SelectItem>
                                <SelectItem value="confirmed">مؤكدة</SelectItem>
                                <SelectItem value="cancelled">مُلغاة</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="p-20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 rounded-full bg-secondary mx-auto mb-6 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl mb-2 text-[#15442f]">
                    {activeView === "past" ? "لا توجد حجوزات سابقة" : "لا توجد حجوزات قائمة"}
                  </h3>
                  <p className="text-muted-foreground">
                    {activeView === "past" ? "ستظهر الحجوزات السابقة هنا" : "ستظهر الحجوزات النشطة هنا"}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
