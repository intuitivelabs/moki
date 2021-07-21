#!/usr/bin/bash

DIR=`mktemp -d`

for i in build/static/js/*.js; do
    npx terser $i --source-map "content='${i}.map'" -c drop_console=true -o ${DIR}/`basename $i` ;
done

if [[ ! -d build/static/js_orig ]]; then
    mkdir build/static/js_orig
fi
rm -rf build/static/js_orig/*;
cp -a build/static/js/* build/static/js_orig/;
cp -a ${DIR}/* build/static/js;

rm ${DIR}/*
rmdir ${DIR}
