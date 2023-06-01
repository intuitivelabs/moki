# Extract text following double-# for targets, as their description for
# the `help` target.	Otherwise These simple-substitutions are resolved
# at reference-time (due to `=` and not `=:`).
_HLP_TGTS_RX	= '^[[:print:]]+:.*?\#\# .*$$'
_HLP_TGTS_CMD	= \
	grep -E ${_HLP_TGTS_RX} $(MAKEFILE_LIST)| sed -e 's,^\(Makefile\|.*.mk\):,,'
_HLP_TGTS_LEN	= $(shell ${_HLP_TGTS_CMD}| cut -d : -f 1| wc -L)
_HLPFMTC			= "\033[36m%-${_HLP_TGTS_LEN}s\033[0m %s\033[0m\n"
_HLPFMTH			= "\033[35m%-${_HLP_TGTS_LEN}s\033[0m \033[32m%s\033[0m\n"
_HLPFMT				= "%-${_HLP_TGTS_LEN}s %s\n"
_VAR_TGTS_RX	= "^\#|^--|_VAR|_HLP"
_VAR_TGTS_CMD	= \
	make -pn | grep -E -A1 '^\# makefile'| grep -E -v ${_VAR_TGTS_RX}| sort| uniq
_VAR_TGTS_LEN	= $(shell ${_VAR_TGTS_CMD} | cut -d = -f 1 | wc -L)

.PHONY:		help
help: ## Display this help screen
	@printf ${_HLPFMTH} "Target:" "Description:"
	@printf ${_HLPFMT} "--------------" "--------------------"
	@${_HLP_TGTS_CMD}| sort| awk 'BEGIN {FS = ":(.*)?## "}; {printf ${_HLPFMTC}, $$1, $$2}'

.PHONY: dump
dump: ## Dump custom makefile variables defaults values
	@printf ${_HLPFMTH} "Variable:" "Default value:"
	@printf ${_HLPFMT} "--------------" "--------------------"
	@${_VAR_TGTS_CMD} | awk 'BEGIN {FS = "(:)?= "}; {printf ${_HLPFMTC}, $$1, $$2}'
