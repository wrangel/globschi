#!/bin/bash

# Run locally!

# --- defaults
DRY_RUN=false

# --- parse CLI
while getopts "n" opt; do
  case $opt in
    n) DRY_RUN=true ;;
    *) echo "Usage: $0 [-n] {keep-books|upload-media}"; exit 1 ;;
  esac
done
shift $((OPTIND-1))   # remove the flag(s) so $1 becomes the command

# --- helpers
keep_books() {
  echo "Keeping books..."
  node --env-file=.env ./src/management/keepBooks.mjs
}

upload_media() {
  echo "Uploading media..."
  NODE_DRY_RUN=$(( DRY_RUN ? 1 : 0 )) \
    node --env-file=.env ./src/management/uploader/orchestrate.mjs
}

# --- dispatch
case "$1" in
  keep-books) keep_books ;;
  upload-media) upload_media ;;
  *) echo "Usage: $0 [-n] {keep-books|upload-media}"; exit 1 ;;
esac