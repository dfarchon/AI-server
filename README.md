# Sophon Server

Sophon Server is a backend application designed to securely handle AI interactions for the **Dark Forest** universe. It acts as a secure intermediary to process OpenAI API requests while maintaining data privacy and ensuring optimal performance.

## Features

- **Secure API Proxy**: Interacts with OpenAI securely via a hidden API key.
- **Dynamic Conversations**: Manages user conversations with AI using game-specific context.
- **Optimized Token Cost**: Implements strategies to minimize token usage while providing engaging responses.
- **Dark Forest Integration**: Built to support game-specific strategies, rules, and lore.

---

## Project Structure

```plaintext
sophon-server/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── routes/
│   │   ├── conversation.ts    # Routes for managing AI conversations
│   │   └── utils.ts           # Utility functions for token cost and validations
│   └── constants/
│       ├── aiChatGameConfig.ts # Game-specific configurations for AI
│       ├── aiBookText.ts       # Game lore and text constants
│       └── aiBotCharacter.ts   # Character-specific prompts
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Node.js dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

Getting Started
Prerequisites
Own OpenAI gpt PK Key
Node.js v22 or higher
TypeScript

 pnpm 
Installation

Clone the repository:
git clone https://github.com/your-username/sophon-server.git
cd sophon-server

Install dependencies:
pnpm install
Set up environment variables: Create a .env file in the root directory and configure it with the following:

Development Mode:
pnpm dev

Production Build:
pnpm build
pnpm start

Development
Scripts
pnpm dev: Starts the development server with live reload.
pnpm build: Compiles the TypeScript code into JavaScript.
pnpm start: Runs the production build.

Contributing
Contributions are welcome! Please follow the steps below:

Fork the repository.
Create a feature branch: git checkout -b feature-name.
Commit your changes: git commit -m "Add feature-name".
Push to the branch: git push origin feature-name.
Open a pull request.
License
This project is licensed under the MIT License.

Acknowledgements
OpenAI for the GPT-3.5 model.
Dark Forest Community for inspiring this project.
Node.js and TypeScript for enabling robust development.

### Key Features of the `README.md`:

1. **Overview**: A brief description of the project.
2. **Project Structure**: Explains the directory structure for easy navigation.
3. **Getting Started**: Step-by-step setup instructions.
4. **API Documentation**: Details the endpoints for integration.
5. **Development and Contribution**: Instructions for developers.
6. **Acknowledgements**: Gives credit where due.
