
# Sophon AI Server
The Sophon AI Server is a backend application designed to enhance the Dark Forest universe by integrating AI-driven interactions. It provides endpoints for engaging with Sophon, the AI assistant, to improve the gaming experience through strategic advice, answering questions, and executing game functions.

# Features
**AI Chat Interface:** 
Interact with Sophon to discuss strategies, lore, and game mechanics.

**Agent Command Execution:**
Send commands to the AI agent to execute game-related functions.

# Prerequisites
Node.js: Ensure Node.js is installed on your system.
OpenAI API Key: Obtain an API key from OpenAI and set it as an environment variable.

# Installation
Clone the Repository

git clone https://github.com/dfarchon/AI-server.git 

cd AI-server 

pnpm install


Set Environment Variables -> Create a .env file in the root directory and include init values

Start the Server ->

pnpm dev

The server will run on http://localhost:8080.

# API Endpoints:
**POST /api/conversation/start**

Description: Starts a new conversation with the AI assistant.

Request Payload:
json
{
  "username": "playerName",
  "message": "Hello!"
}

**POST /api/conversation/step**

Description: Sends a step message to the AI assistant and receives a response.

Request Payload:
json
{
  "username": "playerName",
  "message": "Your question or input here"
}

**POST /api/agent**

Description: Sends a command to the AI agent for execution.

Request Payload:
json
{
  "username": "playerName",
  "message": "Move from locationId to locationId with xyz forces and xzy silver"
}

# Usage:
Send HTTP POST requests to the appropriate endpoints using tools like curl, Postman, or a frontend application.
Example Request Using curl:

curl -X POST http://localhost:8080/api/conversation/start \
-H "Content-Type: application/json" \
-d '{ "username": "playerName", "message": "Hello!" }'

# To contribute:
Contributions are welcome! 
Fork the repository.
Create a feature branch.
Submit a pull request with your changes.

# License
This project is licensed under the MIT License and created by 9STX6.

# Acknowledgments
Special thanks to the Dark Forest community for their support and collaboration.
