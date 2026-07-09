import React from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t, locale } = useI18n();

  return (
    <footer className="border-t border-border mt-16 py-8 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to={`/${locale}/privacy`}
              className="hover:text-foreground transition-colors"
            >
              {t.footer.privacyPolicy}
            </Link>
            <a
              href={`mailto:${t.footer.contact}`}
              className="hover:text-foreground transition-colors"
            >
              {t.footer.sendFeedback}
            </a>
            <a
              href={`mailto:${t.footer.contact}`}
              className="hover:text-foreground transition-colors"
            >
              {t.footer.contact}
            </a>
          </div>
          <p>{t.footer.copyright}</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground text-center">
          {t.footer.disclaimer}
        </p>
      </div>
    </footer>
  );
}
