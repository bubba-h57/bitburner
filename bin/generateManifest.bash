#!/usr/bin/env bash

cd ./build || exit

rm -f resources/manifest.txt
touch resources/manifest.txt

scripts=$(find . -type f -name "*.js" -not -name "*Bitburner.t*")

echo "$scripts" | while read -r line; do
  echo "$line" >> resources/manifest.txt
done

cd - || exit
