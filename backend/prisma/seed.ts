/**
 * LensLoop (رنتینو) demo seed.
 *
 * Idempotent: safe to run repeatedly. Rows are matched on natural keys
 * (email / slug) or on fixed IDs, so re-running updates instead of duplicating.
 *
 * Demo accounts (password is the SAME for all of them — demo only, never
 * reuse this anywhere real):
 *
 *   admin@rentino.ir      ADMIN      «مدیر سیستم»
 *   provider@rentino.ir   PROVIDER   «علی رضایی»
 *   provider2@rentino.ir  PROVIDER   «سارا موسوی»
 *   customer@rentino.ir   CUSTOMER   «مریم احمدی»
 *   customer2@rentino.ir  CUSTOMER   «رضا کاظمی»
 *
 *   password: rentino1234
 *
 * Money is integer Rial (1 Toman = 10 Rial). Rental `endDate` is EXCLUSIVE.
 */
import { PrismaClient, Role, RentalStatus, PaymentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "rentino1234";

/** UTC midnight, `days` from today. */
function dayOffset(days: number): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days),
  );
}

interface SeedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const USERS: SeedUser[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "مدیر سیستم",
    email: "admin@rentino.ir",
    role: Role.ADMIN,
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "علی رضایی",
    email: "provider@rentino.ir",
    role: Role.PROVIDER,
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "سارا موسوی",
    email: "provider2@rentino.ir",
    role: Role.PROVIDER,
  },
  {
    id: "44444444-4444-4444-8444-444444444444",
    name: "مریم احمدی",
    email: "customer@rentino.ir",
    role: Role.CUSTOMER,
  },
  {
    id: "55555555-5555-4555-8555-555555555555",
    name: "رضا کاظمی",
    email: "customer2@rentino.ir",
    role: Role.CUSTOMER,
  },
];

const CATEGORIES = [
  {
    slug: "cars",
    name: "خودرو",
    icon: "cars",
    description: "خودروهای سواری برای سفر، کار و استفاده روزانه",
  },
  {
    slug: "consoles",
    name: "کنسول بازی",
    icon: "consoles",
    description: "کنسول‌های بازی نسل جدید به‌همراه دسته و بازی",
  },
  {
    slug: "bikes",
    name: "دوچرخه",
    icon: "bikes",
    description: "دوچرخه شهری، کوهستان و برقی برای گردش و ورزش",
  },
  {
    slug: "cameras",
    name: "دوربین",
    icon: "cameras",
    description: "دوربین عکاسی، فیلم‌برداری و اکشن‌کم",
  },
  {
    slug: "laptops",
    name: "لپ‌تاپ",
    icon: "laptops",
    description: "لپ‌تاپ برای کار، تحصیل و گیمینگ",
  },
  {
    slug: "sports",
    name: "ورزش و سرگرمی",
    icon: "sports",
    description: "لوازم ورزشی و سرگرمی برای تمرین، بازی و اوقات فراغت",
  },
];

interface SeedGear {
  slug: string;
  name: string;
  categorySlug: string;
  providerEmail: string;
  brand: string | null;
  description: string;
  images: string[];
  pricePerDay: number;
  stock: number;
  specifications: Record<string, string>;
  isActive?: boolean;
}

/**
 * `slug` is a stable identifier used as the upsert key, so it is intentionally
 * NOT renamed when a listing's display name changes (see `peugeot-206-tip2`
 * and `mountain-bike-29`). Renaming a slug would insert a duplicate row and
 * leave the original behind on the next seed run.
 *
 * Listings whose entry starts with a `// photo:` comment have a real product
 * photo under `public/images/gear/`; the rest still use the category SVG
 * placeholder until a real photo is available.
 */
