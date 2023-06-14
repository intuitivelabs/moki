NAME			= moki-client

RELEASE		= dev

PORT	= 3000
CMD	=
IMG_NAME	= $(URL)/$(NAME):$(RELEASE)
VOLUMES = -v `pwd`:/app
D_FILE	= Dockerfile

.PHONY: $(NAME)
## moki-react-express-app: Default target, run build
$(NAME): build

.PHONY: build
## build: Build the nodejs docker image (default target)
build:
	@echo " -- Building $(NAME) docker image (target: $(BUILD_TARGET)) ..."
	@docker build --rm -t $(NAME) --target=$(BUILD_TARGET) --file=$(D_FILE) .
	@echo " -- Building $(NAME) docker image: done"

.PHONY: build-prod
## build-prod: Build a production readu nodejs docker image
build-prod:
	@echo " -- Building $(NAME) prod docker image ..."
	@ $(MAKE) build -e BUILD_TARGET=prod
	@echo " -- Building $(NAME) prod docker image: done"

.PHONY: run
## run: Run the nodejs server from the docker image
run:
	@echo " -- Running $(NAME) docker image ..."
	@docker run	--rm -it \
			--user "$(id -u):$(id -g)" \
			$(VOLUMES) \
			-p $(PORT):$(PORT) \
			--net=host \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

.PHONY: exec
## exec: Run a custom command inside a running the docker container
exec:
	@echo " -- Runnin $(CMD) in $(NAME) ..."
	@ docker exec -it $(NAME) $(CMD)
	@echo " -- Runnin $(CMD) in $(NAME): done"

.PHONY: stop
## stop: Stop the docker image
stop:
	@echo " -- Stopping $(NAME) docker image ..."
	@docker stop -t 0 $(NAME) 2> /dev/null ; true
	@echo " -- Stopping $(NAME) docker image: done"

#
# instsall debian:1*
#

# include makefile targets
MAKE_PATH	= ../../make_src
# npm-proxy
SKIP_NODE_TARGET := 0 ## TODO: don't skip, use npm ci, pkg lock needed
include $(MAKE_PATH)/npm.mk
include $(MAKE_PATH)/help.mk

t_install	= install_client
ifeq ($(DEV_INSTALL),1)
t_install	= install_client_dev
endif

# client_lock	= ${client_dir}/package-lock.json

client_deps := # ${client_lock}
ifeq ($(DEV_INSTALL),1)
client_deps += dump_debug_flag
endif

install: ${t_install}

install_client: # ${client_lock}
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy ; fi
	echo "installing production client"
	npm i
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy-off ; fi
	INLINE_RUNTIME_CHUNK=false \
		CI=false \
		GENERATE_SOURCEMAP=false \
		NODE_ENV=production npm run build && npm prune --production
	install -d $(DESTDIR)/usr/share/Moki
	cp -r build $(DESTDIR)/usr/share/Moki
	cp -r build-diagram $(DESTDIR)/usr/share/Moki

dump_debug_flag: ## debug flag to trigger nginx template
	install -d $(DESTDIR)/etc/abc-monitor
	touch $(DESTDIR)/etc/abc-monitor/debug.flag

install_client_dev: dump_debug_flag  # ${client_lock}
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy ; fi
	echo "installing dev client"
	npm i
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy-off ; fi
	# moki react app
	install -d $(DESTDIR)/usr/share/Moki/client
	cp -r package*.json $(DESTDIR)/usr/share/Moki/client
	cp -r public $(DESTDIR)/usr/share/Moki/client
	cp -r src $(DESTDIR)/usr/share/Moki/client
	cp -r node_modules $(DESTDIR)/usr/share/Moki/client
	# moki dev service
	install -d $(DESTDIR)/usr/lib/systemd/system
	install -m 0644 moki-client.service $(DESTDIR)/usr/lib/systemd/system/
	# fix absolute paths that npm leaves there due to npm feature/bug
	find $(DESTDIR)/usr/share/Moki -name "package.json" -exec sed -i 's#$(DESTDIR)##' '{}' \;
