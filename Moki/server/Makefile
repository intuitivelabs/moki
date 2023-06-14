NAME	= moki-server

# docker build target
BUILD_TARGET	=	dev
# docker runtime shared volumes
VOLUMES = -v `pwd`/:/app/

# docker run/exec command
CMD	=

PORT	= 5000

.PHONY: $(NAME)
## moki-express: Default target, run build
$(NAME): build

.PHONY: build
## build: Build the nodejs docker image (default target)
build:
	@echo " -- Building $(NAME) docker image (target: $(BUILD_TARGET)) ..."
	@docker build -t $(NAME) --target=$(BUILD_TARGET) .
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
			--env-file .dockerenv \
			-p $(PORT):$(PORT) \
			--net=host \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

.PHONY: run-prod
## run-prod: Run the nodejs prod server from the docker image
run-prod: build-prod
	@echo " -- Running $(NAME) docker image ..."
	@docker run	--rm -it \
			--env-file .dockerenv \
			-p $(PORT):$(PORT) \
			--name $(NAME) \
			$(NAME) $(CMD)
	@echo " -- Running $(NAME) docker image: done"

# .PHONY: test
# ## test: Run the mocha unit test
# test:
#		@echo " -- Testing $(NAME) ..."
#		@ $(MAKE) run -e CMD="npm run test"
#		@echo " -- Testing $(NAME): done"

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

.PHONY: lint
## lint: Run the linter
lint:
	$(MAKE) run -e CMD="npm run lint"
	$(MAKE) run -e CMD="npm run pretty"

.PHONY: all
all: build run ## all: Build then run the dockerized nodejs

.PHONY: elastic
elastic: ## elastic: Start the elastic container
	docker run --rm --name $(NAME)-es \
		 -p 9200:9200 -p 9300:9300 \
		--net=host \
		-e "discovery.type=single-node" \
docker.elastic.co/elasticsearch/elasticsearch:7.7.1

.PHONY: stop-elastic
## stop-elastic: Stop the elastic container
stop-elastic:
	$(MAKE) stop -e NAME="$(NAME)-es"

#
# instsall debian:1*
#

# include makefile targets
MAKE_PATH	= ../../make_src
# npm-proxy
SKIP_NODE_TARGET := 0
include $(MAKE_PATH)/npm.mk
include $(MAKE_PATH)/help.mk

# TODO: only production ATM, need to support dev (or not ?)

server_js: # ${server_lock} ## smth
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy ; fi
	npm i
	NODE_ENV=production npm run build && npm prune --production
	install -d $(DESTDIR)/usr/share/Moki/server
	cp -rf package*.json $(DESTDIR)/usr/share/Moki/server
	cp -rf node_modules $(DESTDIR)/usr/share/Moki/server
	cp -r dist ${DESTDIR}/usr/share/Moki/server/

install: server_js
	install -d $(DESTDIR)/usr/lib/systemd/system
	install -m 0644 moki-server.service $(DESTDIR)/usr/lib/systemd/system/
	find $(DESTDIR)/usr/share/Moki -name "package.json" -exec sed -i 's#$(DESTDIR)##' '{}' \;
	$(MAKE) -C ../../external/decap install