const GEAR: SeedGear[] = [
  // ---- Cars (provider@rentino.ir)
  {
    slug: "pride-131-1400",
    name: "پراید ۱۳۱ مدل ۱۴۰۰",
    categorySlug: "cars",
    providerEmail: "provider@rentino.ir",
    brand: "سایپا",
    description:
      "پراید ۱۳۱ مدل ۱۴۰۰، کم‌کارکرد (زیر ۴۰٬۰۰۰ کیلومتر) و کاملاً تمیز. بیمه شخص ثالث و بدنه تا پایان سال معتبر است و خودرو با باک پر و معاینه فنی تحویل داده می‌شود. مناسب سفرهای شهری و بین‌شهری و استفاده روزانه.",
    images: ["/images/cars.svg"],
    pricePerDay: 8_000_000,
    stock: 1,
    specifications: {
      گیربکس: "دنده‌ای",
      "سال تولید": "۱۴۰۰",
      سوخت: "بنزین",
      "کیلومتر کارکرد": "۴۰٬۰۰۰",
      بیمه: "شخص ثالث و بدنه",
      "تحویل در محل": "دارد",
    },
  },
  // photo: پراید/۲۰۶ جای خود را به تصویر واقعی پژو ۲۰۷ می‌دهد (slug ثابت مانده است)
  {
    slug: "peugeot-206-tip2",
    name: "پژو ۲۰۷ مدل ۱۳۹۶",
    categorySlug: "cars",
    providerEmail: "provider@rentino.ir",
    brand: "ایران‌خودرو",
    description:
      "پژو ۲۰۷ مدل ۱۳۹۶ با موتور ۱.۶ لیتری، کولر سالم و لاستیک‌های نو. بدنه بدون خط و خش، سرویس دوره‌ای به‌موقع و بیمه معتبر. امکان تحویل در محل و اجاره روزانه، هفتگی یا ماهانه.",
    images: ["/images/gear/peugeot-207.jpg"],
    pricePerDay: 12_000_000,
    stock: 2,
    specifications: {
      گیربکس: "دنده‌ای",
      "سال تولید": "۱۳۹۶",
      سوخت: "بنزین",
      "حجم موتور": "۱.۶ لیتر",
      کولر: "دارد",
      لاستیک: "نو",
    },
  },
  {
    slug: "samand-lx",
    name: "سمند LX دوگانه‌سوز",
    categorySlug: "cars",
    providerEmail: "provider@rentino.ir",
    brand: "ایران‌خودرو",
    description:
      "سمند LX دوگانه‌سوز با موتور EF7، جادار و مطمئن برای سفرهای خانوادگی. مجهز به دو کیسه هوا، ترمز ABS و کولر. صندوق بزرگ و مصرف اقتصادی، گزینه‌ای مناسب برای سفرهای جاده‌ای.",
    images: ["/images/cars.svg"],
    pricePerDay: 10_000_000,
    stock: 1,
    specifications: {
      گیربکس: "دنده‌ای",
      "سال تولید": "۱۳۹۹",
      سوخت: "دوگانه‌سوز (بنزین/CNG)",
      "حجم موتور": "۱.۷ لیتر (EF7)",
      "کیسه هوا": "۲ عدد",
      ترمز: "ABS",
    },
  },
  // ---- Consoles (provider2@rentino.ir)
  // photo: پلی‌استیشن ۵ اسلیم نسخه دیسک‌خور
  {
    slug: "playstation-5-disc",
    name: "پلی‌استیشن ۵ (نسخه دیسک‌خور)",
    categorySlug: "consoles",
    providerEmail: "provider2@rentino.ir",
    brand: "Sony",
    description:
      "کنسول پلی‌استیشن ۵ نسخه دیسک‌خور به‌همراه دو دسته DualSense و پنج بازی روز. مناسب مهمانی و دورهمی‌های آخر هفته. در صورت درخواست، بازی دلخواه هم نصب می‌شود.",
    images: ["/images/gear/playstation-5.jpg"],
    pricePerDay: 4_000_000,
    stock: 3,
    specifications: {
      نسخه: "دیسک‌خور (Slim)",
      نسل: "نهم",
      حافظه: "۱ ترابایت",
      دسته: "۲ عدد DualSense",
      "بازی همراه": "۵ عنوان",
      رزولوشن: "۴K / ۱۲۰ هرتز",
    },
  },
  {
    slug: "xbox-series-s",
    name: "ایکس‌باکس سری S",
    categorySlug: "consoles",
    providerEmail: "provider2@rentino.ir",
    brand: "Microsoft",
    description:
      "ایکس‌باکس سری S جمع‌وجور با حافظه ۵۱۲ گیگابایتی و اشتراک فعال Game Pass Ultimate. تحویل با یک دسته اورجینال و کابل HDMI. مناسب بازی‌های دیجیتال و اجرای ۱۴۴۰p.",
    images: ["/images/consoles.svg"],
    pricePerDay: 3_000_000,
    stock: 2,
    specifications: {
      نسل: "نهم",
      حافظه: "۵۱۲ گیگابایت",
      دسته: "۱ عدد",
      اشتراک: "Game Pass Ultimate",
      رزولوشن: "۱۴۴۰p / ۱۲۰ هرتز",
    },
  },
  // ---- Bikes (provider2@rentino.ir)
  // photo: دوچرخه کورسی اسکات جای دوچرخه کوهستان را می‌گیرد (slug ثابت مانده است)
  {
    slug: "mountain-bike-29",
    name: "دوچرخه کورسی اسکات Addict",
    categorySlug: "bikes",
    providerEmail: "provider2@rentino.ir",
    brand: "Scott",
    description:
      "دوچرخه کورسی اسکات سری Addict با بدنه کربنی سبک و گروه دنده SRAM. چرخ‌های Zipp با لاستیک تیوبلس و ترمز دیسک هیدرولیک. مناسب رکاب‌زنی جاده‌ای، تمرین و مسابقات.",
    images: ["/images/gear/scott-road-bike.jpg"],
    pricePerDay: 2_000_000,
    stock: 4,
    specifications: {
      برند: "Scott",
      مدل: "Addict RC",
      "جنس بدنه": "کربن",
      دنده: "SRAM (۲۲ سرعته)",
      ترمز: "دیسک هیدرولیک",
      "سایز چرخ": "۷۰۰C",
      وزن: "حدود ۸ کیلوگرم",
    },
  },
  {
    slug: "city-bike",
    name: "دوچرخه شهری سبک",
    categorySlug: "bikes",
    providerEmail: "provider2@rentino.ir",
    brand: "ترک",
    description:
      "دوچرخه شهری سبک با زین طبی و سبد حمل بار، مناسب مسیرهای کوتاه شهری و پیک‌نیک. همراه با زنگ، چراغ و قفل تحویل داده می‌شود.",
    images: ["/images/bikes.svg"],
    pricePerDay: 1_500_000,
    stock: 1,
    specifications: {
      سایز: "۲۶ اینچ",
      دنده: "۷ سرعته",
      ترمز: "لنت‌کشی (V-Brake)",
      "سبد حمل بار": "دارد",
      "قفل و چراغ": "همراه",
    },
  },
  // ---- Cameras (provider2@rentino.ir)
  // photo: کانن EOS R6 با لنز RF
  {
    slug: "canon-eos-r6",
    name: "دوربین کانن EOS R6",
    categorySlug: "cameras",
    providerEmail: "provider2@rentino.ir",
    brand: "Canon",
    description:
      "دوربین فول‌فریم بدون آینه کانن EOS R6 به‌همراه لنز RF 24-105mm f/4L. مجهز به لرزشگیر ۵ محوره بدنه و فیلم‌برداری ۴K. مناسب عکاسی عروسی، تبلیغاتی و فیلم‌برداری حرفه‌ای.",
    images: ["/images/gear/canon-eos-r6.jpg"],
    pricePerDay: 7_000_000,
    stock: 2,
    specifications: {
      حسگر: "فول‌فریم CMOS",
      رزولوشن: "۲۰ مگاپیکسل",
      لنز: "RF 24-105mm f/4L IS",
      لرزشگیر: "۵ محوره (IBIS)",
      فیلم‌برداری: "۴K ۶۰fps",
      "کارت حافظه": "۲ اسلات SD",
    },
  },
  {
    slug: "sony-a7-iii",
    name: "دوربین سونی A7 III",
    categorySlug: "cameras",
    providerEmail: "provider2@rentino.ir",
    brand: "Sony",
    description:
      "دوربین سونی A7 III به‌همراه لنز 28-70mm، دو باتری و دو کارت حافظه. فوکوس خودکار سریع و پایدار، گزینه‌ای مطمئن برای فیلم‌برداری، عکاسی خبری و پرتره.",
    images: ["/images/cameras.svg"],
    pricePerDay: 6_500_000,
    stock: 1,
    specifications: {
      حسگر: "فول‌فریم",
      رزولوشن: "۲۴ مگاپیکسل",
      لنز: "28-70mm f/3.5-5.6",
      "باتری همراه": "۲ عدد",
      "کارت حافظه": "۲ عدد ۶۴ گیگابایت",
      فیلم‌برداری: "۴K ۳۰fps",
    },
  },
  {
    slug: "gopro-hero-11",
    name: "دوربین گوپرو Hero 11",
    categorySlug: "cameras",
    providerEmail: "provider2@rentino.ir",
    brand: "GoPro",
    description:
      "اکشن‌کم گوپرو Hero 11 با لرزشگیر HyperSmooth 5.0 و ضدآب تا ۱۰ متر بدون قاب. همراه با سه‌پایه، بند سینه، بند سر و دو باتری. مناسب سفر، ورزش و ثبت لحظه‌ها.",
    images: ["/images/cameras.svg"],
    pricePerDay: 3_500_000,
    stock: 3,
    specifications: {
      رزولوشن: "۵.۳K ۶۰fps",
      لرزشگیر: "HyperSmooth 5.0",
      ضدآب: "تا ۱۰ متر",
      "لوازم جانبی": "سه‌پایه، بند سینه، بند سر",
      "باتری همراه": "۲ عدد",
    },
  },
  // ---- Laptops (provider@rentino.ir)
  {
    slug: "macbook-air-m2",
    name: "مک‌بوک ایر M2",
    categorySlug: "laptops",
    providerEmail: "provider@rentino.ir",
    brand: "Apple",
    description:
      "مک‌بوک ایر M2 سبک و بی‌صدا با شارژدهی تا ۱۸ ساعت و نمایشگر ۱۳.۶ اینچی Liquid Retina. مناسب جلسات کاری، برنامه‌نویسی و کارهای دانشجویی. شارژر MagSafe همراه دستگاه است.",
    images: ["/images/laptops.svg"],
    pricePerDay: 5_000_000,
    stock: 2,
    specifications: {
      پردازنده: "Apple M2",
      رم: "۸ گیگابایت",
      حافظه: "۲۵۶ گیگابایت SSD",
      نمایشگر: "۱۳.۶ اینچ Liquid Retina",
      شارژدهی: "تا ۱۸ ساعت",
    },
  },
  {
    slug: "asus-tuf-gaming",
    name: "لپ‌تاپ گیمینگ ایسوس TUF",
    categorySlug: "laptops",
    providerEmail: "provider@rentino.ir",
    brand: "Asus",
    description:
      "لپ‌تاپ گیمینگ ایسوس TUF با پردازنده Ryzen 7 و کارت گرافیک RTX 3050. نمایشگر ۱۴۴ هرتز و سیستم خنک‌کننده قوی. مناسب بازی، رندرگیری و کارهای گرافیکی؛ شارژر و ماوس گیمینگ همراه.",
    images: ["/images/laptops.svg"],
    pricePerDay: 4_500_000,
    stock: 1,
    specifications: {
      پردازنده: "AMD Ryzen 7",
      رم: "۱۶ گیگابایت",
      گرافیک: "RTX 3050 4GB",
      حافظه: "۵۱۲ گیگابایت SSD",
      نمایشگر: "۱۵.۶ اینچ ۱۴۴ هرتز",
    },
  },
  // ---- Sports (provider2@rentino.ir)
  // photo: ست راکت تنیس ویلسون
  {
    slug: "tennis-racket-wilson",
    name: "ست راکت تنیس ویلسون",
    categorySlug: "sports",
    providerEmail: "provider2@rentino.ir",
    brand: "Wilson",
    description:
      "ست کامل تنیس شامل دو راکت ویلسون، شش توپ مسابقه‌ای و کیف حمل. مناسب بازی تفریحی و تمرین در زمین‌های روباز و سرپوشیده. توپ‌ها نو تحویل داده می‌شوند.",
    images: ["/images/gear/tennis-racket.jpg"],
    pricePerDay: 900_000,
    stock: 3,
    specifications: {
      برند: "Wilson",
      "تعداد راکت": "۲ عدد",
      "توپ همراه": "۶ عدد",
      "کیف حمل": "دارد",
      سطح: "تفریحی و تمرینی",
    },
  },
];

