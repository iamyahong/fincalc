import React, { createContext, useContext } from "react";

export type Locale = "ko" | "en";

export interface Messages {
  nav: {
    compound: string;
    installment: string;
    averagePrice: string;
    home: string;
  };
  home: {
    title: string;
    subtitle: string;
    calc1Title: string;
    calc1Desc: string;
    calc2Title: string;
    calc2Desc: string;
    calc3Title: string;
    calc3Desc: string;
    visitCalc: string;
  };
  header: {
    displaySettings: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    fontSize: string;
    fontSmall: string;
    fontMedium: string;
    fontLarge: string;
    language: string;
  };
  footer: {
    privacyPolicy: string;
    contact: string;
    sendFeedback: string;
    copyright: string;
    disclaimer: string;
  };
  privacy: {
    title: string;
    lastUpdated: string;
    intro: string;
    dataCollection: string;
    dataCollectionDesc: string;
    localStorage: string;
    localStorageDesc: string;
    thirdParty: string;
    thirdPartyDesc: string;
    contact: string;
    contactDesc: string;
  };
  contactPage: {
    title: string;
    subtitle: string;
    email: string;
    feedbackTitle: string;
    feedbackDesc: string;
  };
  common: {
    disclaimer: string;
    calculate: string;
    share: string;
    downloadImage: string;
    copied: string;
  };
  meta: {
    homeTitle: string;
    homeDesc: string;
    compoundTitle: string;
    compoundDesc: string;
    installmentTitle: string;
    installmentDesc: string;
    avgPriceTitle: string;
    avgPriceDesc: string;
    privacyTitle: string;
    contactTitle: string;
    siteName: string;
  };
}

const ko: Messages = {
  nav: {
    compound: "복리 계산기",
    installment: "적립식 복리",
    averagePrice: "평단가 계산기",
    home: "홈",
  },
  home: {
    title: "금융 계산기",
    subtitle: "복리, 적립식 투자, 평균 매수가를 쉽고 빠르게.",
    calc1Title: "복리 계산기",
    calc1Desc: "초기 금액에 대한 복리 수익을 계산합니다. 72의 법칙, 복리의 공식 등을 포함합니다.",
    calc2Title: "적립식 복리 계산기",
    calc2Desc: "매월 일정 금액을 적립하며 복리로 불어나는 수익을 계산합니다.",
    calc3Title: "평단가 계산기",
    calc3Desc: "여러 번에 걸쳐 매수한 주식/코인의 평균 매수가를 계산합니다.",
    visitCalc: "계산기 열기",
  },
  header: {
    displaySettings: "화면 설정",
    theme: "테마",
    themeLight: "라이트",
    themeDark: "다크",
    fontSize: "글자 크기",
    fontSmall: "작게",
    fontMedium: "보통",
    fontLarge: "크게",
    language: "언어",
  },
  footer: {
    privacyPolicy: "개인정보처리방침",
    contact: "contact@fincalc.net",
    sendFeedback: "의견 보내기",
    copyright: "© 2026 FinCalc",
    disclaimer: "이 사이트는 참고용 계산기를 제공하며, 투자 권유가 아닙니다.",
  },
  privacy: {
    title: "개인정보처리방침",
    lastUpdated: "최종 업데이트: 2026년 4월 18일",
    intro: "본 개인정보처리방침은 FinCalc('사이트', '저희')이 귀하의 정보를 어떻게 처리하는지 설명합니다.",
    dataCollection: "개인정보 수집",
    dataCollectionDesc: "저희 사이트는 어떠한 개인정보도 수집하지 않습니다. 회원가입, 로그인, 이메일 입력 등의 기능이 없으며, 서버에 사용자 데이터를 저장하지 않습니다.",
    localStorage: "로컬 스토리지 사용",
    localStorageDesc: "평단가 계산기의 저장 기능은 귀하의 브라우저 로컬 스토리지를 사용합니다. 이 데이터는 귀하의 기기에만 저장되며, 외부 서버로 전송되지 않습니다. 브라우저 데이터를 삭제하면 저장된 정보도 함께 삭제됩니다.",
    thirdParty: "제3자 광고",
    thirdPartyDesc: "향후 Google AdSense를 통한 광고가 게재될 수 있습니다. AdSense는 쿠키를 사용하여 귀하의 관심사에 맞는 광고를 표시할 수 있습니다. 자세한 내용은 Google의 개인정보처리방침을 참고하세요.",
    contact: "문의",
    contactDesc: "개인정보처리방침에 관한 문의사항은 contact@fincalc.net으로 연락해 주세요.",
  },
  contactPage: {
    title: "문의하기",
    subtitle: "질문, 오류 신고, 기능 제안 등 무엇이든 보내주세요.",
    email: "이메일",
    feedbackTitle: "의견 보내기",
    feedbackDesc: "계산기 사용 중 불편한 점이나 개선 사항이 있으시면 아래 이메일로 연락해 주세요. 모든 의견을 소중하게 생각합니다.",
  },
  common: {
    disclaimer: "이 계산기는 참고용이며, 투자 권유가 아닙니다.",
    calculate: "계산하기",
    share: "공유하기",
    downloadImage: "사진",
    copied: "링크가 클립보드에 복사되었습니다.",
  },
  meta: {
    homeTitle: "금융 계산기 | FinCalc",
    homeDesc: "복리 계산기, 적립식 복리 계산기, 평단가 계산기를 무료로 이용하세요. 투자 수익을 쉽게 계산하고 재무 계획을 세우세요.",
    compoundTitle: "복리 계산기 | FinCalc",
    compoundDesc: "복리의 힘을 계산하세요. 초기 금액, 수익률, 기간을 입력하면 복리 수익을 자세히 볼 수 있습니다. 72의 법칙 설명 포함.",
    installmentTitle: "적립식 복리 계산기 | FinCalc",
    installmentDesc: "매월 적립하는 금액의 복리 수익을 계산하세요. 연복리, 월복리 등 다양한 복리 방식을 지원합니다.",
    avgPriceTitle: "평단가 계산기 | FinCalc",
    avgPriceDesc: "주식, 코인 등 여러 번에 걸쳐 매수한 자산의 평균 매수가를 계산하세요. 결과를 저장하고 공유할 수 있습니다.",
    privacyTitle: "개인정보처리방침 | FinCalc",
    contactTitle: "문의하기 | FinCalc",
    siteName: "FinCalc",
  },
};

