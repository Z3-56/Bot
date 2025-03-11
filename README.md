# Educational Assistant Chatbot

A modern, multilingual AI-powered educational chatbot with Python backend API server and React frontend. The system provides real-time assistance for educational queries, supporting multiple languages and various input methods.

## Features

- 🌐 Multilingual Support (English, Hindi, Marathi)
- 🎙️ Voice Input Capabilities
- 📸 Image Upload Support
- ⚡ Real-time Response
- 🎨 Modern, Animated UI
- 📱 Responsive Design
- 🔒 Type-safe Implementation
- 🔍 Google Search Integration
- 🤖 NLP Processing

## Tech Stack

### Frontend
- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- Framer Motion 11.0.8
- i18next 23.10.0
- Lucide React 0.344.0
- Vite 5.4.2

### Backend
- Python 3.8+
- FastAPI
- PostgreSQL
- Redis
- Google Custom Search API

## Prerequisites

- Node.js (v18 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Redis
- npm (v9 or higher)

## Installation

### 1. Clone the repository:
```bash
git clone https://github.com/Z3-56/Bot.git
cd Bot
```

### 2. Backend Setup

#### a. Create and activate Python virtual environment:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

#### b. Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### c. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your configuration
```

#### d. Initialize the database:
```bash
# Make sure PostgreSQL is running
python api_server.py init_db
```

#### e. Start the API server:
```bash
python api_server.py
# Server will start at http://localhost:8000
```

### 3. Frontend Setup

#### a. Install Node.js dependencies:
```bash
npm install
```

#### b. Start the development server:
```bash
npm run dev
# Frontend will be available at http://localhost:3000
```

## API Server Configuration

The `api_server.py` provides the following endpoints:

```python
# Main endpoints
POST /api/chat            # Process chat messages
POST /api/voice          # Handle voice input
POST /api/image          # Process image uploads
GET  /api/search        # Perform Google search

# Admin endpoints
GET  /api/health        # Check server health
GET  /api/metrics       # Get performance metrics
```

### Environment Variables for API Server

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Google API
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_google_cse_id_here

# Server Config
API_PORT=8000
API_HOST=0.0.0.0
DEBUG=True

# Security
API_SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here
```

### API Server Features

- Rate limiting
- JWT authentication
- Request validation
- Error handling
- Performance monitoring
- Caching with Redis
- Database connection pooling

## Documentation

- [NLP Implementation](docs/NLP_IMPLEMENTATION.md): Detailed documentation of the Natural Language Processing system
- [Project Structure](#project-structure): Overview of the codebase organization
- [Installation](#installation): Setup and deployment instructions
- [Contributing](#contributing): Guidelines for contributors

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