package handlers

import (
	"database/sql"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
)

type NetworkTelemetry struct {
	IP          string  `json:"ip"`
	City        string  `json:"city"`
	Region      string  `json:"region"`
	CountryCode string  `json:"country_code"`
	Timezone    string  `json:"timezone"`
	Postal      string  `json:"postal"`
	ASN         string  `json:"asn"`
	Org         string  `json:"org"`
	Latitude    float64 `json:"latitude"`
	Longitude   float64 `json:"longitude"`
	IsVPN       bool    `json:"is_vpn"`
	IsTor       bool    `json:"is_tor"`
	IsProxy     bool    `json:"is_proxy"`
	IsAnycast   bool    `json:"is_anycast"`
	IsHosting   bool    `json:"is_hosting"`
}

type TelemetryPayload struct {
	CanvasHash       string `json:"canvasHash"`
	OS               string `json:"os"`
	Platform         string `json:"platform"`
	UserAgent        string `json:"userAgent"`
	GPUVendor        string `json:"gpuVendor"`
	GPURenderer      string `json:"gpuRenderer"`
	ScreenResolution string `json:"screenRes"`
	Cores            int    `json:"cores"`
	Memory           string `json:"memory"`
	Timezone         string `json:"timezone"`
	ClientIP         string `json:"clientIp"`
	ClientCity       string `json:"clientCity"`
	ClientRegion     string `json:"clientRegion"`
	ClientCountry    string `json:"clientCountry"`
}

func isPrivateIP(ipStr string) bool {
	ip := net.ParseIP(ipStr)
	if ip == nil {
		return true
	}
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}
	privateIPBlocks := []*net.IPNet{
		{IP: net.IPv4(10, 0, 0, 0), Mask: net.CIDRMask(8, 32)},
		{IP: net.IPv4(172, 16, 0, 0), Mask: net.CIDRMask(12, 32)},
		{IP: net.IPv4(192, 168, 0, 0), Mask: net.CIDRMask(16, 32)},
	}
	for _, block := range privateIPBlocks {
		if block.Contains(ip) {
			return true
		}
	}
	return false
}

func sanitizeString(val string) string {
	if val == "" {
		return "n/a"
	}
	return val
}

func NetworkInfoHandler(c echo.Context) error {
	client := http.Client{Timeout: 2 * time.Second}
	var info NetworkTelemetry

	ipAddress := getClientIP(c)

	if isPrivateIP(ipAddress) {
		info = NetworkTelemetry{
			IP:          ipAddress,
			City:         "n/a",
			Region:       "n/a",
			CountryCode:  "n/a",
			Timezone:     "n/a",
			Postal:       "n/a",
			ASN:          "n/a",
			Org:          "n/a",
			IsVPN:        false,
			IsHosting:    false,
		}
		return c.JSON(http.StatusOK, info)
	}

	resp, err := client.Get("https://freeipapi.com/api/json/" + ipAddress)
	if err == nil && resp.StatusCode == http.StatusOK {
		defer resp.Body.Close()
		var raw map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&raw)

		info.IP = ipAddress
		if val, ok := raw["cityName"].(string); ok { info.City = sanitizeString(val) }
		if val, ok := raw["regionName"].(string); ok { info.Region = sanitizeString(val) }
		if val, ok := raw["countryCode"].(string); ok { info.CountryCode = sanitizeString(val) }
		if val, ok := raw["timeZone"].(string); ok { info.Timezone = sanitizeString(val) }
		if val, ok := raw["zipCode"].(string); ok { info.Postal = sanitizeString(val) }
		if val, ok := raw["latitude"].(float64); ok { info.Latitude = val }
		if val, ok := raw["longitude"].(float64); ok { info.Longitude = val }
		info.ASN = "n/a"
		info.Org = "n/a"
	} else {
		info = NetworkTelemetry{
			IP:          ipAddress,
			City:         "n/a",
			Region:       "n/a",
			CountryCode:  "n/a",
			Timezone:     "n/a",
			Postal:       "n/a",
			ASN:          "n/a",
			Org:          "n/a",
		}
	}

	return c.JSON(http.StatusOK, info)
}

