import type { Category, GearItem, Review, RentalStatus, User } from "@/types";

// =====================================================
// Mock / demo content. All values are fabricated for the
// frontend demo and are NOT real business data. Prices are
// stored in Rial and displayed in Toman via `formatToman`.
// =====================================================

/** ISO date `n` days from today (calendar day, UTC). */
function dayOffset(n: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().split("T")[0];
}

// -----------------------------------------------------
// Categories
// -----------------------------------------------------

export const categories: Category[] = [
  {
    id: "cat-cars",
    name: "خودرو",
    slug: "cars",
    icon: "cars",
    description: "خودروهای سواری برای سفر، کار و استفاده روزانه",
  },
  {
    id: "cat-consoles",
    name: "کنسول بازی",
    slug: "consoles",
    icon: "consoles",
    description: "کنسول‌های بازی نسل جدید به‌همراه دسته و بازی",
  },
  {
    id: "cat-bikes",
    name: "دوچرخه",
    slug: "bikes",
    icon: "bikes",
    description: "دوچرخه شهری، کوهستان و برقی برای گردش و ورزش",
  },
  {
    id: "cat-cameras",
    name: "دوربین",
    slug: "cameras",
    icon: "cameras",
    description: "دوربین عکاسی، فیلم‌برداری و اکشن‌کم",
  },
  {
    id: "cat-laptops",
    name: "لپ‌تاپ",
    slug: "laptops",
    icon: "laptops",
    description: "لپ‌تاپ برای کار، تحصیل و گیمینگ",
  },
];

// -----------------------------------------------------
// Gear listings
// -----------------------------------------------------

const provider = (id: string, name: string) => ({ id, name });

