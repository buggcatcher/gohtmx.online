package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"time"
)

// generateToken crea una stringa esadecimale di 32 caratteri (16 byte casuali).
func generateToken() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

// tokenExpiresIn calcola il timestamp di scadenza a partire da adesso.
func tokenExpiresIn(d time.Duration) time.Time {
	return time.Now().Add(d)
}

// isTokenExpired controlla se un token è scaduto confrontando i valori espressi in UTC.
func isTokenExpired(expiry time.Time) bool {
	if expiry.IsZero() {
		return true
	}
	return time.Now().UTC().After(expiry.UTC())
}