#!/bin/bash
cd /home/kavia/workspace/code-generation/chess-master-ai-a8358f5c/chess_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

