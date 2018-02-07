#!/usr/bin/env bash
export SPADE_ADDRESS=$(ping spade -c 1 | grep "172\." | awk -F "(" 'NR==1{print $2}' | awk -F ")" '{print $1}')

echo "SPADE_ADDRESS: $SPADE_ADDRESS"
DEBUG=cameraCaptureWeb:* npm start
