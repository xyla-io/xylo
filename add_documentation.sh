#!/bin/bash

set -e

read -p 'Please enter the product to document > ' DIRECTORY
read -p 'Please enter the submodule to document > ' SUBMODULE
read -p 'Please enter the branch within that submodule to document > ' BRANCH
read -p 'Please enter the directory path within that branch to document > ' CONTENTPATH

echo "${DIRECTORY} ${SUBMODULE} ${BRANCH} ${CONTENTPATH}" >> config/document_config.txt
echo "Added documentation directory ${CONTENTPATH} on ${BRANCH} of ${SUBMODULE} to configuration"
echo "Once depoloyed, the documentation will be available at HOST/docs/products/${DIRECTORY}"
