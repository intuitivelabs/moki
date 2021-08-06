#!/usr/bin/sh

# go to a temp directory we checked out the git repository
# set as WORKDIR

#DIR=Moki/client
REP=$branch_name
# name of the production build
NAME=moki-client
SPEC=${NAME}.spec
# name of the dev build
NAME_DEV=moki-client-dev
SPEC_DEV=${NAME_DEV}.spec
# architecture - static for now
RPMARCH=x86_64
RPM_SRC_DIR="/var/lib/jenkins/rpmbuild/RPMS/x86_64"
# repository type - dev for this automatic build
RPM_VERSION=`cat $SPEC|grep -e "^Version:"|awk '{print $2}'`
# repo location
if [[ "$branch" == "master" ]] ; then 
	RPM_LOCAL_REPO_DIR="$HOME/repointernal/rpm/dev/$RPMARCH"
	RPM_REMOTE_REPO_URL="s3://repointernal/rpm/dev/$RPMARCH"
else
	RPM_LOCAL_REPO_DIR="$HOME/repointernal/rpm/branch/$branch/$RPMARCH"
	RPM_REMOTE_REPO_URL="s3://repointernal/rpm/branch/$branch/$RPMARCH"
fi

sed -i "s/Release:.*/Release:\t$BUILD_NUMBER/" $SPEC

# vendorize the package.json
# use il package.json
ln -sf package-intuitive.json package.json

#cd $DIR

#FIXES
rm -rf node_modules
#sed -i 's/"homepage.*/"homepage": ".",/g' package.json

# clean package-lock.json
rm -f package-lock.json

# build the dev package
make TYPE=dev clean
make TYPE=dev rpm

# build the production package
make clean
make rpm

### upload rpms

mkdir -p $RPM_LOCAL_REPO_DIR

if test -f $RPM_SRC_DIR/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_LOCAL_REPO_DIR
fi

rm ~/rpmbuild/SOURCES/${NAME_DEV}-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz

if test -f $RPM_SRC_DIR/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm ; then
  mv $RPM_SRC_DIR/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.x86_64.rpm $RPM_LOCAL_REPO_DIR
fi

rm ~/rpmbuild/SOURCES/${NAME}-${RPM_VERSION}-${BUILD_NUMBER}.tar.gz

#=========RPM upload==========

# updating repodata

cd $RPM_LOCAL_REPO_DIR

createrepo ./

# sync to S3
aws s3 sync --delete $RPM_LOCAL_REPO_DIR $RPM_REMOTE_REPO_URL

echo $?
