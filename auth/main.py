from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import dotenv
import os
from auth.utils import *
from auth.api import users, webapp

env_path = os.path.abspath(os.path.join(os.getenv("PYTHONPATH"), "..", ".env"))
dotenv.load_dotenv(dotenv_path=env_path)
app = FastAPI()


origins = ["http://localhost", "http://localhost:3000", "https://codecapture.web.app"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(webapp.router)


@app.get("/")
def root():
    return "AuthService API"


if __name__ == "__main__":
    uvicorn.run(app, port=5000, host="0.0.0.0")