export const gearItems: GearItem[] = [
  // ---- Cars
  {
    id: "gear-pride-131",
    title: "پراید ۱۳۱ مدل ۱۴۰۰",
    slug: "pride-131-1400",
    brand: "سایپا",
    categoryId: "cat-cars",
    category: categories[0],
    providerId: "prov-1",
    provider: provider("prov-1", "علی رضایی"),
    description:
      "پراید ۱۳۱ کم‌کارکرد و تمیز، مناسب سفرهای شهری و بین‌شهری. بیمه شخص ثالث و بدنه معتبر، تحویل با باک پر.",
    images: ["/images/cars.svg"],
    pricePerDay: 8_000_000,
    specs: { گیربکس: "دنده‌ای", "سال تولید": "۱۴۰۰", سوخت: "بنزین" },
    availability: "AVAILABLE",
    stock: 1,
    rating: 4.4,
    reviewCount: 38,
    createdAt: dayOffset(-90),
  },
  {
    id: "gear-206",
    title: "پژو ۲۰۶ تیپ ۲",
    slug: "peugeot-206-tip2",
    brand: "ایران‌خودرو",
    categoryId: "cat-cars",
    category: categories[0],
    providerId: "prov-1",
    provider: provider("prov-1", "علی رضایی"),
    description:
      "پژو ۲۰۶ تیپ ۲ با کولر سالم و لاستیک‌های نو. مناسب اجاره روزانه و هفتگی با تحویل در محل.",
    images: ["/images/cars.svg"],
    pricePerDay: 12_000_000,
    specs: { گیربکس: "دنده‌ای", "سال تولید": "۱۳۹۸", سوخت: "بنزین" },
    availability: "AVAILABLE",
    stock: 2,
    rating: 4.6,
    reviewCount: 52,
    createdAt: dayOffset(-75),
  },
  {
    id: "gear-samand",
    title: "سمند LX",
    slug: "samand-lx",
    brand: "ایران‌خودرو",
    categoryId: "cat-cars",
    category: categories[0],
    providerId: "prov-2",
    provider: provider("prov-2", "مریم احمدی"),
    description:
      "سمند LX جادار و مطمئن با دو کیسه هوا. گزینه‌ای اقتصادی برای سفرهای خانوادگی.",
    images: ["/images/cars.svg"],
    pricePerDay: 10_000_000,
    specs: { گیربکس: "دنده‌ای", "سال تولید": "۱۳۹۹", سوخت: "گازسوز" },
    availability: "RENTED",
    stock: 1,
    rating: 4.3,
    reviewCount: 27,
    createdAt: dayOffset(-60),
  },
  // ---- Consoles
  {
    id: "gear-ps5",
    title: "پلی‌استیشن ۵ (نسخه دیسک‌خور)",
    slug: "playstation-5-disc",
    brand: "Sony",
    categoryId: "cat-consoles",
    category: categories[1],
    providerId: "prov-3",
    provider: provider("prov-3", "رضا کاظمی"),
    description:
      "کنسول پلی‌استیشن ۵ به‌همراه دو دسته و چند بازی روز. مناسب مهمانی و دورهمی‌های آخر هفته.",
    images: ["/images/consoles.svg"],
    pricePerDay: 4_000_000,
    specs: { نسل: "نهم", حافظه: "۸۲۵ گیگابایت", دسته: "۲ عدد" },
    availability: "AVAILABLE",
    stock: 3,
    rating: 4.9,
    reviewCount: 74,
    createdAt: dayOffset(-45),
  },
  {
    id: "gear-xbox",
    title: "ایکس‌باکس سری S",
    slug: "xbox-series-s",
    brand: "Microsoft",
    categoryId: "cat-consoles",
    category: categories[1],
    providerId: "prov-3",
    provider: provider("prov-3", "رضا کاظمی"),
    description:
      "ایکس‌باکس سری S جمع‌وجور به‌همراه اشتراک گیم‌پس. تحویل با یک دسته اورجینال.",
    images: ["/images/consoles.svg"],
    pricePerDay: 3_000_000,
    specs: { نسل: "نهم", حافظه: "۵۱۲ گیگابایت", دسته: "۱ عدد" },
    availability: "AVAILABLE",
    stock: 2,
    rating: 4.7,
    reviewCount: 31,
    createdAt: dayOffset(-30),
  },
  // ---- Bikes
  {
    id: "gear-mtb",
    title: "دوچرخه کوهستان ۲۹ اینچ",
    slug: "mountain-bike-29",
    brand: "شیمانو",
    categoryId: "cat-bikes",
    category: categories[2],
    providerId: "prov-4",
    provider: provider("prov-4", "سارا موسوی"),
    description:
      "دوچرخه کوهستان ۲۱ سرعته با ترمز دیسکی و دوشاخ کمک‌دار. مناسب مسیرهای کوهستانی و شهری.",
    images: ["/images/bikes.svg"],
    pricePerDay: 2_000_000,
    specs: { سایز: "۲۹ اینچ", دنده: "۲۱ سرعته", ترمز: "دیسکی" },
    availability: "AVAILABLE",
    stock: 4,
    rating: 4.5,
    reviewCount: 19,
    createdAt: dayOffset(-20),
  },
  {
    id: "gear-city-bike",
    title: "دوچرخه شهری سبک",
    slug: "city-bike",
    brand: "ترک",
    categoryId: "cat-bikes",
    category: categories[2],
    providerId: "prov-4",
    provider: provider("prov-4", "سارا موسوی"),
    description:
      "دوچرخه شهری سبک با زین راحت و سبد حمل‌بار. مناسب مسیرهای کوتاه و استفاده روزانه.",
    images: ["/images/bikes.svg"],
    pricePerDay: 1_500_000,
    specs: { سایز: "۲۶ اینچ", دنده: "۷ سرعته", ترمز: "لنت‌کشی" },
    availability: "MAINTENANCE",
    stock: 1,
    rating: 4.1,
    reviewCount: 12,
    createdAt: dayOffset(-15),
  },
  // ---- Cameras
  {
    id: "gear-canon-r6",
    title: "دوربین کانن EOS R6",
    slug: "canon-eos-r6",
    brand: "Canon",
    categoryId: "cat-cameras",
    category: categories[3],
    providerId: "prov-5",
    provider: provider("prov-5", "حسین نادری"),
    description:
      "دوربین فول‌فریم بدون آینه کانن R6 به‌همراه لنز ۲۴–۱۰۵ میلی‌متر. مناسب عکاسی عروسی و تبلیغاتی.",
    images: ["/images/cameras.svg"],
    pricePerDay: 7_000_000,
    specs: { حسگر: "فول‌فریم", لنز: "۲۴–۱۰۵ میلی‌متر", رزولوشن: "۲۰ مگاپیکسل" },
    availability: "AVAILABLE",
    stock: 2,
    rating: 4.8,
    reviewCount: 66,
    createdAt: dayOffset(-10),
  },
  {
    id: "gear-sony-a7",
    title: "دوربین سونی A7 III",
    slug: "sony-a7-iii",
    brand: "Sony",
    categoryId: "cat-cameras",
    category: categories[3],
    providerId: "prov-5",
    provider: provider("prov-5", "حسین نادری"),
    description:
      "دوربین سونی A7 III با باتری اضافه و دو کارت حافظه. گزینه‌ای مطمئن برای فیلم‌برداری و عکاسی.",
    images: ["/images/cameras.svg"],
    pricePerDay: 6_500_000,
    specs: { حسگر: "فول‌فریم", لنز: "۲۸–۷۰ میلی‌متر", رزولوشن: "۲۴ مگاپیکسل" },
    availability: "AVAILABLE",
    stock: 1,
    rating: 4.7,
    reviewCount: 41,
    createdAt: dayOffset(-8),
  },
  {
    id: "gear-gopro",
    title: "دوربین گوپرو Hero 11",
    slug: "gopro-hero-11",
    brand: "GoPro",
    categoryId: "cat-cameras",
    category: categories[3],
    providerId: "prov-5",
    provider: provider("prov-5", "حسین نادری"),
    description:
      "اکشن‌کم گوپرو Hero 11 ضدآب به‌همراه پایه‌ها و لوازم جانبی. مناسب سفر و ورزش.",
    images: ["/images/cameras.svg"],
    pricePerDay: 3_500_000,
    specs: { رزولوشن: "۵.۳K", ضدآب: "تا ۱۰ متر", "لوازم جانبی": "کامل" },
    availability: "AVAILABLE",
    stock: 3,
    rating: 4.6,
    reviewCount: 23,
    createdAt: dayOffset(-5),
  },
  // ---- Laptops
  {
    id: "gear-macbook",
    title: "مک‌بوک ایر M2",
    slug: "macbook-air-m2",
    brand: "Apple",
    categoryId: "cat-laptops",
    category: categories[4],
    providerId: "prov-6",
    provider: provider("prov-6", "نگار صادقی"),
    description:
      "مک‌بوک ایر M2 سبک با شارژدهی بالا. مناسب جلسات، برنامه‌نویسی و کارهای روزمره.",
    images: ["/images/laptops.svg"],
    pricePerDay: 5_000_000,
    specs: { پردازنده: "M2", رم: "۸ گیگابایت", حافظه: "۲۵۶ گیگابایت" },
    availability: "AVAILABLE",
    stock: 2,
    rating: 4.9,
    reviewCount: 58,
    createdAt: dayOffset(-3),
  },
  {
    id: "gear-asus-tuf",
    title: "لپ‌تاپ گیمینگ ایسوس TUF",
    slug: "asus-tuf-gaming",
    brand: "Asus",
    categoryId: "cat-laptops",
    category: categories[4],
    providerId: "prov-6",
    provider: provider("prov-6", "نگار صادقی"),
    description:
      "لپ‌تاپ گیمینگ ایسوس TUF با کارت گرافیک اختصاصی. مناسب بازی و رندرگیری.",
    images: ["/images/laptops.svg"],
    pricePerDay: 4_500_000,
    specs: { پردازنده: "Ryzen 7", رم: "۱۶ گیگابایت", گرافیک: "RTX 3050" },
    availability: "AVAILABLE",
    stock: 1,
    rating: 4.5,
    reviewCount: 17,
    createdAt: dayOffset(-2),
  },
];

