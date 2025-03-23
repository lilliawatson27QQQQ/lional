import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Calendar,
  AlertCircle,
  PiggyBank,
  CreditCard as VisaIcon,
  Send,
  Home,
  CreditCard as CardIcon,
  Users,
  Settings,
  LineChart,
  Globe,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Wallet,
  Smartphone,
  Palette,
  RotateCcw,
} from "lucide-react";
import NavigationMenu from "./NavigationMenu";
import Bell from "./Bell";
import DepositFunds from "./DepositFunds";
import OpenNewAccount from "./OpenNewAccount";
import { supabase } from "@/lib/supabase";
import { useToast } from "../ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export default function Dashboard() {
  const [isOpenAccountDialogOpen, setIsOpenAccountDialogOpen] = useState(false);
  const [customer, setCustomer] = useState({
    id: 0,
    name: "",
    balance: 0,
    accounts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState("درهم اماراتي");
  const [showExchangeRates, setShowExchangeRates] = useState(false);
  const [showAddCurrency, setShowAddCurrency] = useState(false);
  const [showWallets, setShowWallets] = useState(false);
  const [showWalletsSection, setShowWalletsSection] = useState(false);
  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [accountActivated, setAccountActivated] = useState(false);
  const [currentBackgroundColor, setCurrentBackgroundColor] =
    useState("bg-white");
  const [showColorPicker, setShowColorPicker] = useState(false);

  // حفظ الألوان والأنماط الأصلية
  const originalStylesRef = useRef(null);
  const dashboardRef = useRef(null);

  const { toast } = useToast();

  // استرجاع بيانات العميل من قاعدة البيانات
  const fetchCustomerData = async () => {
    setIsLoading(true);
    try {
      // استرجاع بيانات العميل من الجلسة
      const storedCustomer = sessionStorage.getItem("currentCustomer");
      if (!storedCustomer) {
        // إذا لم يتم العثور على بيانات العميل، استخدم بيانات افتراضية للعرض
        setCustomer({
          id: 101, // معرف افتراضي
          name: "أحمد محمد",
          balance: 0,
          accounts: [],
        });
        setIsLoading(false);
        return;
      }

      const customerData = JSON.parse(storedCustomer);

      // استرجاع حسابات العميل من قاعدة البيانات
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("customer_id", customerData.id);

      if (accountsError) throw accountsError;

      // حساب إجمالي الرصيد من جميع الحسابات
      let totalBalance = 0;
      if (accounts && accounts.length > 0) {
        // حساب الرصيد الإجمالي بالدرهم الاماراتي
        accounts.forEach((account) => {
          if (account.currency === "درهم اماراتي") {
            totalBalance += account.balance;
          } else if (account.currency === "دولار أمريكي") {
            // تحويل الدولار إلى درهم (سعر تقريبي)
            totalBalance += account.balance * 3.67;
          } else if (account.currency === "يورو") {
            // تحويل اليورو إلى درهم (سعر تقريبي)
            totalBalance += account.balance * 4.02;
          }
        });
      }

      setCustomer({
        ...customerData,
        balance: totalBalance,
        accounts: accounts || [],
      });
    } catch (error) {
      console.error("Error fetching customer data:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء استرجاع بيانات العميل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تنسيق الرصيد
  const formatBalance = (balance) => {
    return balance.toLocaleString();
  };

  // استرجاع البيانات عند تحميل المكون
  useEffect(() => {
    fetchCustomerData();
  }, []);

  // حفظ الأنماط الأصلية عند تحميل المكون
  useEffect(() => {
    if (dashboardRef.current && !originalStylesRef.current) {
      // حفظ الأنماط الأصلية لجميع العناصر
      const saveOriginalStyles = () => {
        const elements = dashboardRef.current.querySelectorAll("*");
        const stylesMap = new Map();

        elements.forEach((el, index) => {
          const computedStyle = window.getComputedStyle(el);
          const elementStyles = {
            backgroundColor: computedStyle.backgroundColor,
            color: computedStyle.color,
            borderColor: computedStyle.borderColor,
            boxShadow: computedStyle.boxShadow,
            className: el.className,
          };

          // إضافة معرف فريد لكل عنصر إذا لم يكن موجودًا
          if (!el.dataset.styleId) {
            el.dataset.styleId = `element-${index}`;
          }

          stylesMap.set(el.dataset.styleId, elementStyles);
        });

        originalStylesRef.current = stylesMap;

        // حفظ الخلفية الأصلية للصفحة
        setCurrentBackgroundColor("bg-white");
      };

      // تأخير قليل للتأكد من تحميل جميع العناصر
      setTimeout(saveOriginalStyles, 500);
    }
  }, []);

  // أسعار الصرف
  const exchangeRates = [
    {
      from: "درهم اماراتي",
      to: "دولار أمريكي",
      rate: 0.2723,
      change: -0.0002,
    },
    { from: "درهم اماراتي", to: "يورو", rate: 0.2488, change: 0.0001 },
    { from: "دولار أمريكي", to: "يورو", rate: 0.91, change: 0.002 },
    { from: "دولار أمريكي", to: "جنيه استرليني", rate: 0.78, change: -0.001 },
  ];

  // الحسابات المتاحة
  const availableAccounts = [
    { currency: "درهم اماراتي", icon: "🇦🇪", code: "AED" },
    { currency: "دولار أمريكي", icon: "🇺🇸", code: "USD" },
    { currency: "يورو", icon: "🇪🇺", code: "EUR" },
    { currency: "جنيه استرليني", icon: "🇬🇧", code: "GBP" },
  ];

  // المحافظ الإلكترونية
  const electronicWallets = [
    {
      name: "محفظة Binance",
      icon: "https://www.logo.wine/a/logo/Binance/Binance-Logo.wine.svg",
      balance: 0,
      color: "bg-yellow-500",
      linked: true,
    },
    {
      name: "محفظة Revolut",
      icon: "https://i0.wp.com/www.eseibusinessschool.com/wp-content/uploads/2023/05/Revolut_logo.png?resize=1024%2C1024&ssl=1",
      balance: 0,
      color: "bg-purple-500",
      linked: false,
    },
    {
      name: "محفظة Paypal",
      icon: "https://logowik.com/content/uploads/images/paypal-new-20232814.logowik.com.webp",
      balance: 0,
      color: "bg-indigo-500",
      linked: false,
    },
    {
      name: "محفظة Wise",
      icon: "https://mms.businesswire.com/media/20230301005211/en/1726050/4/02-Wise-logo-bright-green.jpg",
      balance: 0,
      color: "bg-purple-500",
      linked: false,
    },
    {
      name: "محفظة Paysera",
      icon: "https://logowik.com/content/uploads/images/paysera-new9014.logowik.com.webp",
      balance: 0,
      color: "bg-yellow-500",
      linked: false,
    },
    {
      name: "محفظة RedotPay",
      icon: "https://www.fintechfutures.com/files/2025/03/RedotPay-fintech-news-280x280.png",
      balance: 0,
      color: "bg-red-500",
      linked: false,
    },
  ];

  // تغيير لون خلفية الصفحة
  const changeBackgroundColor = (color) => {
    if (dashboardRef.current) {
      // إزالة الخلفية الحالية
      dashboardRef.current.classList.remove(currentBackgroundColor);
      // إضافة الخلفية الجديدة
      dashboardRef.current.classList.add(color);
      // تحديث الحالة
      setCurrentBackgroundColor(color);
    }
  };

  // استعادة الأنماط الأصلية
  const restoreOriginalStyles = () => {
    if (dashboardRef.current && originalStylesRef.current) {
      // استعادة الخلفية الأصلية
      dashboardRef.current.classList.remove(currentBackgroundColor);
      dashboardRef.current.classList.add("bg-white");
      setCurrentBackgroundColor("bg-white");

      toast({
        title: "تم بنجاح",
        description: "تم استعادة الألوان والأنماط الأصلية",
      });
    }
  };

  // قائمة الألوان المتاحة للخلفية
  const backgroundColors = [
    { name: "أبيض", class: "bg-white" },
    { name: "أزرق فاتح", class: "bg-blue-50" },
    { name: "أزرق بارد", class: "bg-sky-50" },
    { name: "أخضر فاتح", class: "bg-green-50" },
    { name: "أصفر فاتح", class: "bg-yellow-50" },
    { name: "وردي فاتح", class: "bg-pink-50" },
    { name: "بنفسجي فاتح", class: "bg-purple-50" },
    { name: "رمادي فاتح", class: "bg-gray-50" },
    { name: "برتقالي فاتح", class: "bg-orange-50" },
    { name: "أحمر فاتح", class: "bg-red-50" },
    { name: "أزرق داكن", class: "bg-blue-100" },
    { name: "أخضر داكن", class: "bg-green-100" },
    { name: "بنفسجي داكن", class: "bg-purple-100" },
    { name: "رمادي داكن", class: "bg-gray-100" },
    { name: "ذهبي فاتح", class: "bg-amber-50" },
  ];

  return (
    <div
      ref={dashboardRef}
      className={`space-y-4 md:space-y-6 p-0 w-full h-screen overflow-y-auto scroll-smooth ${currentBackgroundColor}`}
    >
      {/* رأس الصفحة */}
      {/* بطاقة الرصيد الرئيسية */}
      <Card className="bg-gradient-to-r from-blue-500 to-blue-400 text-white overflow-y-auto h-full relative w-full shadow-xl rounded-xl border border-primary-foreground/5 backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-primary/10 opacity-10 mix-blend-overlay"></div>

        <CardHeader className="p-3 md:p-6 relative z-10">
          <div className="flex flex-col justify-center items-center">
            <CardTitle className="text-xl md:text-2xl font-bold">
              الرصيد الإجمالي
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-3 md:p-6 pt-0 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="w-full md:w-1/2 bg-white/20 p-4 rounded-lg mb-2 text-center md:text-right shadow-inner">
              <p className="text-3xl md:text-4xl font-bold tracking-tight">
                {formatBalance(customer.balance)} د.إ
              </p>
            </div>

            <div className="w-full md:w-1/2 relative">
              <div
                className="overflow-x-auto pb-2 scrollbar-hide"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div
                  className="flex gap-2 min-w-max"
                  id="currency-scroll-container"
                >
                  <div
                    className={`bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 p-2 rounded-lg shadow-md border border-white/10 hover:border-white/30 transition-all text-center min-w-[90px] cursor-pointer ${selectedCurrency === "دولار أمريكي" ? "scale-110 border-yellow-300 shadow-lg z-10" : ""}`}
                    onClick={() => setSelectedCurrency("دولار أمريكي")}
                  >
                    <div className="p-1.5 bg-yellow-500/20 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-yellow-300 font-bold text-sm md:text-base">
                        $
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1">الدولار</p>
                    <p
                      className={`${selectedCurrency === "دولار أمريكي" ? "text-base md:text-lg" : "text-sm md:text-base"} font-bold`}
                    >
                      $ {formatBalance((customer.balance / 3.67).toFixed(2))}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br from-blue-500/20 to-blue-500/5 p-2 rounded-lg shadow-md border border-white/10 hover:border-white/30 transition-all text-center min-w-[90px] cursor-pointer ${selectedCurrency === "يورو" ? "scale-110 border-blue-300 shadow-lg z-10" : ""}`}
                    onClick={() => setSelectedCurrency("يورو")}
                  >
                    <div className="p-1.5 bg-blue-500/30 rounded-full mx-auto mb-1 shadow-inner shadow-blue-400/20 flex items-center justify-center">
                      <span className="text-blue-400 font-bold text-sm md:text-base">
                        €
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1">اليورو</p>
                    <p
                      className={`${selectedCurrency === "يورو" ? "text-base md:text-lg" : "text-sm md:text-base"} font-bold`}
                    >
                      € {formatBalance((customer.balance / 4.02).toFixed(2))}
                    </p>
                  </div>
                  <div
                    className={`bg-gradient-to-br from-green-500/20 to-green-500/5 p-2 rounded-lg shadow-md border border-white/10 hover:border-white/30 transition-all text-center min-w-[90px] cursor-pointer ${selectedCurrency === "جنيه استرليني" ? "scale-110 border-green-300 shadow-lg z-10" : ""}`}
                    onClick={() => setSelectedCurrency("جنيه استرليني")}
                  >
                    <div className="p-1.5 bg-green-500/20 rounded-full mx-auto mb-1 flex items-center justify-center">
                      <span className="text-green-300 font-bold text-sm md:text-base">
                        £
                      </span>
                    </div>
                    <p className="text-xs font-medium mb-1">الجنيه</p>
                    <p
                      className={`${selectedCurrency === "جنيه استرليني" ? "text-base md:text-lg" : "text-sm md:text-base"} font-bold`}
                    >
                      £ {formatBalance((customer.balance / 4.65).toFixed(2))}
                    </p>
                  </div>
                  <div
                    className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-2 rounded-lg shadow-md border border-white/10 hover:border-white/30 transition-all text-center min-w-[90px] cursor-pointer"
                    onClick={() => setShowAddCurrency(true)}
                  >
                    <div className="p-1.5 bg-purple-500/20 rounded-full mx-auto mb-1">
                      <Plus className="h-3 w-3 md:h-4 md:w-4 text-purple-300" />
                    </div>
                    <p className="text-xs font-medium mb-1">إضافة</p>
                    <p className="text-sm md:text-base font-bold">عملة</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="mt-4 mb-4">
            <div className="flex flex-col md:flex-row justify-center gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="solid"
                    size="sm"
                    className="bg-white/90 text-blue-500 hover:bg-white shadow-md border border-white/20 hover:border-white/50 transition-all w-full md:w-auto rounded-full"
                  >
                    <DollarSign className="h-4 w-4 ml-2" />
                    إيداع رصيد
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white text-blue-950 shadow-lg rounded-lg border border-blue-100">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-blue-600 text-lg">
                        تعليمات الإيداع
                      </h4>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h5 className="font-bold text-blue-800 mb-2">
                          الإيداع من بنك الأمان
                        </h5>
                        <p className="text-sm">
                          يمكنك الإيداع من بنك الأمان فقط من خلال:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          <li>رقم الهاتف</li>
                          <li>البريد الإلكتروني</li>
                          <li>رقم الحساب</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <h5 className="font-bold text-amber-800 mb-2">
                          الإيداع من بنك آخر
                        </h5>
                        <p className="text-sm">
                          إذا كنت ترغب بالإيداع من بنك آخر، يرجى الانتقال إلى
                          صفحة التحويلات واختيار قسم الإيداع.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                        onClick={() =>
                          (window.location.href = "/bank/transfers")
                        }
                      >
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                        الانتقال إلى صفحة التحويلات
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="solid"
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 shadow-md border border-white/10 hover:border-white/30 transition-all w-full md:w-auto rounded-full"
                  >
                    <Send className="h-4 w-4 ml-2" />
                    ارسال رصيد
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4 bg-white text-blue-950 shadow-lg rounded-lg border border-blue-100">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-bold text-blue-600 text-lg">
                        تعليمات الإرسال
                      </h4>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h5 className="font-bold text-blue-800 mb-2">
                          الإرسال إلى بنك الأمان
                        </h5>
                        <p className="text-sm">
                          يمكنك إرسال الأموال إلى عملاء بنك الأمان باستخدام:
                        </p>
                        <ul className="list-disc list-inside text-sm mt-1 space-y-1">
                          <li>رقم الهاتف</li>
                          <li>البريد الإلكتروني</li>
                          <li>رقم الحساب</li>
                        </ul>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <h5 className="font-bold text-amber-800 mb-2">
                          الإرسال إلى بنك آخر
                        </h5>
                        <p className="text-sm">
                          للإرسال إلى بنك آخر، ستحتاج إلى معلومات المستلم
                          الكاملة بما في ذلك رقم الآيبان (IBAN) ورمز السويفت
                          (SWIFT).
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                        onClick={() =>
                          (window.location.href = "/bank/transfers")
                        }
                      >
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                        الانتقال إلى صفحة التحويلات
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="solid"
                size="sm"
                className="bg-white/20 text-white hover:bg-white/30 shadow-md border border-white/10 hover:border-white/30 transition-all w-full md:w-auto rounded-full"
                onClick={() => setShowExchangeRates(!showExchangeRates)}
              >
                <Globe className="h-4 w-4 ml-2" />
                أسعار الصرف
              </Button>
            </div>
          </div>

          {/* أسعار الصرف داخل البطاقة الرئيسية */}
          {showExchangeRates && (
            <div className="mt-4 mb-4 p-4 bg-white/10 rounded-lg border border-white/20">
              <h3 className="text-sm font-bold text-white/90 mb-3 text-center flex items-center justify-center">
                <Globe className="h-4 w-4 ml-2 text-white/90" />
                أسعار الصرف المحدثة لليوم
              </h3>
              <div className="space-y-3">
                {exchangeRates.map((rate, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 rounded-lg border border-white/10 hover:border-white/30 transition-all bg-white/5 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/20 rounded-full">
                        <ArrowDownLeft className="h-3 w-3 text-blue-300" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-white">
                          {rate.from} → {rate.to}
                        </p>
                        <p className="text-xs text-white/70">
                          1 {rate.from.split(" ")[0]} = {rate.rate}{" "}
                          {rate.to.split(" ")[0]}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`text-xs font-medium px-2 py-1 rounded-full ${rate.change > 0 ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}
                    >
                      {rate.change > 0 ? "+" : ""}
                      {rate.change.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* زر تفعيل الحساب */}
          <div className="mt-4 mb-4 flex justify-center">
            <Button
              variant="solid"
              size="sm"
              className="bg-white/50 text-blue-500 hover:bg-white shadow-md border border-white/20 hover:border-white/50 transition-all w-full md:w-auto rounded-full"
              onClick={() => {
                setShowAccountNumber(!showAccountNumber);
                if (!accountActivated) {
                  setAccountActivated(true);
                }
              }}
            >
              <CreditCard className="h-4 w-4 ml-2" />
              {accountActivated ? "رقم الحساب" : "تفعيل الحساب"}
            </Button>
          </div>

          {/* عرض رقم الحساب */}
          {showAccountNumber && (
            <div className="mb-4 p-4 bg-white/10 rounded-lg border border-white/20">
              <h3 className="text-sm font-bold text-white/90 mb-2 text-center">
                رقم الحساب البنكي
              </h3>
              <p className="text-center font-mono text-white text-lg">
                AE59 1234 5678 9012 3456
              </p>
            </div>
          )}

          {/* المحافظ الإلكترونية داخل البطاقة الرئيسية */}
          <div className="mt-4 mb-4">
            <button
              onClick={() => setShowWalletsSection(!showWalletsSection)}
              className="w-full text-center bg-white/10 hover:bg-white/20 py-2 rounded-lg transition-all mb-3"
            >
              <h3 className="text-sm font-bold text-white/90 inline-flex items-center">
                المحافظ الإلكترونية
                <span className="mr-2">{showWalletsSection ? "▲" : "▼"}</span>
              </h3>
            </button>

            {showWalletsSection && (
              <div
                className="overflow-x-auto pb-2"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitScrollbar: { display: "none" },
                }}
              >
                <div className="flex gap-2 justify-start w-full">
                  {electronicWallets.map((wallet, index) => (
                    <div
                      key={index}
                      className="bg-white/10 rounded-lg shadow-md border border-white/10 hover:border-white/30 transition-all text-center min-w-[120px] cursor-pointer overflow-hidden"
                    >
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-full h-24 object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {/* أسعار الصرف - تم نقلها إلى داخل البطاقة الرئيسية */}
      {/* المحافظ الإلكترونية */}
      {showWallets && (
        <Card className="max-w-4xl mx-auto w-full shadow-lg border-primary/10 bg-white">
          <CardHeader className="bg-gradient-to-r from-blue-200 to-blue-100 rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Wallet className="h-5 w-5 text-blue-500" />
              المحافظ الإلكترونية
            </CardTitle>
            <CardDescription>ربط وإدارة المحافظ الإلكترونية</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {electronicWallets.map((wallet, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-4 rounded-lg border hover:border-blue-300 transition-all cursor-pointer hover:shadow-md bg-white"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`overflow-hidden rounded-lg w-20 h-20 shadow-md`}
                    >
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      wallet.linked
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/30"
                        : "hover:bg-blue-100 hover:text-blue-500"
                    }
                  >
                    {wallet.linked ? "إدارة" : "ربط"}
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Button
                className="w-full bg-blue-100 text-blue-500 hover:bg-blue-200 border border-blue-200"
                variant="outline"
              >
                <Plus className="h-4 w-4 ml-2" />
                إضافة محفظة جديدة
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* نافذة فتح حساب جديد */}
      <OpenNewAccount
        open={isOpenAccountDialogOpen}
        onOpenChange={setIsOpenAccountDialogOpen}
        onSuccess={() => {
          // تحديث البيانات بعد فتح الحساب بنجاح
          fetchCustomerData();
          toast({
            title: "تم بنجاح",
            description: "تم فتح الحساب الجديد بنجاح",
          });
        }}
        // استخدام معرف العميل الحالي أو القيمة الافتراضية
        customerId={customer?.id || 101}
      />
      {/* أزرار تغيير الخلفية واستعادة الأنماط الأصلية */}
      <div className="fixed bottom-24 left-4 flex flex-col gap-2">
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-white shadow-lg"
          onClick={restoreOriginalStyles}
          title="استعادة الألوان الأصلية"
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
