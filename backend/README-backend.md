# Backend Service

## Local Development
- Copy `backend/env.example` to `backend/.env` and replace the placeholders with valid credentials.
- Install dependencies with `pip install -r backend/requirements.txt`.
- Run the API locally with `uvicorn main:app --host 0.0.0.0 --port 8000`.

## Required Environment Variables
The following variables must be configured before starting the server (see `backend/env.example` for details):
- `MONGO_URI`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SECRET_KEY`, `REGISTRATION_SECRET_KEY`, `JWT_SECRET_KEY`
- Optional: `ALLOWED_ORIGINS`, `RESEND_*`, `MODEL_AUTO_LOAD`

## Render Deployment Checklist
1. **Environment**
   - Create a Render Web Service (512 MiB works after the recent optimisations).
   - Set the environment variables above in the Render dashboard. Copy/paste values without quotes or extra spaces.
   - Ensure `$PORT` is provided by Render (no need to set manually).
2. **Build & Start Commands**
   - Build: `pip install -r backend/requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Model Loading Behaviour**
   - Models run on CPU-only PyTorch wheels; no GPU/CUDA dependencies are installed.
   - `MODEL_AUTO_LOAD=true` (default) loads FaceNet on startup. Set to `false` if you prefer lazy loading on first request.
4. **Troubleshooting**
   - Out-of-memory errors usually mean missing CPU-only wheels or large concurrent requests. Verify the requirements file is up to date.
   - `python-dotenv` parsing errors indicate malformed `.env` entries. Follow the format in `backend/env.example`.

## Security Notes
- Never commit real secrets. Rotate any keys that were previously exposed.
- Restrict CORS via `ALLOWED_ORIGINS` when deploying to production.
