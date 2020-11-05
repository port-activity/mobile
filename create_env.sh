#!/bin/bash

if [[ $# -eq 0 ]] ; then
    echo "Usage: $0 <SENTRY_DSN> <TRANSLATIONS_API_KEY>"
fi

cat > .env << EOL
LOCALHOST=
LOCALPORT=
SENTRY_DSN=$1
TRANSLATIONS_API_KEY=$2
EOL