const en: Messages = {
  nav: {
    compound: "Compound Interest",
    installment: "Installment Compound",
    averagePrice: "Average Price",
    home: "Home",
  },
  home: {
    title: "Financial Calculators",
    subtitle: "Easily calculate compound interest, installment savings, and average purchase price.",
    calc1Title: "Compound Interest Calculator",
    calc1Desc: "Calculate compound returns on an initial investment. Includes Rule of 72 and formula explanations.",
    calc2Title: "Installment Compound Calculator",
    calc2Desc: "Calculate compound returns with monthly recurring deposits.",
    calc3Title: "Average Price Calculator",
    calc3Desc: "Calculate the average purchase price of stocks/crypto bought across multiple transactions.",
    visitCalc: "Open Calculator",
  },
  header: {
    displaySettings: "Display Settings",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    fontSize: "Font Size",
    fontSmall: "Small",
    fontMedium: "Medium",
    fontLarge: "Large",
    language: "Language",
  },
  footer: {
    privacyPolicy: "Privacy Policy",
    contact: "contact@fincalc.net",
    sendFeedback: "Send Feedback",
    copyright: "© 2026 FinCalc",
    disclaimer: "This site provides reference calculators and does not constitute financial advice.",
  },
  privacy: {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: April 18, 2026",
    intro: "This Privacy Policy explains how FinCalc ('Site', 'we') handles your information.",
    dataCollection: "Personal Data Collection",
    dataCollectionDesc: "Our site does not collect any personal information. There are no registration, login, or email features, and we do not store user data on any server.",
    localStorage: "Local Storage Usage",
    localStorageDesc: "The save feature in the Average Price Calculator uses your browser's local storage. This data is stored only on your device and is never transmitted to external servers. Clearing your browser data will also delete this stored information.",
    thirdParty: "Third-Party Advertising",
    thirdPartyDesc: "In the future, ads may be displayed through Google AdSense. AdSense may use cookies to show ads relevant to your interests. Please refer to Google's Privacy Policy for more details.",
    contact: "Contact",
    contactDesc: "For privacy policy inquiries, please contact us at contact@fincalc.net.",
  },
  contactPage: {
    title: "Contact",
    subtitle: "Questions, bug reports, feature requests — we'd love to hear from you.",
    email: "Email",
    feedbackTitle: "Send Feedback",
    feedbackDesc: "If you encounter any issues or have suggestions for improvement, please reach out via email. We value all feedback.",
  },
  common: {
    disclaimer: "This calculator is for reference only and does not constitute financial advice.",
    calculate: "Calculate",
    share: "Share",
    downloadImage: "Download Image",
    copied: "Link copied to clipboard.",
  },
  meta: {
    homeTitle: "Financial Calculators | FinCalc",
    homeDesc: "Free compound interest, installment compound, and average price calculators. Plan your investments and calculate returns easily.",
    compoundTitle: "Compound Interest Calculator | FinCalc",
    compoundDesc: "Calculate the power of compound interest. Enter initial amount, rate, and periods to see your compounding returns in detail. Includes Rule of 72.",
    installmentTitle: "Installment Compound Calculator | FinCalc",
    installmentDesc: "Calculate compound returns with monthly deposits. Supports annual, semi-annual, quarterly, monthly, and daily compounding.",
    avgPriceTitle: "Average Price Calculator | FinCalc",
    avgPriceDesc: "Calculate the average purchase price of stocks, crypto, and other assets bought across multiple transactions. Save and share results.",
    privacyTitle: "Privacy Policy | FinCalc",
    contactTitle: "Contact | FinCalc",
    siteName: "FinCalc",
  },
};

export const messages: Record<Locale, Messages> = { ko, en };

interface I18nContextValue {
  locale: Locale;
  t: Messages;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = messages[locale];
  return (
    <I18nContext.Provider value={{ locale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
