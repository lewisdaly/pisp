#!/usr/bin/env bash

##
# Force push to `gh-pages` branch to deploy documentation
##

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
set -eux

npm run docs:build

cd ${DIR}/../docs/.vuepress/dist

git init
git add -A
git commit -m 'feat(docs): deploy docs updates'

git push -f git@github.com:mojaloop/pisp.git master:gh-pages
