#!/bin/bash

if [[ $# -lt 6 ]] ; then
    echo "Usage: $0 <android keystore path> <android keystore alias> <ios dist cert path> <ios push id> <ios push p8 path> <ios prov profile path>"
    exit 1
fi

KEYSTORE_PATH=$1
KEYSTORE_ALIAS=$2
DIST_P12_PATH=$3
PUSH_ID=$4
PUSH_P8_PATH=$5
PROV_PROFILE_PATH=$6

# Build Android
echo ">>> Building android qa-release for Gävle"
expo ba --config ./app.gavle.json --release-channel qa-gavle --type app-bundle --keystore-path $KEYSTORE_PATH --keystore-alias $KEYSTORE_ALIAS

# Build iOS
echo ">>> Building iOS qa-release for Gävle"
expo bi --type archive --config ./app.gavle.json --release-channel qa-gavle --team-id N335UMVM8A --dist-p12-path $DIST_P12_PATH --push-id $PUSH_ID --push-p8-path $PUSH_P8_PATH --provisioning-profile-path $PROV_PROFILE_PATH --skip-credentials-check

exit 0
