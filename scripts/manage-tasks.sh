#!/bin/bash

# Run locally!

# Function to keep books
keep_books() {
    echo "Keeping books..."
    node ./src/backend/management/bookKeeper.mjs
}

# Function to upload media
upload_media() {
    echo "Uploading media..."
    node ./src/backend/management/mediaUploader.mjs
}

# Function to debug MongoDB
debug_mongo() {
    echo "Debugging MongoDB..."
    node ./src/backend/tests/mongoDebugger.mjs
}

# Function to test AWS login
test_aws() {
    echo "Testing AWS login..."
    node ./src/backend/tests/awsLoginTester.mjs
}

# Check the command-line argument and execute the corresponding function
case "$1" in
    keep-books)
        keep_books
        ;;
    collect-metadata)
        collect_metadata
        ;;
    upload-media)
        upload_media
        ;;
    debug-mongo)
        debug_mongo
        ;;
    test-aws)
        test_aws
        ;;
    *)
        echo "Usage: pnpm run manage {keep-books|collect-metadata|upload-media|debug-mongo|test-aws}"
        exit 1
        ;;
esac
