#! /bin/bash

regctl_uri=https://github.com/regclient/regclient/releases/latest/download/regctl-linux-amd64
reg=docker.frafos.net

[[ ! $(which jq) ]] && apt -y install jq
[[ ! $(which regctl) ]] && \
    ( \
      set -e && \
      echo "dl regctl" && \
      sudo curl -L $regctl_uri -o /usr/sbin/regctl && \
      sudo chmod 755 /usr/sbin/regctl && \
      set +e \
    )

img=debian/mon-overlay
tags=$( \
        curl -s -S -k https://$reg/v2/$img/tags/list \
            | jq .tags \
            | jq -cr '.[]')
for t in $tags; do
    echo -n -e "processing $reg/$img:$t... \t"
    if [[ \
          "$t" == "5.3" || \
              "$t" == 5.3.* ]]; then
        echo "preserving"
    else
        echo -n "deleting ... "
        regctl tag rm $reg/$img:$t
        echo "deleted"
    fi
done
