package main

import (
	"html/template"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/monke/go-landing/handlers"
)

func loadTemplates(rootDir string) (*template.Template, error) {
	var files []string
	err := filepath.Walk(rootDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && strings.HasSuffix(info.Name(), ".html") {
			files = append(files, path)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return template.ParseFiles(files...)
}

func main() {
	var err error
	handlers.Templates, err = loadTemplates("templates")
	if err != nil {
		log.Fatalf("Errore compilazione template ricorsivi: %v", err)
	}

	if err := handlers.InitPostgres(); err != nil {
		log.Fatalf("Errore inizializzazione database: %v", err)
	}

	e := echo.New()

    // Configura il motore di rendering per i template HTML
    e.Renderer = &handlers.Template{Templates: handlers.Templates}

    // Middleware di Sicurezza
    e.Use(middleware.SecureWithConfig(middleware.SecureConfig{
        XFrameOptions:         "DENY",
        ContentTypeNosniff:    "nosniff",
        XSSProtection:        "1; mode=block",
        HSTSMaxAge:            31536000, // 1 anno
    }))

    // Se usi HTMX, l'implementazione del CSRF richiede l'invio del token negli header.
    // Per un deploy iniziale rapido puoi rimandare, ma è consigliato attivarlo prima di esporre dati sensibili.

	e.Static("/static", "static") // Serve i file statici tramite Echo (può fungere da fallback a NGINX)

	// Rotte principali
	e.GET("/", handlers.LandingHandler)
	e.GET("/login-form", handlers.LoginFormHandler)
	e.GET("/register-form", handlers.RegisterFormHandler)
	e.POST("/register", handlers.RegisterHandler)
	e.GET("/verify", handlers.VerifyHandler)
	e.POST("/verify", handlers.VerifyHandler)
	e.POST("/login", handlers.LoginHandler)
	e.GET("/logout", handlers.LogoutHandler)
	e.GET("/desktop", handlers.DesktopHandler)
	
	// API Utility
	e.GET("/api/007", handlers.NetworkInfoHandler)
	e.GET("/api/my-ip", handlers.MyIPHandler)
	e.GET("/api/readme", handlers.ReadmeHandler)
	e.POST("/api/telemetry", handlers.SaveTelemetryHandler)

	// API File persistenti con gestione Middleware di Autenticazione nativo di Echo
	e.GET("/api/files", handlers.ListFilesHandler)
	e.POST("/api/files", handlers.CreateFileHandler, handlers.RequireAuth)
	e.PUT("/api/files/:id", handlers.UpdateFileHandler, handlers.RequireAuth)
	e.DELETE("/api/files/:id", handlers.DeleteFileHandler, handlers.RequireAuth)

	log.Println("Server Go con framework Echo attivo sulla porta :8080")
	log.Fatal(e.Start(":8080"))
}