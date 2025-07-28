# Research Assistant

A full-stack AI-powered research assistant with Chrome extension frontend and Spring Boot backend.

## Project Structure

```
research-assistance-ext/
├── extension/              # Chrome Extension (Frontend)
│   ├── background.js       # Extension background script
│   ├── manifest.json       # Extension manifest
│   ├── sidepanel.html      # Side panel UI
│   ├── sidepanel.css       # Side panel styles
│   ├── sidepanel.js        # Side panel functionality
│   └── icons/             # Extension icons
│       └── research-assistance.png
├── backend/               # Spring Boot API (Backend)
│   └── (Your Spring Boot project files will go here)
└── README.md             # This file
```

## Setup Instructions

### Chrome Extension Setup
1. Navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `extension/` folder
5. The extension should now appear in your toolbar

### Backend Setup
1. Place your Spring Boot project files in the `backend/` folder
2. Configure the API to run on `http://localhost:8050`
3. Ensure the `/api/research/process` endpoint is available
4. Start the Spring Boot application

## API Endpoint

The extension expects a POST endpoint at:
```
POST http://localhost:8050/api/research/process
Content-Type: application/json

{
  "content": "text to process",
  "operationType": "EXPLAIN"
}
```

## Features

- **Text Summarization**: Select text on any webpage and get AI-powered summaries
- **Research Notes**: Save and manage research notes with local storage
- **Fallback Processing**: If no text is selected, processes saved research notes
- **Custom Icon**: Uses your custom research-assistance.png icon

## Development

- Frontend: Chrome Extension (HTML, CSS, JavaScript)
- Backend: Spring Boot (Java)
- Communication: REST API calls from extension to backend
