ENV_FILE := $(CURDIR)/.env
TEMPLATE := ./docker/alertmanager.template.yaml
OUTPUT   := ./docker/alertmanager.yaml

config:
	@echo "PWD is $(shell pwd)"
	( \
	set -o allexport; \
	. $(ENV_FILE); \
	set +o allexport; \
	envsubst < $(TEMPLATE) > $(OUTPUT); \
	)
