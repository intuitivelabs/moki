NAME	:= moki
SHELL := /bin/bash

include ./make_src/help.mk

.PHONY: install install_mon install_client install_server

install: install_server install_client ## Install moki
install_mon: install ## Install the ABC SBC Monitor
install_client: ## Install moki' client
	@ $(MAKE) install -C Moki/client
install_server: ## Install moki' server
	@ $(MAKE) install -C Moki/server
