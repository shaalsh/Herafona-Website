import { db } from "./firebase";
import {
  addDoc,
  collection,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { EventsPage } from "./components/EventsPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { ProfilePage } from "./components/ProfilePage";
import ReservationsPage from "./components/ReservationsPage";
import { BookingPage } from "./components/BookingPage";
import { AddExperienceModal } from "./components/AddExperienceModal";
import { SimpleToaster } from "./components/SimpleToaster";
import { toast } from "sonner";
import { translations } from "./translations";
import { ForgotPassword } from "./components/ForgotPassword";

import {
  listenAuth,
  signIn,
  register as fbRegister,
  logout as fbLogout,
  getUserDoc,
  createUserDoc,
  updateUserDoc,
  type FireUserDoc,
  type AccountType,
} from "./firebase";

//  Cloudinary Config 
const CLOUD_NAME = "dfxadnqle";
const UPLOAD_PRESET = "herafona_unsigned";
const CLOUD_FOLDER = "herafona/experiences";

//  Collections & Fields 
const EXP_COLLECTION = "experiences";
const BOOKING_COLLECTION = "bookings"; 
const EXPERIENCE_IMAGE_FIELD = "image"; 
const EXPERIENCE_OWNER_FIELD = "artisanUid"; 
 

function dataURLtoBlob(dataUrl: string) {
  const [header, b64] = dataUrl.split(",");
  const mime = header.match(/data:(.*);base64/)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function uploadImageToCloudinary(dataUrl: string): Promise<string> {
  const blob = dataURLtoBlob(dataUrl);
  const form = new FormData();
  form.append("file", blob);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", CLOUD_FOLDER);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("فشل رفع الصورة إلى Cloudinary");
  const json = await res.json();
  return json.secure_url as string;
}

// ===== Types =====
export type PageString =
  | "home"
  | "events"
  | "login"
  | "register"
  | "profile"
  | "reservations"
  | "booking"
  | "assistant"
  | "forgot";

export interface UserData {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  accountType: AccountType;
  avatarUrl?: string;
}

export interface Experience {
  id: string;
  artisanUid: string;
  artisanName: string;
  category: string;
  title: string;
  maxPersons: number;       // ← رقم
  allowedGender: string;
  city: string;
  description: string;
  pricePerPerson: number;   // ← رقم
  durationHours: number;    // ← رقم
  image?: string;           // ← الاسم الموحّد لحقل الصورة
}

export interface Booking {
  id: string;
  experienceId?: string;
  experienceTitle: string;
  userID: string;
  artisanID: string;
  bookingDate: any;
  totalPrice: number;
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: any;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

// محوّل آمن من FireUserDoc إلى UserData
function toUserData(doc: FireUserDoc): UserData {
  return {
    uid: doc.uid ?? "",
    fullName: doc.fullName ?? "",
    email: doc.email ?? "",
    phoneNumber: doc.phoneNumber ?? "",
    city: doc.city ?? "",
    accountType: (doc.accountType as AccountType) ?? "user",
    avatarUrl: (doc as any).avatarUrl,
  };
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageString>("home");
  const [language, setLanguage] = useState<"ar" | "en">("ar");
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [userData, setUserData] = useState<UserData>({
    uid: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    city: "",
    accountType: "user",
  });

  const userType = userData.accountType;
  const userName = userData.fullName;
  const userId = userData.uid;

  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);

  const t = useMemo(() => translations[language] ?? translations.ar, [language]);

  // ===== Auth listener =====
  useEffect(() => {
    const unsub = listenAuth(async (u) => {
      if (u) {
        const docData = await getUserDoc(u.uid);
        if (docData) {
          setUserData(toUserData(docData));
          setIsLoggedIn(true);
        } else {
          // مستخدم مصادق لكن بدون ملف تعريف => أنشئ ملفًا مبدئيًا
          const profile: FireUserDoc = {
            uid: u.uid,
            fullName: u.displayName ?? "",
            email: u.email ?? "",
            phoneNumber: "",
            city: "",
            accountType: "user",
          };
          await createUserDoc(profile);
          setUserData(toUserData(profile));
          setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
        setUserData({
          uid: "",
          fullName: "",
          email: "",
          phoneNumber: "",
          city: "",
          accountType: "user",
        });
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ===== Real-time experiences =====
  useEffect(() => {
    const q = query(collection(db, "experiences"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as Experience[];
      setExperiences(data);
    });
    return () => unsub();
  }, []);

  // ===== Real-time bookings =====
  useEffect(() => {
    const q = query(collection(db, "booking"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => {
        const b = d.data() as any;
        return {
          id: d.id,
          experienceTitle: b.experienceTitle ?? "",
          userID: b.userID ?? "",
          artisanID: b.artisanID ?? "",
          bookingDate: b.bookingDate,
          totalPrice: b.totalPrice ?? 0,
          numberOfPeople: b.numberOfPeople ?? 1,
          status: (b.status ?? "pending") as Booking["status"],
          createdAt: b.createdAt,
        } as Booking;
      });
      setBookings(data);
    });
    return () => unsub();
  }, []);

  // ===== Add experience =====
  const handleAddExperience = async (data: any) => {
    try {
      const imageUrl = data.image ? await uploadImageToCloudinary(data.image) : undefined;

      const payload = {
        artisanUid: userId,
        artisanName: userName,
        category: data.category,
        title: data.title,
        maxPersons: Number(data.maxPersons),
        allowedGender: data.allowedGender,
        city: data.city,
        description: data.description,
        pricePerPerson: Number(data.pricePerPerson),
        durationHours: Number(data.durationHours),
        image: imageUrl, // ← اسم الحقل الموحّد
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "experiences"), payload);
      toast.success(t.experienceAdded ?? "تمت إضافة التجربة بنجاح");
      setShowAddExperienceModal(false);
    } catch (err: any) {
      toast.error(err?.message ?? "تعذّر رفع/حفظ التجربة");
    }
  };

  // ===== Book experience =====
  const handleBook = (experience: Experience) => {
    if (!isLoggedIn) {
      toast.error(t.pleaseLoginToBook ?? "الرجاء تسجيل الدخول لإتمام الحجز");
      setCurrentPage("login");
      return;
    }
    setSelectedExperience(experience);
    setCurrentPage("booking");
  };

  const handleBookingComplete = async (bookingData: any) => {
    if (!selectedExperience) return;
    try {
      await addDoc(collection(db, "booking"), {
        artisanID: selectedExperience.artisanUid ?? "",
        userID: userId,
        experienceTitle: selectedExperience.title,
        bookingDate: bookingData.bookingDate,
        totalPrice: bookingData.totalPrice,
        numberOfPeople: bookingData.numberOfPeople,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSelectedExperience(null);
      setCurrentPage("reservations");
      toast.success(t.bookingSuccess ?? "تم إنشاء الحجز بنجاح");
    } catch (err) {
      toast.error("فشل إنشاء الحجز");
      console.error(err);
    }
  };

  // ===== Update status =====
  const handleUpdateBookingStatus = async (
    bookingId: string,
    newStatus: "pending" | "confirmed" | "cancelled"
  ) => {
    try {
      const ref = doc(db, "booking", bookingId);
      await updateDoc(ref, { status: newStatus });
      toast.success("تم تحديث الحالة بنجاح");
    } catch (err) {
      console.error(err);
      toast.error("فشل تحديث الحالة");
    }
  };

  const handleNavigate = (page: PageString) => {
    setCurrentPage(page);
  };

  if (!authReady) return null;

  return (
    <div className="min-h-screen flex flex-col" dir={language === "ar" ? "rtl" : "ltr"}>
      <Header
        isLoggedIn={isLoggedIn}
        userName={userName}
        onNavigate={handleNavigate}
        onLogout={fbLogout}
        language={language}
        onLanguageToggle={() => setLanguage(language === "ar" ? "en" : "ar")}
      />

      <main className="flex-1">
        {currentPage === "home" && (
          <HomePage onNavigate={handleNavigate} language={language} t={t} />
        )}

        {currentPage === "events" && (
          <EventsPage
            experiences={experiences}
            onBook={handleBook}
            userType={userType}
            onAddExperience={
              userType === "artisan" ? () => setShowAddExperienceModal(true) : undefined
            }
            language={language}
            t={t}
          />
        )}

        {currentPage === "reservations" && (
          <ReservationsPage
            userType={userType}
            userId={userId}
            experiences={experiences}
            bookings={bookings}
            onNavigate={handleNavigate}
            onAddExperience={
              userType === "artisan" ? () => setShowAddExperienceModal(true) : undefined
            }
            onUpdateBookingStatus={handleUpdateBookingStatus}
            language={language}
            t={t}
          />
        )}

        {currentPage === "booking" && selectedExperience && (
          <BookingPage
            experience={selectedExperience}
            onNavigate={handleNavigate}
            onBook={handleBookingComplete}
            language={language}
            t={t}
          />
        )}

        {currentPage === "login" && (
          <LoginPage
          onLogin={async (email, password) => {
  const cred = await signIn(email, password);
  const userDoc = await getUserDoc(cred.user.uid);
  if (!userDoc) {
    toast.error("ملف المستخدم غير موجود. الرجاء إنشاء حساب جديد أولًا.");
    return;
  }
  setUserData(toUserData(userDoc));
  setIsLoggedIn(true);
  setCurrentPage("home");
}}

            onNavigateToRegister={() => setCurrentPage("register")}
            onNavigateToForgot={() => setCurrentPage("forgot")}
            language={language}
            t={t}
          />
        )}

        {currentPage === "register" && (
          <RegisterPage
            onRegister={async (data) => {
              const { user } = await fbRegister(data.email, data.password);
              const profile: FireUserDoc = {
                uid: user.uid,
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                city: data.city,
                accountType: data.accountType,
              };
              await createUserDoc(profile);
              setUserData(toUserData(profile));
              setIsLoggedIn(true);
              setCurrentPage("home");
            }}
            onNavigateToLogin={() => setCurrentPage("login")}
            language={language}
            t={t}
          />
        )}

        {currentPage === "profile" && (
          <ProfilePage
            userData={userData}
            onNavigate={handleNavigate}
            onUpdate={async (data) => {
              await updateUserDoc(userId, data);
              setUserData((prev) => ({ ...prev, ...data }));
            }}
            language={language}
            t={t}
          />
        )}

        {currentPage === "forgot" && (
          <ForgotPassword
            language={language}
            t={t}
            onBackToLogin={() => setCurrentPage("login")}
          />
        )}
      </main>

      <Footer language={language} t={t} onNavigate={handleNavigate} />

      <AddExperienceModal
        isOpen={showAddExperienceModal}
        onClose={() => setShowAddExperienceModal(false)}
        onAdd={handleAddExperience}
        language={language}
        t={t}
      />

      <SimpleToaster />
    </div>
  );
}
