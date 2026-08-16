package handlers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func LandingHandler(c echo.Context) error {
	lang := GetLanguage(c)
	email, err := sessionEmail(c)
	if err == nil && email != "" {
		username := email
		if idx := strings.Index(email, "@"); idx != -1 {
			username = email[:idx]
		}
		return c.Render(http.StatusOK, "index.html", map[string]interface{}{
			"Username": username,
			"IsGuest":  false,
			"IsAuth":   true,
			"Lang":     lang,
		})
	}
	return c.Render(http.StatusOK, "index.html", map[string]interface{}{
		"Lang": lang,
	})
}

func DesktopHandler(c echo.Context) error {
	if c.Request().Header.Get("HX-Request") == "" {
		return c.Redirect(http.StatusSeeOther, "/")
	}

	username := c.QueryParam("user")
	guest := c.QueryParam("guest") == "1"
	lang := GetLanguage(c)

	if guest || username == "" {
		username = "Guest"
	}

	return c.Render(http.StatusOK, "desktop.html", map[string]interface{}{
		"Username": username,
		"IsGuest":  guest,
		"Lang":     lang,
	})
}