interface SeedOrder {
  id: string;
  customerEmail: string;
  gearSlug: string;
  quantity: number;
  startOffset: number;
  endOffset: number;
  status: RentalStatus;
  notes: string | null;
  payment: PaymentStatus | null;
}

/** Dates are chosen so no two seeded orders for one listing overlap. */
const ORDERS: SeedOrder[] = [
  {
    id: "aaaaaaaa-0001-4001-8001-000000000001",
    customerEmail: "customer@rentino.ir",
    gearSlug: "playstation-5-disc",
    quantity: 1,
    startOffset: 2,
    endOffset: 5,
    status: RentalStatus.PAID,
    notes: "لطفاً همراه کنسول، دو دسته و کابل HDMI ارسال شود.",
    payment: PaymentStatus.COMPLETED,
  },
  {
    id: "aaaaaaaa-0002-4002-8002-000000000002",
    customerEmail: "customer@rentino.ir",
    gearSlug: "canon-eos-r6",
    quantity: 1,
    startOffset: 7,
    endOffset: 9,
    status: RentalStatus.PLACED,
    notes: "برای مراسم عروسی در تاریخ رزرو نیاز دارم.",
    payment: PaymentStatus.PENDING,
  },
  {
    id: "aaaaaaaa-0003-4003-8003-000000000003",
    customerEmail: "customer2@rentino.ir",
    gearSlug: "pride-131-1400",
    quantity: 1,
    startOffset: 3,
    endOffset: 7,
    status: RentalStatus.CONFIRMED,
    notes: null,
    payment: null,
  },
];

