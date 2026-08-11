package handlers

import (
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
)

const maxFileSize = 42 * 1024

var allowedExtensions = map[string]string{
	".txt": "text/plain",
	".md":  "text/markdown",
}

type FileRecord struct {
	ID           int       `json:"id"`
	Name         string    `json:"name"`
	Content      string    `json:"content"`
	MimeType     string    `json:"type"`
	Creator      string    `json:"creator"`
	LastEditedBy *string   `json:"last_edited_by"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func ListFilesHandler(c echo.Context) error {
	rows, err := DB.Query(`
		SELECT id, name, content, mime_type, creator_email, last_edited_by, created_at, updated_at
		FROM files ORDER BY created_at ASC`)
	if err != nil {
		log.Printf("Errore query files: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno")
	}
	defer rows.Close()

	var out []FileRecord = []FileRecord{} // Inizializzato per evitare null nel JSON
	for rows.Next() {
		var f FileRecord
		var lastEdited *string
		if err := rows.Scan(&f.ID, &f.Name, &f.Content, &f.MimeType, &f.Creator, &lastEdited, &f.CreatedAt, &f.UpdatedAt); err != nil {
			log.Printf("Errore scan file: %v", err)
			continue
		}
		f.LastEditedBy = lastEdited
		out = append(out, f)
	}

	return c.JSON(http.StatusOK, out)
}

func CreateFileHandler(c echo.Context) error {
	email := c.Request().Header.Get("X-Session-Email")
	if email == "" {
		return echo.NewHTTPError(http.StatusUnauthorized, "Non autenticato")
	}

	c.Request().Body = http.MaxBytesReader(c.Response().Writer, c.Request().Body, maxFileSize+1024)

	var payload struct {
		Name    string `json:"name"`
		Content string `json:"content"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Payload non valido o troppo grande"})
	}

	name, mimeType, msg := sanitizeFile(payload.Name, payload.Content)
	if msg != "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": msg})
	}

	var id int
	err := DB.QueryRow(`
		INSERT INTO files (name, content, mime_type, creator_email)
		VALUES ($1, $2, $3, $4) RETURNING id`,
		name, payload.Content, mimeType, email,
	).Scan(&id)
	if err != nil {
		log.Printf("Errore salvataggio file: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno")
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"id": id, "name": name})
}

func UpdateFileHandler(c echo.Context) error {
	email := c.Request().Header.Get("X-Session-Email")
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID non valido"})
	}

	c.Request().Body = http.MaxBytesReader(c.Response().Writer, c.Request().Body, maxFileSize+1024)
	var payload struct {
		Content string `json:"content"`
	}
	if err := c.Bind(&payload); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Payload non valido o troppo grande"})
	}
	if len(payload.Content) > maxFileSize {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Contenuto troppo grande (max 42KB)"})
	}

	res, err := DB.Exec(`
		UPDATE files SET content = $1, last_edited_by = $2, updated_at = now()
		WHERE id = $3`,
		payload.Content, email, id,
	)
	if err != nil {
		log.Printf("Errore update file: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno")
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "File non trovato")
	}

	return c.NoContent(http.StatusNoContent)
}

func DeleteFileHandler(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "ID non valido"})
	}

	res, err := DB.Exec(`DELETE FROM files WHERE id = $1`, id)
	if err != nil {
		log.Printf("Errore delete file: %v", err)
		return echo.NewHTTPError(http.StatusInternalServerError, "Errore interno")
	}
	if n, _ := res.RowsAffected(); n == 0 {
		return echo.NewHTTPError(http.StatusNotFound, "File non trovato")
	}
	return c.NoContent(http.StatusNoContent)
}

func sanitizeFile(name, content string) (string, string, string) {
	name = strings.TrimSpace(name)
	if name == "" {
		return "", "", "Nome file mancante."
	}
	name = filepath.Base(name)

	ext := strings.ToLower(filepath.Ext(name))
	mimeType, ok := allowedExtensions[ext]
	if !ok {
		return "", "", "Sono ammessi solo file .txt e .md."
	}
	if len(name) > 255 {
		return "", "", "Nome file troppo lungo."
	}
	if len(content) > maxFileSize {
		return "", "", "Il file supera i 42 KB consentiti."
	}
	return name, mimeType, ""
}