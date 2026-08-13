package handlers

import (
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
)

func LandingHandler(c echo.Context) error {
	email, err := sessionEmail(c)
	if err == nil && email != "" {
		username := email
		if idx := strings.Index(email, "@"); idx != -1 {
			username = email[:idx]
		}
		return c.Redirect(http.StatusSeeOther, "/desktop?user="+username)
	}
	return c.Render(http.StatusOK, "index.html", nil)
}

func DesktopHandler(c echo.Context) error {
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