// -----------------------------------------------------
// Reviews
// -----------------------------------------------------

export const reviews: Review[] = [
  {
    id: "rev-1",
    gearId: "gear-canon-r6",
    customerId: "cust-1",
    customer: { name: "امیر", avatarUrl: null },
    rating: 5,
    comment: "کیفیت دوربین عالی بود و تحویل کاملاً سر وقت انجام شد.",
    createdAt: dayOffset(-6),
  },
  {
    id: "rev-2",
    gearId: "gear-ps5",
    customerId: "cust-2",
    customer: { name: "نگار", avatarUrl: null },
    rating: 5,
    comment: "برای دورهمی گرفتیم، خیلی تمیز و بدون نقص بود.",
    createdAt: dayOffset(-4),
  },
  {
    id: "rev-3",
    gearId: "gear-206",
    customerId: "cust-3",
    customer: { name: "محمد", avatarUrl: null },
    rating: 4,
    comment: "ماشین تمیز بود، فقط تحویل کمی دیر شد.",
    createdAt: dayOffset(-2),
  },
];

// -----------------------------------------------------
// Testimonials (homepage)
// -----------------------------------------------------

export const testimonials: { name: string; role: string; quote: string }[] = [
  {
    name: "امیر کریمی",
    role: "عکاس عروسی",
    quote: "برای پروژه‌های عکاسی همیشه از رنتینو دوربین می‌گیرم؛ قیمت شفاف و تحویل سر وقت.",
  },
  {
    name: "نگار محمدی",
    role: "دانشجو",
    quote: "مک‌بوک را برای امتحان‌هایم اجاره کردم؛ فرایند رزرو خیلی ساده بود.",
  },
  {
    name: "حسین عابدی",
    role: "مشتری خودرو",
    quote: "ماشین تمیز و بیمه‌شده تحویل گرفتم و بدون دردسر برگرداندم.",
  },
];

