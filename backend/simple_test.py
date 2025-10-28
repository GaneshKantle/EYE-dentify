from fastapi import FastAPI
import uvicorn

app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}

if __name__ == "__main__":
    print("Starting simple test server on port 8001...")
    uvicorn.run(app, host="127.0.0.1", port=8001)
