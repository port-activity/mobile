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
echo ">>> Building android production-release for Rauma"
expo ba --config ./app.rauma.json --release-channel prod-rauma --type app-bundle --keystore-path $KEYSTORE_PATH --keystore-alias $KEYSTORE_ALIAS

# Build iOS
echo ">>> Building iOS production-release for Rauma"
expo bi --config ./app.rauma.json --release-channel prod-rauma --team-id $TEAM_ID --dist-p12-path $DIST_P12_PATH --push-id $PUSH_ID --push-p8-path $PUSH_P8_PATH --provisioning-profile-path $PROV_PROFILE_PATH

exit 0