// -----------------------------------------------------
// Blog posts
// -----------------------------------------------------

export const blogPosts: {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  content: string;
}[] = [
  {
    slug: "rahnama-rent-car",
    title: "راهنمای کامل اجاره خودرو در ایران",
    excerpt:
      "قبل از اجاره خودرو چه نکاتی را بررسی کنیم؟ بیمه، ودیعه و شرایط بازگرداندن.",
    category: "راهنما",
    date: dayOffset(-12),
    content:
      "اجاره خودرو در ایران، اگر نکات کلیدی را بدانید، تجربه‌ای ساده و مطمئن است. مهم‌ترین نکته، بررسی بیمه‌نامه و شرایط ودیعه است. همیشه پیش از تحویل، وضعیت بدنه و لاستیک‌ها را همراه تأمین‌کننده بررسی و ثبت کنید.\n\nنکته دوم، شفافیت در هزینه‌هاست. قیمت روزانه، میزان ودیعه و هزینه کیلومتر اضافه باید از ابتدا مشخص باشد. در رنتینو همه این موارد در صفحه هر آگهی نمایش داده می‌شود.\n\nدر نهایت، زمان بازگرداندن را جدی بگیرید؛ تأخیر معمولاً مشمول جریمه می‌شود. با رعایت همین چند مورد، می‌توانید بدون دغدغه سفر کنید.",
  },
  {
    slug: "best-consoles-for-party",
    title: "بهترین کنسول‌های بازی برای دورهمی",
    excerpt:
      "پلی‌استیشن یا ایکس‌باکس؟ راهنمای انتخاب کنسول مناسب مهمانی شما.",
    category: "سرگرمی",
    date: dayOffset(-9),
    content:
      "برای دورهمی‌های خانوادگی و دوستانه، انتخاب کنسول مناسب اهمیت زیادی دارد. پلی‌استیشن ۵ با عناوین اختصاصی و گرافیک بالا، انتخابی عالی برای تجربه‌های سینمایی است.\n\nاگر به‌دنبال گزینه‌ای اقتصادی‌تر هستید، ایکس‌باکس سری S به‌همراه اشتراک گیم‌پس، کتابخانه‌ای بزرگ از بازی‌ها را در اختیارتان می‌گذارد.\n\nبه تعداد دسته‌ها و بازی‌های همراه کنسول هم دقت کنید؛ برای مهمانی‌های چندنفره، داشتن دو دسته و چند بازی رقابتی، تجربه را کامل می‌کند.",
  },
  {
    slug: "how-to-choose-camera",
    title: "چطور دوربین مناسب پروژه‌تان را انتخاب کنید",
    excerpt:
      "راهنمای انتخاب دوربین بر اساس نوع پروژه: عکاسی، فیلم‌برداری یا ولاگ.",
    category: "راهنما",
    date: dayOffset(-6),
    content:
      "انتخاب دوربین به نوع پروژه شما بستگی دارد. برای عکاسی عروسی و تبلیغاتی، دوربین‌های فول‌فریم مانند کانن R6 یا سونی A7 III با لنز زوم، انعطاف بالایی می‌دهند.\n\nبرای ولاگ و محتوای شبکه‌های اجتماعی، اکشن‌کم‌های سبک و ضدآب مانند گوپرو انتخاب بهتری هستند.\n\nپیش از رزرو، به رزولوشن، لنز همراه و باتری اضافه دقت کنید. در رنتینو مشخصات کامل هر دوربین در صفحه آگهی درج شده است.",
  },
];

