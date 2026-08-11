package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

func ReadmeHandler(c echo.Context) error {
	return c.String(http.StatusOK, "Questo visualizzatore supporta il Drag & Drop di file txt/md dall'OS! Trascina un file sul desktop.")
}