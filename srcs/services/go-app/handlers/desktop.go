package handlers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func LandingHandler(c echo.Context) error {
	// Controlla se è presente una sessione utente valida
	email, err := sessionEmail(c)
	if err == nil && email != "" {
		username := email
		if idx := strings.Index(email, "@"); idx != -1 {
			username = email[:idx]
		}
		// Renderizza index.html passando lo stato di autenticazione attivo
		return c.Render(http.StatusOK, "index.html", map[string]interface{}{
			"Username": username,
			"IsGuest":  false,
			"IsAuth":   true,
		})
	}
	return c.Render(http.StatusOK, "index.html", nil)
}

func DesktopHandler(c echo.Context) error {
	// Se l'utente digita l'URL direttamente nel browser (manca l'header HX-Request di HTMX),
	// lo riportiamo alla rotta principale "/" per caricare l'intera shell con CSS e JS.
	if c.Request().Header.Get("HX-Request") == "" {
		return c.Redirect(http.StatusSeeOther, "/")
	}

	username := c.QueryParam("user")
	guest := c.QueryParam("guest") == "1"

	if guest || username == "" {
		username = "Guest"
	}

	return c.Render(http.StatusOK, "desktop.html", map[string]interface{}{
		"Username": username,
		"IsGuest":  guest,
	})
}