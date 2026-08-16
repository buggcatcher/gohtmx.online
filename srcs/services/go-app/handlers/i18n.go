// --- internationalization ---
package handlers

import (
	"net/http"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

// SupportedLanguages defines
var SupportedLanguages = []string{"it", "hr", "fr", "es", "de", "uk", "cn", "jp"}

// GetLanguage implements a multi-tier resolution strategy for locating the active language
func GetLanguage(c echo.Context) string {
	// 1. URL Query Override (e.g. ?lang=fr)
	lang := c.QueryParam("lang")
	if lang != "" {
		lang = strings.ToLower(lang)
		if isSupported(lang) {
			setLanguageCookie(c, lang)
			return lang
		}
	}

	// 2. Cookie Value
	cookie, err := c.Cookie("lang")
	if err == nil && cookie.Value != "" {
		cookieLang := strings.ToLower(cookie.Value)
		if isSupported(cookieLang) {
			return cookieLang
		}
	}

	// 3. Browser Accept-Language header matching
	acceptLang := c.Request().Header.Get("Accept-Language")
	if acceptLang != "" {
		parsedLang := parseAcceptLanguage(acceptLang)
		if parsedLang != "" {
			setLanguageCookie(c, parsedLang)
			return parsedLang
		}
	}

	// 4. Default Fallback
	return "it"
}

func isSupported(lang string) bool {
	for _, l := range SupportedLanguages {
		if l == lang {
			return true
		}
	}
	return false
}

func setLanguageCookie(c echo.Context, lang string) {
	cookie := &http.Cookie{
		Name:     "lang",
		Value:    lang,
		Path:     "/",
		HttpOnly: false, // Must be readable from client-side JS (Alpine.js integration)
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(365 * 24 * time.Hour), // 1 Year expiry
	}
	c.SetCookie(cookie)
}

func parseAcceptLanguage(header string) string {
	parts := strings.Split(header, ",")
	for _, part := range parts {
		loc := strings.TrimSpace(strings.Split(part, ";")[0])
		loc = strings.ToLower(loc)
		if len(loc) >= 2 {
			prefix := loc[:2]
			switch prefix {
			case "it":
				return "it"
			case "hr":
				return "hr"
			case "fr":
				return "fr"
			case "es":
				return "es"
			case "de":
				return "de"
			case "en":
				return "uk" // UK English mapping
			case "zh":
				return "cn" // Simplified Chinese mapping
			case "ja":
				return "jp" // Japanese mapping
			}
		}
	}
	return ""
}