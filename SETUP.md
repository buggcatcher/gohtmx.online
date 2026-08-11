# 🚀 Setup gohtmx V2 su Nuova Macchina

Questa guida ti aiuta a esportare e importare il progetto su un'altra macchina senza bug di portabilità.


### 2. Configura le Credenziali


**Parametri critici da personalizzare:**

- `POSTGRES_USER` → username (default: jack)
- `POSTGRES_PASSWORD` → password database (CAMBIA!)
- `POSTGRES_DB` → nome del database (default: jack_db)
- `SMTP_HOST` → server SMTP (es: smtp.gmail.com)
- `SMTP_PORT` → porta SMTP (587 per TLS, 465 per SSL)
- `SMTP_USER` → email mittente
- `SMTP_PASS` → password app (per Gmail: genera app-specific password)
- `SMTP_FROM` → email nel campo "From"
- `APP_BASE_URL` → URL base per i link (adatta se non localhost)
- `APP_SECRET` → stringa casuale per firmare sessioni

**Genera una nuova APP_SECRET:**

```bash
openssl rand -hex 32
# Copia l'output e inseriscilo in .env
```

### 4. Verifica il .env

```bash
cat srcs/.env
```

Accertati che:
- Tutti i campi SMTP siano corretti
- APP_SECRET sia una stringa casuale lungo almeno 32 caratteri
- Database username/password siano impostati

### 5. Avvia il Sistema

Vedrai output:

```
🚀 Avvio dei servizi docker compose...
════════════════════════════════════════════════════════════
✓ Sistema avviato con successo!
Accesso: https://<username>.42.fr
Database: docker exec -it gohtmx_postgres psql -U <username>
Log app: docker compose -f srcs/docker-compose.yml logs -f go-app
════════════════════════════════════════════════════════════
```

## 🌐 Accedi all'App

1. Apri browser → `https://<username>.42.fr`
2. Se certificato SSL non è trusted:
   - Firefox: Aggiungi eccezione di sicurezza
   - Chrome: Digita `thisisunsafe` sulla pagina di errore
3. Registrati con un email valido
4. Verifica email (controlla lo spam!)

## 🔧 Comandi

```bash
make all

# Vedi i log
make logs

# Crea backup
make backup

# Riavvia i container
make restart

# Ferma tutto
make down

# Pulisci (cancella dati!)
make fclean

# Ricrea tutto
make re
```

## ❌ Troubleshooting

### "Certificato SSL non valido"
→ È normale in dev! Il certificato usa il tuo domain locale (es: mario.42.fr)

### "Port 443 already in use"
→ Un'altra app usa HTTPS. Cambia in docker-compose.yml:
```yaml
ports:
  - "8443:443"  # Accedi via https://domain:8443
```

### "DNS resolution failed"
→ Verifica che il domain sia in /etc/hosts:
```bash
grep "42.fr" /etc/hosts
# Se manca, aggiungi manualmente:
echo "127.0.0.1 $(whoami).42.fr" | sudo tee -a /etc/hosts
```

### "Database connection refused"
→ Attendi che PostgreSQL sia pronto (controlla healthcheck):
```bash
docker compose -f srcs/docker-compose.yml ps
# Aspetta che postgres sia "healthy"
```

### "Email di verifica non ricevuta"
→ Controlla i log:
```bash
docker compose -f srcs/docker-compose.yml logs go-app | grep SMTP
```

## 📝 Variabili d'Ambiente Dinamiche

Il Makefile usa automaticamente:
- `USER` → Username del sistema (da `whoami`)
- `DOMAIN` → `${USER}.42.fr`
- `DATA_PATH` → `/home/${USER}/data`

Se vuoi usare valori diversi:

```bash
# Override username (es: il tuo vero username è "mario")
make USER=mario

# Override data path
make DATA_PATH=/mnt/gohtmx-data
```

## 🐳 Architettura Docker

```
gohtmx_net (bridge)
├── postgres:15-alpine    → PostgreSQL (port 5432 interno)
├── go-app                → Handler Go (port 8080 interno, Alpine 3.20)
└── nginx:1.27-alpine    → Reverse proxy HTTPS (port 443 host)
                           → Certificati SSL auto-generati con il tuo domain

volumes:
├── /home/${USER}/data/postgres    → Dati database persistenti
├── /home/${USER}/data/static      → File statici (serve via NGINX)
└── /home/${USER}/data/app         → File upload utenti (serve via Go)
```

## 🔒 Sicurezza in Produzione

Prima di deployare in prod:

- [ ] Cambia tutte le password in .env
- [ ] Genera una forte APP_SECRET (`openssl rand -hex 32`)
- [ ] Usa certificati reali (Let's Encrypt), non auto-generati
- [ ] Configura SMTP con credenziali reali
- [ ] Abilita CORS, CSP, altre security headers
- [ ] Usa volumi Docker in posizioni sicure (non in /home se esposto in rete)
- [ ] Attiva logging e monitoring

---


