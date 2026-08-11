package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

const sessionCookieName = "session"
const sessionDuration = 7 * 24 * time.Hour

var errInvalidSession = errors.New("sessione non valida o scaduta")

func sessionSecret() []byte {
	s := os.Getenv("APP_SECRET")
	if s == "" {
		s = "dev-only-insecure-secret-change-me"
	}
	return []byte(s)
}

func signSession(payload string) string {
	mac := hmac.New(sha256.New, sessionSecret())
	mac.Write([]byte(payload))
	return hex.EncodeToString(mac.Sum(nil))
}

func createSession(c echo.Context, email string) {
	expiry := time.Now().Add(sessionDuration).Unix()
	payload := fmt.Sprintf("%s|%d", email, expiry)
	sig := signSession(payload)
	value := base64.URLEncoding.EncodeToString([]byte(payload)) + "." + sig

	cookie := &http.Cookie{
		Name:     sessionCookieName,
		Value:    value,
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(expiry, 0),
	}
	c.SetCookie(cookie)
}

func clearSession(c echo.Context) {
	cookie := &http.Cookie{
		Name:     sessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
	}
	c.SetCookie(cookie)
}

func sessionEmail(c echo.Context) (string, error) {
	cookie, err := c.Cookie(sessionCookieName)
	if err != nil {
		return "", errInvalidSession
	}

	parts := strings.SplitN(cookie.Value, ".", 2)
	if len(parts) != 2 {
		return "", errInvalidSession
	}

	payloadRaw, sig := parts[0], parts[1]
	payloadBytes, err := base64.URLEncoding.DecodeString(payloadRaw)
	if err != nil {
		return "", errInvalidSession
	}
	payload := string(payloadBytes)

	if !hmac.Equal([]byte(signSession(payload)), []byte(sig)) {
		return "", errInvalidSession
	}

	fields := strings.SplitN(payload, "|", 2)
	if len(fields) != 2 {
		return "", errInvalidSession
	}
	email, expiryStr := fields[0], fields[1]

	expiry, err := strconv.ParseInt(expiryStr, 10, 64)
	if err != nil || time.Now().Unix() > expiry {
		return "", errInvalidSession
	}

	return email, nil
}

// RequireAuth è ora un middleware nativo di Echo
func RequireAuth(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		email, err := sessionEmail(c)
		if err != nil {
			return echo.NewHTTPError(http.StatusUnauthorized, "Non autenticato")
		}
		c.Request().Header.Set("X-Session-Email", email)
		return next(c)
	}
}