func getClientIP(c echo.Context) string {
	ipAddress := c.Request().Header.Get("X-Real-IP")
	if ipAddress == "" {
		ipAddress = c.Request().Header.Get("X-Forwarded-For")
	}
	if ipAddress == "" {
		ipAddress = c.RealIP()
	}
	host, _, err := net.SplitHostPort(ipAddress)
	if err == nil {
		return host
	}
	return ipAddress
}

func MyIPHandler(c echo.Context) error {
	ip := getClientIP(c)
	return c.String(http.StatusOK, ip)
}

func SaveTelemetryHandler(c echo.Context) error {
	var payload TelemetryPayload
	if err := c.Bind(&payload); err != nil {
		log.Printf("[Telemetry] Errore binding payload: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Payload non valido"})
	}

	email, _ := sessionEmail(c)
	ipAddress := getClientIP(c)

	var geo NetworkTelemetry
	geo.City = "n/a"
	geo.Region = "n/a"
	geo.CountryCode = "n/a"

	// Rilevamento server-side (usato solo se l'IP non è una subnet privata)
	if !isPrivateIP(ipAddress) {
		client := http.Client{Timeout: 2 * time.Second}
		resp, err := client.Get("https://freeipapi.com/api/json/" + ipAddress)
		if err == nil && resp.StatusCode == http.StatusOK {
			defer resp.Body.Close()
			var raw map[string]interface{}
			json.NewDecoder(resp.Body).Decode(&raw)
			if val, ok := raw["cityName"].(string); ok { geo.City = sanitizeString(val) }
			if val, ok := raw["regionName"].(string); ok { geo.Region = sanitizeString(val) }
			if val, ok := raw["countryCode"].(string); ok { geo.CountryCode = sanitizeString(val) }
		}
	}

	// Sincronizzazione con i canali geolocalizzati lato client (algoritmo di consenso e specificità)
	finalIP := ipAddress
	if isPrivateIP(finalIP) && payload.ClientIP != "" && payload.ClientIP != "n/a" {
		finalIP = payload.ClientIP
	}

	finalCity := geo.City
	if (finalCity == "" || finalCity == "n/a") && payload.ClientCity != "" && payload.ClientCity != "n/a" {
		finalCity = payload.ClientCity
	}

	finalRegion := geo.Region
	if (finalRegion == "" || finalRegion == "n/a") && payload.ClientRegion != "" && payload.ClientRegion != "n/a" {
		finalRegion = payload.ClientRegion
	}

	finalCountry := geo.CountryCode
	if (finalCountry == "" || finalCountry == "n/a") && payload.ClientCountry != "" && payload.ClientCountry != "n/a" {
		finalCountry = payload.ClientCountry
	}

	_, dbErr := DB.Exec(`
		INSERT INTO client_telemetry (
			user_email, ip_address, city, region, country_code, isp, is_vpn, is_tor,
			canvas_hash, os, platform, user_agent, gpu_vendor, gpu_renderer,
			screen_resolution, cores, memory, timezone
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
		sql.NullString{String: email, Valid: email != ""},
		finalIP,
		finalCity, finalRegion, finalCountry,
		"Network Detection", false, false,
		sanitizeString(payload.CanvasHash),
		sanitizeString(payload.OS),
		sanitizeString(payload.Platform),
		sanitizeString(payload.UserAgent),
		sanitizeString(payload.GPUVendor),
		sanitizeString(payload.GPURenderer),
		sanitizeString(payload.ScreenResolution),
		payload.Cores,
		sanitizeString(payload.Memory),
		sanitizeString(payload.Timezone),
	)

	if dbErr != nil {
		log.Printf("[Telemetry DB] Errore inserimento per %s: %v", email, dbErr)
		return c.JSON(http.StatusInternalServerError, map[string]string{"status": "error_db"})
	}

	log.Printf("[Telemetry DB] Salvataggio avvenuto con successo per %s (IP finale: %s, Località finale: %s)", email, finalIP, finalCity)
	return c.JSON(http.StatusOK, map[string]string{"status": "synchronized"})
}