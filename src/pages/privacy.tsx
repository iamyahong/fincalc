import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const DOMAIN = "https://fincalc.net";
const PAGE = "privacy";

export default function PrivacyPage() {
  const { t, locale } = useI18n();
  const { locale: localeParam } = useParams<{ locale: string }>();
  const loc = localeParam ?? locale;
  const p = t.privacy;

  const koUrl = `${DOMAIN}/ko/${PAGE}`;
  const enUrl = `${DOMAIN}/en/${PAGE}`;
  const canonicalUrl = `${DOMAIN}/${loc}/${PAGE}`;

  return (
    <>
      <Helmet>
        <html lang={loc} />
        <title>{t.meta.privacyTitle}</title>
        <meta
          name="description"
          content={
            loc === "ko"
              ? "FinCalc 개인정보처리방침 — 데이터 수집, 로컬 스토리지 사용, 광고 정책에 대해 설명합니다."
              : "FinCalc Privacy Policy — explains data collection, local storage usage, and advertising policy."
          }
        />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ko" href={koUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={koUrl} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">{p.title}</h1>
        <p className="text-sm text-muted-foreground mb-8">{p.lastUpdated}</p>

        <div className="space-y-8 text-foreground">
          <section>
            <p className="text-muted-foreground leading-relaxed">{p.intro}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">{p.dataCollection}</h2>
            <p className="text-muted-foreground leading-relaxed">{p.dataCollectionDesc}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">{p.localStorage}</h2>
            <p className="text-muted-foreground leading-relaxed">{p.localStorageDesc}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">{p.thirdParty}</h2>
            <p className="text-muted-foreground leading-relaxed">{p.thirdPartyDesc}</p>
          </section>
          <section>
            <h2 className="text-xl font-semibold mb-3">{p.contact}</h2>
            <p className="text-muted-foreground leading-relaxed">{p.contactDesc}</p>
          </section>
        </div>
      </div>
    </>
  );
}
