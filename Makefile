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


ENGINE	?= docker
REGISTRY	?= docker.frafos.net
VERSION		?= 5.3
IMG_BASE	?= ${REGISTRY}/debian/mon:${VERSION}
IMG_BUILD	?= ${REGISTRY}/debian/mon:${VERSION}
IMG_OUT		?= ${REGISTRY}/debian/mon-overlay:${VERSION}

.PHONY: pull-base pull-build overlay push
pull-base:
	@${ENGINE} pull ${IMG_BASE}

pull-build:
	@${ENGINE} pull ${IMG_BUILD}

overlay: dist Dockerfile.overlay
	tar -cf - $^ | ${ENGINE} build -f Dockerfile.overlay -t ${IMG_OUT} -

push:
	${ENGINE} push ${IMG_OUT}

DIR = `pwd`

dist:
	docker run \
      --rm -v ${DIR}:/app -w /app \
      ${IMG_BUILD} \
      bash -c "ls ; make install DESTDIR=/app/dist"
