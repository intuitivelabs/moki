NODE_MODULE_DIR		?= ./
NODE_MODULE_NAME	= node_modules
NODE_MODULES			= ${NODE_MODULE_DIR}${NODE_MODULE_NAME}

# Set to 1 to enable proxy
NPM_PROXY	?= 0

# Set to anything to skip the node_module creation
#SKIP_NODE_TARGET

NPM_PROXY_PORT	?= 8080
NPM_PROXY_IP	?= 172.22.1.39
NPM_PROXY_IP_PORT	?= ${NPM_PROXY_IP}:${NPM_PROXY_PORT}
.PHONY: npm-proxy
npm-proxy: ## Enable the npm-proxy server access
	@echo " [?] setting npm cache proxy: ..."
	npm config set proxy http://${NPM_PROXY_IP_PORT}/
	npm config set https-proxy http://${NPM_PROXY_IP_PORT}/
	npm config set strict-ssl false
	@echo " [!] setting npm cache proxy: done"

.PHONY: npm-proxy-off
npm-proxy-off: ## Disable the npm-proxy server access
	@echo " [?] disabling npm cache proxy: ..."
	npm config delete proxy
	npm config delete https-proxy
	npm config set strict-ssl true
	@echo " [!] disabling npm cache proxy: done"

ifndef SKIP_NODE_TARGET
modules: ${NODE_MODULES} ## Download node modules
${NODE_MODULES}: ${NODE_MODULE_DIR}package.json
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy ; fi
	@echo "syncing node modules ..."
	cd ${NODE_MODULE_DIR} && npm ci
	@echo "node modules synced"
	if test "${NPM_PROXY}" = "1"; then ${MAKE} npm-proxy-off ; fi
endif
