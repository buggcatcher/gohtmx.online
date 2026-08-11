package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strings"
	"time" // Import ripristinato

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

const minPasswordLength = 8
const verifyTokenTTL = 24 * time.Hour // Costante ripristinata qui

type User struct {
	Email         string
	Password      string
	Verified      bool
	VerifyToken   string
	VerifyExpires time.Time
}

func findUserByEmail(email string) (*User, error) {
	var u User
	var verifyToken sql.NullString
	var verifyExpires sql.NullTime

	err := DB.QueryRow(
		`SELECT email, password, verified, verify_token, verify_expires
		 FROM users WHERE email = $1`,
		email,
	).Scan(&u.Email, &u.Password, &u.Verified, &verifyToken, &verifyExpires)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	u.VerifyToken = verifyToken.String
	u.VerifyExpires = verifyExpires.Time
	return &u, nil
}

func findUserByToken(token string) (*User, error) {
	var u User
	var verifyToken sql.NullString
	var verifyExpires sql.NullTime

	err := DB.QueryRow(
		`SELECT email, password, verified, verify_token, verify_expires
		 FROM users WHERE verify_token = $1`,
		token,
	).Scan(&u.Email, &u.Password, &u.Verified, &verifyToken, &verifyExpires)

	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	u.VerifyToken = verifyToken.String
	u.VerifyExpires = verifyExpires.Time
	return &u, nil
}

func RegisterUser(email, password, passwordConfirm string) (string, error) {
	email = strings.TrimSpace(strings.ToLower(email))

	if email == "" || !strings.Contains(email, "@") {
		return "Inserisci un indirizzo email valido.", nil
	}
	if len(password) < minPasswordLength {
		return "La password deve avere almeno 8 caratteri.", nil
	}
	if password != passwordConfirm {
		return "Le due password non coincidono.", nil
	}

	existing, err := findUserByEmail(email)
	if err != nil {
		log.Printf("Errore query utente esistente: %v", err)
		return "Errore interno, riprova più tardi.", err
	}
	if existing != nil {
		return "Se l'indirizzo e' valido potrai confermare la registrazione.", nil
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Errore hashing password: %v", err)
		return "Errore interno, riprova più tardi.", err
	}

	token, err := generateToken()
	if err != nil {
		log.Printf("Errore generazione token: %v", err)
		return "Errore interno, riprova più tardi.", err
	}

	newUser := User{
		Email:         email,
		Password:      string(hashed),
		Verified:      false,
		VerifyToken:   token,
		VerifyExpires: tokenExpiresIn(verifyTokenTTL),
	}

	_, err = DB.Exec(
		`INSERT INTO users (email, password, verified, verify_token, verify_expires)
		 VALUES ($1, $2, $3, $4, $5)`,
		newUser.Email, newUser.Password, newUser.Verified, newUser.VerifyToken, newUser.VerifyExpires,
	)
	if err != nil {
		log.Printf("Errore salvataggio utente: %v", err)
		return "Errore interno, riprova più tardi.", err
	}

	if mailerConfigured() {
		go func() {
			if err := sendVerificationEmail(email, token); err != nil {
				log.Printf("Errore invio email di conferma a %s: %v", email, err)
			}
		}()
	}

	return "", nil
}

func LoginFormHandler(c echo.Context) error {
	return c.Render(http.StatusOK, "login-form.html", nil)
}

func RegisterFormHandler(c echo.Context) error {
	return c.Render(http.StatusOK, "register-form.html", nil)
}

func RegisterHandler(c echo.Context) error {
	email := c.FormValue("email")
	password := c.FormValue("password")
	passwordConfirm := c.FormValue("password_confirm")

	userMsg, err := RegisterUser(email, password, passwordConfirm)
	if userMsg != "" {
		cleanedMsg := strings.ReplaceAll(userMsg, `"`, `'`)
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "`+cleanedMsg+`", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}
	if err != nil {
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "Errore interno durante la registrazione.", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}

	c.Response().Header().Set("HX-Trigger", `{"userRegistered": {"email": "`+email+`", "message": "Ci siamo quasi! Controlla `+email+` e clicca sul link per attivare l'account."}}`)
	return c.String(http.StatusOK, "")
}

func LoginHandler(c echo.Context) error {
	email := strings.TrimSpace(strings.ToLower(c.FormValue("email")))
	password := c.FormValue("password")

	u, err := findUserByEmail(email)
	if err != nil {
		log.Printf("Errore query login: %v", err)
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "Errore interno, riprova.", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}
	if u == nil {
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "Email o password non corretti.", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)); err != nil {
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "Email o password non corretti.", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}
	if !u.Verified {
		c.Response().Header().Set("HX-Trigger", `{"clippySay": {"text": "Devi prima confermare la tua email. Controlla la posta in arrivo.", "tts": true}}`)
		return c.String(http.StatusOK, "")
	}

	createSession(c, u.Email)
	c.Response().Header().Set("HX-Trigger", `{"userLoggedIn": {"email": "`+u.Email+`"}}`)
	return c.String(http.StatusOK, "")
}

func LogoutHandler(c echo.Context) error {
	clearSession(c)
	return c.Redirect(http.StatusSeeOther, "/")
}