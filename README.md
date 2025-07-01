# DatNung Demo Project

## Overview

This is a Next.js application that demonstrates various AI capabilities using multiple language model providers. The project uses CopilotKit for UI components and integrates with several AI services.

## Prerequisites

- Node.js (recommended version: 18.x or higher)
- npm or yarn
- Access to various AI provider API keys

## Getting Started

1. Clone the repository
   ```bash
   git clone [repository-url]
   cd datnungdemo
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a .env.local file in the root directory with the following variables:
   ```
   # OpenAI
   OPENAI_API_KEY=your_openai_key_here
   
   # Google AI (Gemini)
   GOOGLE_API_KEY=your_google_api_key_here
   
   # Anthropic
   ANTHROPIC_API_KEY=your_anthropic_key_here
   
   # Groq (optional)
   GROQ_API_KEY=your_groq_key_here
   
   # AWS (if using Bedrock)
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   AWS_REGION=your_aws_region
   
   # LangSmith (optional for tracing)
   LANGSMITH_API_KEY=your_langsmith_key_here
   LANGSMITH_ENDPOINT=https://api.smith.langchain.com
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

The project is a Next.js application with the following structure:

```
datnungdemo/
├── .next/               # Next.js build output
├── app/                 # Application routes
├── components/          # React components
├── node_modules/        # Dependencies
├── public/              # Static assets
├── .env.local           # Environment variables (you need to create this)
├── next.config.js       # Next.js configuration
├── package.json         # Project dependencies and scripts
└── README.md            # This file
```

## AI Integrations

The application integrates with multiple AI providers:

- **OpenAI** - For chat completions and embeddings
- **Google AI/Gemini** - For generative language capabilities
- **Anthropic** - For Claude models
- **Groq** - For fast inference
- **AWS Bedrock** - For access to various foundation models
- **LangSmith** - For tracing and debugging language model interactions

## CopilotKit Integration

The application uses CopilotKit for UI components, which provides:

- Chat interface with message history
- System instructions configuration
- Image upload capabilities
- Custom styling options

## Development Workflow

1. Make changes to the code
2. Run the development server to see changes in real-time
3. Build the application for production when ready

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Extending the Project

### Adding New AI Providers

1. Install the required SDK
2. Add appropriate environment variables
3. Create a client instance using the API key
4. Implement the integration in your components or API routes

### Customizing the Chat Interface

The project uses CopilotKit React UI components that can be customized:
- Modify system instructions
- Add additional instructions
- Enable/disable image uploads
- Customize styling

### Adding New Features

1. Create new components in the components directory
2. Add new API routes in the api directory
3. Update the UI to include your new features

## Troubleshooting

- If you encounter authentication errors, ensure your API keys are correctly set in the .env.local file
- For Next.js related issues, refer to the [Next.js documentation](https://nextjs.org/docs)
- For CopilotKit issues, check the [CopilotKit documentation](https://docs.copilotkit.ai)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [CopilotKit Documentation](https://docs.copilotkit.ai)
- [LangChain Documentation](https://js.langchain.com/docs/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Google AI Documentation](https://ai.google.dev/docs)