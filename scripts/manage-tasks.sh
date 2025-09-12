#!/bin/bash

# Run locally!

# Function to keep books
keep_books() {
    echo "Keeping books..."
    node --env-file=.env ./src/management/keepBooks.mjs
}

# Function to upload media
upload_media() {
    echo "Uploading media..."
    node --env-file=.env ./src/management/uploader/orchestrate.mjs
}

# Check the command-line argument and execute the corresponding function
case "$1" in
    keep-books)
        keep_books
        ;;
    upload-media)
        upload_media
        ;;
    *)
        echo "Usage: pnpm run manage {keep-books|upload-media}"
        exit 1
        ;;
esac
