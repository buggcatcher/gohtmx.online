NAME       := gohtmx
# Se eseguito con sudo, usa l'utente reale che ha invocato sudo (SUDO_USER),
# altrimenti usa whoami. Evita path /home/root e domain root.42.fr.
APP_USER   := $(if $(SUDO_USER),$(SUDO_USER),$(shell whoami))
USER       ?= $(APP_USER)
DOMAIN     ?= $(USER).42.fr
DATA_PATH  ?= /home/$(USER)/data
BACKUP_PATH:= /home/$(USER)/backups

export DATA_PATH
export USER
export DOMAIN

COMPOSE_ARGS = compose -p $(NAME) --project-directory srcs -f srcs/docker-compose.yml

RED    = \033[0;31m
GREEN  = \033[0;32m
YELLOW = \033[0;33m
BLUE   = \033[0;34m
CYAN   = \033[0;36m
RESET  = \033[0m

.PHONY: all data-init hosts up down restart clean fclean re backup check-env logs

# .env.example non esiste più è da togliere.
check-env:
	@if [ ! -f srcs/.env ]; then \
		printf "$(YELLOW)File .env non trovato. Copio da .env.example...$(RESET)\n"; \
		cp srcs/.env.example srcs/.env; \
		printf "$(BLUE)Creato srcs/.env da template.$(RESET)\n"; \
		printf "$(YELLOW)IMPORTANTE: Edita srcs/.env con le tue credenziali SMTP e database.$(RESET)\n"; \
	fi

all: check-env data-init hosts up

data-init:
	@printf "$(BLUE)================================================================ $(RESET)\n"
	@printf "$(BLUE)Inizializzazione dell'ambiente per utente: $(CYAN)$(USER)$(RESET)\n"
	@printf "$(BLUE)Domain: $(CYAN)$(DOMAIN)$(RESET)\n"
	@printf "$(BLUE)Data path: $(CYAN)$(DATA_PATH)$(RESET)\n"
	@printf "$(BLUE)================================================================ $(RESET)\n"
	@sudo mkdir -p "$(DATA_PATH)/postgres" "$(DATA_PATH)/static" "$(DATA_PATH)/app"
	@sudo chown -R $(USER):$(USER) "$(DATA_PATH)" 2>/dev/null || true
	@sudo cp -rp srcs/services/go-app/static/* "$(DATA_PATH)/static/" 2>/dev/null || true
	@sudo chmod -R 755 "$(DATA_PATH)/static"
	@printf "$(GREEN)Directory dati create e configurate$(RESET)\n"
	

hosts:
	@if ! grep -qF "$(DOMAIN)" /etc/hosts; then \
		printf "$(BLUE)Aggiungendo $(DOMAIN) a /etc/hosts...$(RESET)\n"; \
		echo "127.0.0.1 $(DOMAIN)" | sudo tee -a /etc/hosts >/dev/null; \
		printf "$(GREEN)Entry DNS locale aggiunto$(RESET)\n"; \
	else \
		printf "$(GREEN)$(DOMAIN) gia presente in /etc/hosts$(RESET)\n"; \
	fi

up:
	@DC=""; \
	if docker info >/dev/null 2>&1; then \
		DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then \
		DC="sudo --preserve-env=DATA_PATH,USER,DOMAIN -n docker"; \
	else \
		printf "$(RED)Docker non accessibile (daemon spento o permessi mancanti).$(RESET)\n"; \
		printf "$(YELLOW)Esegui: sudo -v, poi riprova make up.$(RESET)\n"; \
		printf "$(YELLOW)Oppure aggiungi l'utente al gruppo docker: sudo usermod -aG docker $(USER)$(RESET)\n"; \
		exit 1; \
	fi; \
	DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) config >/dev/null || { \
		printf "$(RED)docker-compose.yml non valido oppure variabili env mancanti.$(RESET)\n"; \
		exit 1; \
	}; \
	printf "\n$(GREEN)Avvio dei servizi docker compose...$(RESET)\n"; \
	DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) up -d --build || { \
		printf "$(RED)Errore durante docker compose up. Stato servizi:$(RESET)\n"; \
		DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) ps || true; \
		printf "$(YELLOW)Ultimi log (80 righe):$(RESET)\n"; \
		DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) logs --tail=80 || true; \
		exit 1; \
	}
	@printf "\n$(CYAN)                     ##        .            $(RESET)\n"
	@printf "$(CYAN)               ## ## ##       ==            $(RESET)\n"
	@printf "$(CYAN)            ## ## ## ##      ===            $(RESET)\n"
	@printf "$(CYAN)        /\"\"\"\"\"\"\"\"\"\"\"\"\"\"\\___/ ===        $(RESET)\n"
	@printf "$(CYAN) ~~~~~ {~~ ~~~~ ~~~ ~~~~ ~~ ~ /  ===- ~~~~~   $(RESET)\n"
	@printf "$(CYAN)        \\______ ^          __/            $(RESET)\n"
	@printf "$(CYAN)          \\    \\        __/             $(RESET)\n"
	@printf "$(CYAN)           \\____\\______/                $(RESET)\n"
	@printf "\n$(CYAN)        |          |$(RESET)\n"
	@printf "$(CYAN)     __ |  __   __ | _  __   _$(RESET)\n"
	@printf "$(CYAN)    /  \| /  \ /   |/  / _\ | $(RESET)\n"
	@printf "$(CYAN)    \\__/| \\__/ \\__ |\\_ \\__  |   is  running$(RESET)\n\n"
	@printf "$(CYAN)    https://$(DOMAIN)$(RESET)\n"

down:
	@DC=""; \
	if docker info >/dev/null 2>&1; then DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then DC="sudo --preserve-env=DATA_PATH,USER,DOMAIN -n docker"; \
	else printf "$(RED)Docker non accessibile.$(RESET)\n"; exit 1; fi; \
	DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) down

restart:
	@DC=""; \
	if docker info >/dev/null 2>&1; then DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then DC="sudo --preserve-env=DATA_PATH,USER,DOMAIN -n docker"; \
	else printf "$(RED)Docker non accessibile.$(RESET)\n"; exit 1; fi; \
	if [ -z "$(c)" ]; then \
		DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) restart; \
	else \
		DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) restart $(c); \
	fi

logs:
	@DC=""; \
	if docker info >/dev/null 2>&1; then DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then DC="sudo --preserve-env=DATA_PATH,USER,DOMAIN -n docker"; \
	else printf "$(RED)Docker non accessibile.$(RESET)\n"; exit 1; fi; \
	DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) logs -f $(c)

clean: down
	@DC=""; \
	if docker info >/dev/null 2>&1; then DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then DC="sudo -n docker"; \
	else printf "$(RED)Docker non accessibile.$(RESET)\n"; exit 1; fi; \
	$$DC system prune -a -f

fclean:
	@DC=""; \
	if docker info >/dev/null 2>&1; then DC="docker"; \
	elif sudo -n docker info >/dev/null 2>&1; then DC="sudo --preserve-env=DATA_PATH,USER,DOMAIN -n docker"; \
	else printf "$(RED)Docker non accessibile.$(RESET)\n"; exit 1; fi; \
	DATA_PATH="$(DATA_PATH)" USER="$(USER)" DOMAIN="$(DOMAIN)" $$DC $(COMPOSE_ARGS) down -v --rmi all
	@sudo rm -rf $(DATA_PATH)

re: fclean all

backup:
	@sudo mkdir -p "$(BACKUP_PATH)"
	@STAMP=$$(date +%Y%m%d_%H%M%S); \
	DEST="$(BACKUP_PATH)/data_$$STAMP.tar.gz"; \
	printf "$(CYAN)Backup di $(DATA_PATH) -> $$DEST$(RESET)\n"; \
	sudo tar -czf "$$DEST" -C "$(DATA_PATH)" .; \
	printf "$(GREEN)Backup completato: $$DEST$(RESET)\n"