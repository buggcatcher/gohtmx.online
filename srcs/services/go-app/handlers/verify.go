package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func VerifyHandler(c echo.Context) error {
	req := c.Request()

	if req.Method == http.MethodGet {
		token := c.QueryParam("token")
		if token == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "Token mancante.")
		}

		u, err := findUserByToken(token)
		if err != nil {
			log.Printf("Errore query verifica token (GET): %v", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno.")
		}
		if u == nil || isTokenExpired(u.VerifyExpires) {
			return c.String(http.StatusOK, "Link di conferma non valido o scaduto.")
		}

		return c.Render(http.StatusOK, "verify.html", map[string]string{"Token": token})
	}

	if req.Method == http.MethodPost {
		token := c.FormValue("token")
		if token == "" {
			return echo.NewHTTPError(http.StatusBadRequest, "Token mancante.")
		}

		u, err := findUserByToken(token)
		if err != nil {
			log.Printf("Errore query verifica token (POST): %v", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno.")
		}
		if u == nil {
			return c.String(http.StatusOK, "Link di conferma non valido o già consumato.")
		}
		if isTokenExpired(u.VerifyExpires) {
			return c.String(http.StatusOK, "Il link di conferma è scaduto.")
		}

		_, err = DB.Exec(
			`UPDATE users SET verified = true, verify_token = NULL, verify_expires = NULL
			 WHERE verify_token = $1`,
			token,
		)
		if err != nil {
			log.Printf("Errore aggiornamento verifica utente: %v", err)
			return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno durante la conferma.")
		}

		username := u.Email
		if idx := strings.Index(u.Email, "@"); idx != -1 {
			username = u.Email[:idx]
		}

		return c.Redirect(http.StatusSeeOther, "/?verified=1&user="+username)
	}

	return echo.NewHTTPError(http.StatusMethodNotAllowed, "Metodo non consentito")
}