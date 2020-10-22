#!/bin/bash

set -e
set -x

rm -rf build/documentation
mkdir -p build/documentation

node_modules/.bin/jsdoc -c jsdoc.conf.json

cp -R documentation/products build/documentation/
rm -rf dist/docs
cp -R build/documentation dist/docs
