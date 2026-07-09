import React from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Mail, MessageSquare } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const DOMAIN = "https://fincalc.net";
const PAGE = "contact";

export default function ContactPage() {
  const { t, locale } = useI18n();
  const { locale: localeParam } = useParams<{ locale: string }>();
  const loc = localeParam ?? locale;
  const c = t.contactPage;

  const koUrl = `${DOMAIN}/ko/${PAGE}`;
  const enUrl = `${DOMAIN}/en/${PAGE}`;
  const canonicalUrl = `${DOMAIN}/${loc}/${PAGE}`;

  return (
    <>
      <Helmet>
        <html lang={loc} />
        <title>{t.meta.contactTitle}</title>
        <meta
          name="description"
          content={
            loc === "ko"
              ? "FinCalc에 문의하거나 의견을 보내주세요. 계산기 오류 신고, 기능 제안 등 환영합니다."
              : "Contact FinCalc — report bugs, suggest features, or send feedback about our financial calculators."
          }
        />
        <link rel="canonical" href={canonicalUrl} />
        <link rel="alternate" hrefLang="ko" href={koUrl} />
        <link rel="alternate" hrefLang="en" href={enUrl} />
        <link rel="alternate" hrefLang="x-default" href={koUrl} />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-5">
            <MessageSquare className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-3">{c.title}</h1>
          <p className="text-muted-foreground">{c.subtitle}</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-8 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-2">{c.feedbackTitle}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">{c.feedbackDesc}</p>
            <a
              href={`mailto:${t.footer.contact}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              {t.footer.contact}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