// -----------------------------------------------------
// Platform stats (about page)
// -----------------------------------------------------

export const platformStats: { label: string; value: string }[] = [
  { label: "آگهی فعال", value: "۱٬۲۰۰+" },
  { label: "تأمین‌کننده", value: "۳۴۰+" },
  { label: "رزرو موفق", value: "۸٬۵۰۰+" },
  { label: "شهر تحت پوشش", value: "۱۲" },
];

// -----------------------------------------------------
// Rental orders (demo)
// -----------------------------------------------------

export const rentalOrders: {
  id: string;
  gearTitle: string;
  customerName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: RentalStatus;
}[] = [
  {
    id: "ord-1001",
    gearTitle: "پژو ۲۰۶ تیپ ۲",
    customerName: "امیر کریمی",
    startDate: dayOffset(2),
    endDate: dayOffset(5),
    totalAmount: 36_000_000,
    status: "CONFIRMED",
  },
  {
    id: "ord-1002",
    gearTitle: "پلی‌استیشن ۵",
    customerName: "نگار محمدی",
    startDate: dayOffset(1),
    endDate: dayOffset(3),
    totalAmount: 8_000_000,
    status: "PLACED",
  },
  {
    id: "ord-1003",
    gearTitle: "دوربین کانن EOS R6",
    customerName: "حسین عابدی",
    startDate: dayOffset(-2),
    endDate: dayOffset(-1),
    totalAmount: 14_000_000,
    status: "RETURNED",
  },
];

// -----------------------------------------------------
// Payment history (demo)
// -----------------------------------------------------

export const paymentHistory: {
  id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  method: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  paidAt: string | null;
}[] = [
  {
    id: "pay-1",
    transactionId: "TRX-890123",
    orderId: "ord-1001",
    amount: 36_000_000,
    method: "ZARINPAL",
    status: "COMPLETED",
    paidAt: dayOffset(-1),
  },
  {
    id: "pay-2",
    transactionId: "TRX-890124",
    orderId: "ord-1002",
    amount: 8_000_000,
    method: "ZARINPAL",
    status: "PENDING",
    paidAt: null,
  },
];

// -----------------------------------------------------
// Bookings by category (admin chart)
// -----------------------------------------------------

export const bookingsByCategory: { name: string; value: number }[] = [
  { name: "خودرو", value: 420 },
  { name: "کنسول بازی", value: 310 },
  { name: "دوربین", value: 265 },
  { name: "دوچرخه", value: 180 },
  { name: "لپ‌تاپ", value: 140 },
];

// -----------------------------------------------------
// Platform users (admin)
// -----------------------------------------------------

export const platformUsers: User[] = [
  {
    id: "cust-1",
    name: "امیر کریمی",
    email: "amir@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: dayOffset(-120),
  },
  {
    id: "prov-1",
    name: "علی رضایی",
    email: "ali@example.com",
    role: "PROVIDER",
    status: "ACTIVE",
    createdAt: dayOffset(-200),
  },
  {
    id: "cust-2",
    name: "نگار محمدی",
    email: "negar@example.com",
    role: "CUSTOMER",
    status: "ACTIVE",
    createdAt: dayOffset(-40),
  },
  {
    id: "prov-5",
    name: "حسین نادری",
    email: "hossein@example.com",
    role: "PROVIDER",
    status: "SUSPENDED",
    createdAt: dayOffset(-90),
  },
];
