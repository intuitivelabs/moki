# force the use of bash
SHELL := $(shell which bash)

# default docker image tag
_tag	:= 5.3
TAG		?= ${_tag}
# sanitized tag (5.3-#5919_certbot --> 5.3-5919_certbot)
STAG	= $(shell export tag=${TAG} && echo $${tag//[^a-zA-Z0-9-_.]/})
# sanitized, trailed tag (5.0 --> 5-0)
UTAG	= $(shell echo "${STAG}" | sed -e 's:\.:-:g')

.PHONY: get_tag
get_tag: ; @echo ${STAG} ## Return the sanitazed tag

.PHONY: get_utag
get_utag: ; @echo ${UTAG} ## Return the sanitazed tag