interface SeedReview {
  gearSlug: string;
  customerEmail: string;
  rating: number;
  comment: string;
}

const REVIEWS: SeedReview[] = [
  {
    gearSlug: "playstation-5-disc",
    customerEmail: "customer@rentino.ir",
    rating: 5,
    comment: "کنسول سالم و تمیز بود، تحویل دقیقاً سر وقت انجام شد. قطعاً دوباره اجاره می‌کنم.",
  },
  {
    gearSlug: "playstation-5-disc",
    customerEmail: "customer2@rentino.ir",
    rating: 5,
    comment: "دو دسته و چند بازی همراه کنسول بود؛ برای دورهمی عالی بود.",
  },
  {
    gearSlug: "canon-eos-r6",
    customerEmail: "customer2@rentino.ir",
    rating: 5,
    comment: "لنز و باتری اضافه همراه دوربین بود. کیفیت تصویر فوق‌العاده.",
  },
  {
    gearSlug: "canon-eos-r6",
    customerEmail: "customer@rentino.ir",
    rating: 4,
    comment: "دوربین خوبی بود، فقط کیف حمل نداشت. در کل راضی بودم.",
  },
  {
    gearSlug: "pride-131-1400",
    customerEmail: "customer2@rentino.ir",
    rating: 4,
    comment: "ماشین تمیز و کم‌مصرف بود، مناسب سفر شهری.",
  },
  {
    gearSlug: "macbook-air-m2",
    customerEmail: "customer@rentino.ir",
    rating: 5,
    comment: "باتری عالی و کاملاً بی‌صدا. برای کار برنامه‌نویسی انتخاب خوبی بود.",
  },
  {
    gearSlug: "mountain-bike-29",
    customerEmail: "customer2@rentino.ir",
    rating: 4,
    comment: "دوچرخه سالم و ترمزها تنظیم بود. مسیر کوهستان را راحت رفتم.",
  },
  {
    gearSlug: "gopro-hero-11",
    customerEmail: "customer@rentino.ir",
    rating: 5,
    comment: "لوازم جانبی کامل و ضدآب بودنش در سفر واقعاً به کار آمد.",
  },
];

