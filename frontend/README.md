# Face Recognition Dashboard - Frontend

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components
│   │   └── CriminalDatabase.js
│   ├── services/           # API services
│   │   └── api.js
│   ├── utils/              # Utility functions
│   ├── App.js              # Main application component
│   ├── index.js            # Application entry point
│   └── index.css           # Global styles
├── package.json
└── README.md
```

## Features

### 1. Criminal Registration
- Full Name, Age, Gender
- Crime committed
- Status (Active, Inactive, Wanted)
- Description
- Face image upload

### 2. Criminal Database
- Table view with all criminal records
- Search functionality
- Status filtering
- Image display
- Delete functionality
- Detailed view modal

### 3. Face Recognition
- Upload image for recognition
- Real-time face matching
- Confidence scoring

## API Endpoints

- `POST /api/register` - Register new criminal
- `GET /api/criminal-database` - Get all criminals
- `PUT /api/update/{name}` - Update criminal record
- `DELETE /api/delete/{name}` - Delete criminal
- `POST /api/recognize` - Recognize face
- `GET /api/image/{image_id}` - Get criminal image

## Installation

```bash
npm install
npm start
```

## Production Build

```bash
npm run build
```
