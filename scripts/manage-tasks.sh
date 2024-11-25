#!/bin/bash

# Function to keep books
keep_books() {
    echo "Keeping books..."
    node ./src/backend/management/bookKeeper.mjs
}

# Function to collect metadata
collect_metadata() {
    echo "Collecting metadata..."
    node ./src/backend/management/metadataCollector.mjs
}

# Function to upload media
upload_media() {
    echo "Uploading media..."
    node ./src/backend/management/mediaUploader.mjs
}

# Function to add a new field in MongoDB
add_field() {
    echo "Adding new field in MongoDB..."
    node ./src/backend/management/newFieldAdder.mjs
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
    add-field)
        add_field
        ;;
    debug-mongo)
        debug_mongo
        ;;
    test-aws)
        test_aws
        ;;
    *)
        echo "Usage: pnpm run manage {keep-books|collect-metadata|upload-media|add-field|debug-mongo|test-aws}"
        exit 1
        ;;
esac
