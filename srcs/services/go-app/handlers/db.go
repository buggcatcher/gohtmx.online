package handlers

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitPostgres() error {
	connStr := fmt.Sprintf(
		"host=postgres port=5432 user=%s password=%s dbname=%s sslmode=disable",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_PASSWORD"),
		os.Getenv("POSTGRES_DB"),
	)

	var err error
	DB, err = sql.Open("postgres", connStr)
	if err != nil {
		return err
	}

	if err := DB.Ping(); err != nil {
		return err
	}

	// Schema Utenti
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			verified BOOLEAN NOT NULL DEFAULT false,
			verify_token TEXT,
			verify_expires TIMESTAMP
		)`)
	if err != nil {
		return err
	}

	// Schema File
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS files (
			id             SERIAL PRIMARY KEY,
			name           TEXT NOT NULL,
			content        TEXT NOT NULL DEFAULT '',
			mime_type      TEXT NOT NULL DEFAULT 'text/plain',
			creator_email  TEXT NOT NULL REFERENCES users(email) ON DELETE CASCADE,
			last_edited_by TEXT REFERENCES users(email) ON DELETE SET NULL,
			created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
		)`)
	if err != nil {
		return err
	}

	// NUOVA TABELLA: Telemetria e Intelligence dei Dispositivi
	_, err = DB.Exec(`
		CREATE TABLE IF NOT EXISTS client_telemetry (
			id                SERIAL PRIMARY KEY,
			user_email        TEXT,
			ip_address        TEXT NOT NULL,
			city              TEXT,
			region            TEXT,
			country_code      TEXT,
			isp               TEXT,
			is_vpn            BOOLEAN DEFAULT false,
			is_tor            BOOLEAN DEFAULT false,
			canvas_hash       TEXT,
			os                TEXT,
			platform          TEXT,
			user_agent        TEXT,
			gpu_vendor        TEXT,
			gpu_renderer      TEXT,
			screen_resolution TEXT,
			cores             INTEGER,
			memory            TEXT,
			timezone          TEXT,
			created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
		)`)
	if err != nil {
		return err
	}

	if !mailerConfigured() {
		log.Println("ATTENZIONE: variabili SMTP_* non configurate in .env, le email di conferma non verranno inviate")
	}

	log.Println("Connessione a Postgres stabilita, schema verificato (telemetria inclusa)")
	return nil
}