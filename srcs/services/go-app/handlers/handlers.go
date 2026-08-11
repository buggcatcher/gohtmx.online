package handlers

import (
	"html/template"
	"io"

	"github.com/labstack/echo/v4"
)

// Template implementa l'interfaccia echo.Renderer
type Template struct {
	Templates *template.Template
}

func (t *Template) Render(w io.Writer, name string, data interface{}, c echo.Context) error {
	return t.Templates.ExecuteTemplate(w, name, data)
}

// Templates viene popolato da main.go all'avvio
var Templates *template.Template