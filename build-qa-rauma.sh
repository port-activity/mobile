#!/bin/bash

if [[ $# -lt 6 ]] ; then
    echo "Usage: $0 <android keystore path> <ios dist cert path> <ios push id> <ios push p8 path> <ios prov profile path>"
    exit 1
fi

KEYSTORE_PATH=$1
DIST_P12_PATH=$2
PUSH_ID=$3
PUSH_P8_PATH=$4
PROV_PROFILE_PATH=$5

# Build Android
echo ">>> Building android qa-release for Rauma"
expo ba --config ./app.rauma.json --release-channel qa-rauma --type app-bundle --keystore-path $KEYSTORE_PATH

# Build iOS
echo ">>> Building iOS qa-release for Rauma"
expo bi --config ./app.rauma.json --release-channel qa-rauma --team-id $TEAM_ID --dist-p12-path $DIST_P12_PATH --push-id $PUSH_ID --push-p8-path $PUSH_P8_PATH --provisioning-profile-path $PROV_PROFILE_PATH

exit 0
