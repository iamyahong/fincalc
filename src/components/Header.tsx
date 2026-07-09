import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Moon, Sun, Globe, Menu, X, Settings } from "lucide-react";
import { useI18n, type Locale } from "@/lib/i18n";
import { useTheme, type Theme, type FontSize } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function Header() {
  const { t, locale } = useI18n();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: `/${locale}`, label: t.nav.compound },
    { to: `/${locale}/installment`, label: t.nav.installment },
    { to: `/${locale}/average-price`, label: t.nav.averagePrice },
  ];

  function toggleTheme() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  function switchLocale(newLocale: Locale) {
    const parts = pathname.split("/");
    parts[1] = newLocale;
    navigate(parts.join("/") || `/${newLocale}`);
    setLangOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link
          to={`/${locale}`}
          className="flex items-center gap-2 font-bold text-lg text-primary shrink-0"
        >
          <span className="font-mono">₩</span>
          <span>FinCalc</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ to, label }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={toggleTheme}
            aria-label={theme === "dark" ? t.header.themeLight : t.header.themeDark}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setSettingsOpen(false);
              }}
              aria-label={t.header.language}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Globe className="h-4 w-4" />
            </button>
            {langOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setLangOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                  {(["ko", "en"] as Locale[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => switchLocale(l)}
                      className={cn(
                        "w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors",
                        locale === l
                          ? "text-primary font-medium"
                          : "text-foreground",
                      )}
                    >
                      {l === "ko" ? "한국어" : "English"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setSettingsOpen(!settingsOpen);
                setLangOpen(false);
              }}
              aria-label={t.header.displaySettings}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Settings className="h-4 w-4" />
            </button>
            {settingsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setSettingsOpen(false)}
                />
                <div className="absolute right-0 top-10 z-20 bg-card border border-border rounded-lg shadow-lg p-4 min-w-[200px] space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {t.header.theme}
                    </p>
                    <div className="flex gap-2">
                      {(["light", "dark"] as Theme[]).map((opt) => (
                        <button
                          key={opt}
                          onClick={() => setTheme(opt)}
                          className={cn(
                            "flex-1 py-1.5 text-sm rounded-md border transition-colors",
                            theme === opt
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border hover:bg-accent text-foreground",
                          )}
                        >
                          {opt === "light"
                            ? t.header.themeLight
                            : t.header.themeDark}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      {t.header.fontSize}
                    </p>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as FontSize[]).map(
                        (opt) => (
                          <button
                            key={opt}
                            onClick={() => setFontSize(opt)}
                            className={cn(
                              "flex-1 py-1.5 text-sm rounded-md border transition-colors",
                              fontSize === opt
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border hover:bg-accent text-foreground",
                            )}
                          >
                            {opt === "small"
                              ? t.header.fontSmall
                              : opt === "medium"
                                ? t.header.fontMedium
                                : t.header.fontLarge}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="메뉴"
          >
            {mobileOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
