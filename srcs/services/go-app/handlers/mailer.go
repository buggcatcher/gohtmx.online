package handlers

import (
	"fmt"
	"net/smtp"
	"os"
)

type mailerConfig struct {
	host, port, user, pass, from, baseURL string
}

var mailCfg = mailerConfig{
	host:    os.Getenv("SMTP_HOST"),
	port:    os.Getenv("SMTP_PORT"),
	user:    os.Getenv("SMTP_USER"),
	pass:    os.Getenv("SMTP_PASS"),
	from:    os.Getenv("SMTP_FROM"),
	baseURL: os.Getenv("APP_BASE_URL"),
}

func mailerConfigured() bool {
	return mailCfg.host != "" && mailCfg.port != "" && mailCfg.user != "" &&
		mailCfg.pass != "" && mailCfg.from != "" && mailCfg.baseURL != ""
}

func sendVerificationEmail(to, token string) error {
	link := fmt.Sprintf("%s/verify?token=%s", mailCfg.baseURL, token)

	subject := "Conferma il tuo indirizzo email"
	
	// Utilizziamo un corpo in formato HTML per proteggere l'integrità strutturale dell'URL
	body := fmt.Sprintf(
		"<html><body>"+
			"<p>Ciao!</p>"+
			"<p>Clicca sul link qui sotto per confermare il tuo account su Solar City:</p>"+
			"<p><a href=\"%s\" style=\"color: #00ffcc; text-decoration: none; font-weight: bold;\">%s</a></p>"+
			"<p>Questo link scadrà tra 24 ore.</p>"+
			"<p style=\"color: #888; font-size: 0.8rem;\">Se non hai richiesto questa registrazione, ignora pure questa email.</p>"+
			"</body></html>",
		link, link,
	)

	msg := []byte(fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n%s",
		mailCfg.from, to, subject, body,
	))

	auth := smtp.PlainAuth("", mailCfg.user, mailCfg.pass, mailCfg.host)
	addr := fmt.Sprintf("%s:%s", mailCfg.host, mailCfg.port)

	return smtp.SendMail(addr, auth, mailCfg.from, []string{to}, msg)
}