const BLOG_POSTS = [
  {
    slug: "rahnama-rent-car",
    title: "راهنمای کامل اجاره خودرو در ایران",
    excerpt:
      "قبل از اجاره خودرو چه نکاتی را بررسی کنیم؟ بیمه، ودیعه و شرایط بازگرداندن.",
    category: "راهنما",
    daysAgo: 12,
    content:
      "اجاره خودرو در ایران، اگر نکات کلیدی را بدانید، تجربه‌ای ساده و مطمئن است. مهم‌ترین نکته، بررسی بیمه‌نامه و شرایط ودیعه است. همیشه پیش از تحویل، وضعیت بدنه و لاستیک‌ها را همراه تأمین‌کننده بررسی و ثبت کنید.\n\nنکته دوم، شفافیت در هزینه‌هاست. قیمت روزانه، میزان ودیعه و هزینه کیلومتر اضافه باید از ابتدا مشخص باشد. در رنتینو همه این موارد در صفحه هر آگهی نمایش داده می‌شود.\n\nدر نهایت، زمان بازگرداندن را جدی بگیرید؛ تأخیر معمولاً مشمول جریمه می‌شود. با رعایت همین چند مورد، می‌توانید بدون دغدغه سفر کنید.",
  },
  {
    slug: "best-consoles-for-party",
    title: "بهترین کنسول‌های بازی برای دورهمی",
    excerpt:
      "پلی‌استیشن یا ایکس‌باکس؟ راهنمای انتخاب کنسول مناسب مهمانی شما.",
    category: "سرگرمی",
    daysAgo: 9,
    content:
      "برای دورهمی‌های خانوادگی و دوستانه، انتخاب کنسول مناسب اهمیت زیادی دارد. پلی‌استیشن ۵ با عناوین اختصاصی و گرافیک بالا، انتخابی عالی برای تجربه‌های سینمایی است.\n\nاگر به‌دنبال گزینه‌ای اقتصادی‌تر هستید، ایکس‌باکس سری S به‌همراه اشتراک گیم‌پس، کتابخانه‌ای بزرگ از بازی‌ها را در اختیارتان می‌گذارد.\n\nبه تعداد دسته‌ها و بازی‌های همراه کنسول هم دقت کنید؛ برای مهمانی‌های چندنفره، داشتن دو دسته و چند بازی رقابتی، تجربه را کامل می‌کند.",
  },
  {
    slug: "how-to-choose-camera",
    title: "چطور دوربین مناسب پروژه‌تان را انتخاب کنید",
    excerpt:
      "راهنمای انتخاب دوربین بر اساس نوع پروژه: عکاسی، فیلم‌برداری یا ولاگ.",
    category: "راهنما",
    daysAgo: 6,
    content:
      "انتخاب دوربین به نوع پروژه شما بستگی دارد. برای عکاسی عروسی و تبلیغاتی، دوربین‌های فول‌فریم مانند کانن R6 یا سونی A7 III با لنز زوم، انعطاف بالایی می‌دهند.\n\nبرای ولاگ و محتوای شبکه‌های اجتماعی، اکشن‌کم‌های سبک و ضدآب مانند گوپرو انتخاب بهتری هستند.\n\nپیش از رزرو، به رزولوشن، لنز همراه و باتری اضافه دقت کنید. در رنتینو مشخصات کامل هر دوربین در صفحه آگهی درج شده است.",
  },
];

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // --- users ---------------------------------------------------------------
  for (const user of USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        passwordHash,
      },
    });
  }
  const usersByEmail = new Map(
    (await prisma.user.findMany()).map((user) => [user.email, user]),
  );

  // --- categories ----------------------------------------------------------
  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, icon: category.icon, description: category.description },
      create: category,
    });
  }
  const categoriesBySlug = new Map(
    (await prisma.category.findMany()).map((category) => [
      category.slug,
      category,
    ]),
  );

  // --- gear ----------------------------------------------------------------
  const gearBySlug = new Map<string, { id: string; stock: number; pricePerDay: number }>();
  for (const item of GEAR) {
    const category = categoriesBySlug.get(item.categorySlug);
    const provider = usersByEmail.get(item.providerEmail);
    if (!category || !provider) {
      throw new Error(`seed: missing category/provider for ${item.slug}`);
    }

    const data = {
      name: item.name,
      providerId: provider.id,
      categoryId: category.id,
      description: item.description,
      brand: item.brand,
      images: item.images,
      pricePerDay: item.pricePerDay,
      stock: item.stock,
      specifications: item.specifications,
      isActive: item.isActive ?? true,
    };

    const gear = await prisma.gearItem.upsert({
      where: { slug: item.slug },
      update: data,
      create: { ...data, slug: item.slug, availableStock: item.stock },
    });

    gearBySlug.set(item.slug, {
      id: gear.id,
      stock: gear.stock,
      pricePerDay: gear.pricePerDay,
    });
  }

  // --- orders + payments ---------------------------------------------------
  const RESERVING: RentalStatus[] = [
    RentalStatus.CONFIRMED,
    RentalStatus.PAID,
    RentalStatus.PICKED_UP,
  ];
  const reservedPerGear = new Map<string, number>();

  let orderIndex = 0;
  for (const order of ORDERS) {
    orderIndex += 1;
    const customer = usersByEmail.get(order.customerEmail);
    const gear = gearBySlug.get(order.gearSlug);
    if (!customer || !gear) {
      throw new Error(`seed: missing customer/gear for order ${order.id}`);
    }

    const startDate = dayOffset(order.startOffset);
    const endDate = dayOffset(order.endOffset);
    const days = Math.max(
      1,
      Math.round((endDate.getTime() - startDate.getTime()) / 86_400_000),
    );
    const subtotal = days * gear.pricePerDay * order.quantity;

    await prisma.rentalOrder.upsert({
      where: { id: order.id },
      update: {
        customerId: customer.id,
        startDate,
        endDate,
        totalAmount: subtotal,
        status: order.status,
        notes: order.notes,
      },
      create: {
        id: order.id,
        customerId: customer.id,
        startDate,
        endDate,
        totalAmount: subtotal,
        status: order.status,
        notes: order.notes,
      },
    });

    await prisma.rentalOrderItem.upsert({
      where: { id: `bbbbbbbb-${order.id.slice(9)}` },
      update: {
        rentalOrderId: order.id,
        gearItemId: gear.id,
        quantity: order.quantity,
        pricePerDay: gear.pricePerDay,
        subtotal,
      },
      create: {
        id: `bbbbbbbb-${order.id.slice(9)}`,
        rentalOrderId: order.id,
        gearItemId: gear.id,
        quantity: order.quantity,
        pricePerDay: gear.pricePerDay,
        subtotal,
      },
    });

    if (order.payment) {
      const transactionId = `SIM-SEED-${orderIndex}`;
      const completed = order.payment === PaymentStatus.COMPLETED;
      const paymentData = {
        rentalOrderId: order.id,
        userId: customer.id,
        amount: subtotal,
        method: "SIMULATED",
        status: order.payment,
        paidAt: completed ? new Date() : null,
      };
      await prisma.payment.upsert({
        where: { transactionId },
        update: paymentData,
        create: { ...paymentData, transactionId },
      });
    }

    if (RESERVING.includes(order.status)) {
      reservedPerGear.set(
        order.gearSlug,
        (reservedPerGear.get(order.gearSlug) ?? 0) + order.quantity,
      );
    }
  }

  // Keep `availableStock` consistent with the seeded reservations.
  for (const [slug, gear] of gearBySlug) {
    const reserved = reservedPerGear.get(slug) ?? 0;
    await prisma.gearItem.update({
      where: { id: gear.id },
      data: { availableStock: Math.max(0, gear.stock - reserved) },
    });
  }

  // --- reviews -------------------------------------------------------------
  for (const review of REVIEWS) {
    const gear = gearBySlug.get(review.gearSlug);
    const customer = usersByEmail.get(review.customerEmail);
    if (!gear || !customer) {
      throw new Error(`seed: missing gear/customer for review ${review.gearSlug}`);
    }
    await prisma.review.upsert({
      where: {
        gearItemId_customerId: {
          gearItemId: gear.id,
          customerId: customer.id,
        },
      },
      update: { rating: review.rating, comment: review.comment },
      create: {
        gearItemId: gear.id,
        customerId: customer.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  }

  // Recompute cached rating aggregates from the reviews that now exist.
  const rated = await prisma.review.groupBy({
    by: ["gearItemId"],
    _avg: { rating: true },
    _count: { _all: true },
  });
  for (const gear of gearBySlug.values()) {
    const aggregate = rated.find((row) => row.gearItemId === gear.id);
    await prisma.gearItem.update({
      where: { id: gear.id },
      data: {
        avgRating: aggregate?._avg.rating
          ? Math.round(aggregate._avg.rating * 100) / 100
          : 0,
        reviewCount: aggregate?._count._all ?? 0,
      },
    });
  }

  // --- blog ----------------------------------------------------------------
  const admin = usersByEmail.get("admin@rentino.ir");
  if (!admin) {
    throw new Error("seed: admin user missing");
  }
  for (const post of BLOG_POSTS) {
    const publishedAt = dayOffset(-post.daysAgo);
    const data = {
      authorId: admin.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      isPublished: true,
      publishedAt,
    };
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: data,
      create: { ...data, slug: post.slug },
    });
  }

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    gear: await prisma.gearItem.count(),
    orders: await prisma.rentalOrder.count(),
    payments: await prisma.payment.count(),
    reviews: await prisma.review.count(),
    blogPosts: await prisma.blogPost.count(),
  };
  console.log("seed complete:", counts);
}

main()
  .catch((error) => {
    console.error("seed failed:", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
