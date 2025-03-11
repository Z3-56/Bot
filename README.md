# Educational Assistant Chatbot

A modern, multilingual AI-powered educational chatbot built with React, TypeScript, and Tailwind CSS. The chatbot provides real-time assistance for educational queries, supporting multiple languages and various input methods.

## Documentation

- [NLP Implementation](docs/NLP_IMPLEMENTATION.md): Detailed documentation of the Natural Language Processing system
- [Project Structure](#project-structure): Overview of the codebase organization
- [Installation](#installation): Setup and deployment instructions
- [Contributing](#contributing): Guidelines for contributors

- 🌐 Multilingual Support (English, Hindi, Marathi)
- 🎙️ Voice Input Capabilities
- 📸 Image Upload Support
- ⚡ Real-time Response
- 🎨 Modern, Animated UI
- 📱 Responsive Design
- 🔒 Type-safe Implementation

## Tech Stack

- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- Framer Motion 11.0.8
- i18next 23.10.0
- Lucide React 0.344.0
- Vite 5.4.2

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd educational-assistant-chatbot
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ChatHeader.tsx
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   └── LanguageSelector.tsx
├── contexts/           # React contexts
│   └── LanguageContext.tsx
├── hooks/              # Custom React hooks
│   ├── useChat.ts
│   └── useTranslation.ts
├── i18n/               # Internationalization
│   └── translations.ts
├── services/           # API and business logic
│   └── chatService.ts
├── types/              # TypeScript types
│   └── chat.ts
├── App.tsx            # Root component
└── main.tsx           # Entry point
```

## Component Architecture

### Core Components

1. **ChatHeader (`ChatHeader.tsx`)**
   - Displays title and language selector
   - Handles language switching
   - Shows chatbot status

2. **ChatInput (`ChatInput.tsx`)**
   - Text input field
   - Voice input button
   - Image upload button
   - Send message button
   - Loading state handling

3. **ChatMessage (`ChatMessage.tsx`)**
   - Displays individual messages
   - Supports user and assistant messages
   - Shows timestamps
   - Animated entrance

4. **LanguageSelector (`LanguageSelector.tsx`)**
   - Language dropdown
   - Supports multiple languages
   - Smooth transition animations

## State Management

The application uses React's Context API for global state management:

- `LanguageContext`: Manages current language selection
- `useChat` hook: Manages chat state and message handling

## Styling

The project uses Tailwind CSS with custom configurations:

- Gradient backgrounds
- Responsive design
- Custom animations
- Consistent color scheme

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Development Guidelines

### Code Style

- Follow TypeScript best practices
- Use functional components
- Implement proper error handling
- Write meaningful component props interfaces
- Use proper type annotations

### Component Guidelines

- Keep components focused and single-responsibility
- Implement proper prop validation
- Use custom hooks for complex logic
- Follow React best practices

### Styling Guidelines

- Use Tailwind utility classes
- Maintain consistent spacing
- Follow mobile-first approach
- Use semantic HTML elements

## Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Performance Optimization

- Lazy loading of components
- Proper memo usage
- Optimized asset loading
- Efficient state updates

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- React Team
- Tailwind CSS Team
- Framer Motion
- i18next

## Support

For support, email support@example.com or create an issue in the repository.