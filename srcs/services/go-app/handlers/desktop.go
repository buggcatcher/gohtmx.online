package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func LandingHandler(c echo.Context) error {
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