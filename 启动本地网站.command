#!/bin/zsh

set -e
cd "$(dirname "$0")"

if [[ ! -d node_modules ]]; then
  npm install
fi

(sleep 1 && open "http://127.0.0.1:5173/") &
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
