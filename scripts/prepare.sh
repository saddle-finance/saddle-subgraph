#!/bin/bash
if [ -f "config/$NETWORK.json" ];
then
    ./node_modules/.bin/mustache config/$NETWORK.json subgraph.template.yaml > subgraph.yaml
    echo "SUCCESS: '$NETWORK' network subgraph.yaml created"
else
    echo "ERROR: 'config/$NETWORK.json' not found"
    exit 1
fi;