import React from "react";
import { useParams, Navigate, Outlet } from "react-router-dom";
import { I18nProvider, type Locale } from "@/lib/i18n";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/toaster";

export default function LocaleLayout() {
  const { locale } = useParams<{ locale: string }>();

  if (locale !== "ko" && locale !== "en") {
    return <Navigate to="/ko" replace />;
  }

  return (
    <I18nProvider locale={locale as Locale}>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
      <Toaster />
    </I18nProvider>
  );
}
