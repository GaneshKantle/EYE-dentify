# Face Recognition Dashboard

A modern web application for face registration and recognition using FastAPI backend and React frontend with AI-powered face recognition capabilities.

## Features

- **Face Registration**: Upload and register new faces with names
- **Face Recognition**: Recognize faces from uploaded images
- **Face Management**: View, delete individual faces, or clear the entire database
- **Modern UI**: Responsive design with Tailwind CSS
- **Real-time Feedback**: Success/error messages and loading states
- **AI-Powered**: Uses FaceNet model for accurate face recognition

## Architecture

- **Backend**: FastAPI with MongoDB Atlas for data storage
- **Frontend**: React with Tailwind CSS for modern UI
- **AI Model**: FaceNet PyTorch for face embeddings and recognition
- **Database**: MongoDB with GridFS for image storage

## Prerequisites

- Python 3.12+
- Node.js 16+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Update MongoDB connection string in `main.py` (line 12) with your MongoDB Atlas credentials:
   ```python
   MONGO_URI = "your_mongodb_atlas_connection_string"
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## API Endpoints

### Backend API (`http://localhost:8000`)

- `POST /api/register` - Register a new face
- `POST /api/recognize` - Recognize a face from uploaded image
- `GET /api/faces` - Get list of all registered faces
- `GET /api/image/{image_id}` - Get face image by ID
- `DELETE /api/delete/{name}` - Delete a registered face
- `POST /api/clear` - Clear all registered faces

## Usage

1. **Register Faces**: 
   - Go to the "Register Face" tab
   - Enter a person's name
   - Upload a clear frontal photo
   - Click "Register Face"

2. **Recognize Faces**:
   - Go to the "Recognize Face" tab
   - Upload a photo containing a face
   - Click "Recognize Face"
   - View the recognition results

3. **Manage Faces**:
   - Go to the "Manage Faces" tab
   - View all registered faces
   - Delete individual faces or clear all

## Technical Details

### Face Recognition Process

1. **Face Detection**: Uses MTCNN to detect faces in images
2. **Feature Extraction**: FaceNet model extracts 512-dimensional embeddings
3. **Similarity Calculation**: Cosine similarity between embeddings
4. **Recognition**: Threshold-based matching (default: 50% confidence)

### File Structure

```
face-recognition-dashboard/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   └── docker-compose.yml  # Docker Compose setup
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── package.json        # Node.js dependencies
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── postcss.config.js   # PostCSS configuration
└── README.md               # This file
```

## Docker Support

You can also run the application using Docker:

1. **Backend with Docker**:
   ```bash
   cd backend
   docker-compose up
   ```

2. **Frontend with Docker** (create Dockerfile in frontend directory):
   ```bash
   cd frontend
   docker build -t face-recognition-frontend .
   docker run -p 3000:3000 face-recognition-frontend
   ```

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure you're using the correct Python version (3.12+)
2. **MongoDB connection issues**: Verify your MongoDB Atlas connection string
3. **CORS errors**: The backend is configured to allow requests from `http://localhost:3000`
4. **Face detection failures**: Ensure uploaded images contain clear, frontal faces

### Performance Tips

- Use high-quality, well-lit images for better recognition accuracy
- Ensure faces are clearly visible and not partially obscured
- For best results, use images with faces facing the camera directly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.
