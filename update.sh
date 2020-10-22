#!/bin/bash

REMOTE=REMOTE

set -e

while getopts 'pv' flag; do
  case "${flag}" in
    p) PULL='true' ;;
    v) VERBOSE='true' ;;
    *) echo "Usage: ./update.sh [-pv]"
       exit 1 ;;
  esac
done

if [ -n "${VERBOSE+set}" ]; then
  set -x
fi

echo "The Xyla update script is currently disabled pending standardization of the deployable protocol."
exit 0

while read DIRECTORY SUBMODULE BRANCH CONTENTPATH; do
  rm -rf "documentation/products/${DIRECTORY}"
  cd "environment/submodules/${SUBMODULE}"
  git checkout "${BRANCH}"
  if [ -n "${PULL+set}" ]; then
    git pull
  fi
  ./document.sh
  cd ../../..
  cp -R "environment/submodules/${SUBMODULE}/${CONTENTPATH}" "documentation/products/${DIRECTORY}"
done < config/document_config.txt

if [ -n "$(git status --porcelain)" ]; then
  git add documentation/products
  git commit -m "update.sh: Updated documentation. pulled: ${PULL:-false}"
  git push "${REMOTE}" HEAD:master
fi
