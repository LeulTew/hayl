#!/bin/bash
# Helper to set up Hayl secrets

echo "Hayl Secret Setup"
echo "================="

if ! command -v gh &> /dev/null; then
    echo "gh CLI could not be found. Please install it."
    exit 1
fi

read -p "Enter CONVEX_URL: " convex_url
if [ -n "$convex_url" ]; then
    gh secret set CONVEX_URL -b "$convex_url"
fi

read -p "Enter CONVEX_KEY: " convex_key
if [ -n "$convex_key" ]; then
    gh secret set CONVEX_KEY -b "$convex_key"
fi

read -p "Enter CLOUDFLARE_API_TOKEN: " cf_token
if [ -n "$cf_token" ]; then
    gh secret set CLOUDFLARE_API_TOKEN -b "$cf_token"
fi

read -p "Enter TELEBIRR_SECRET (random string for now): " telebirr
if [ -n "$telebirr" ]; then
    gh secret set TELEBIRR_SECRET -b "$telebirr"
fi

echo "Secrets updated!"
