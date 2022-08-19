import socket
from contextlib import closing
import os
import jwt
import dotenv
import datetime
import auth.core.schemas as schemas

env_path = os.path.abspath(os.path.join(os.getenv('PYTHONPATH'), '..', '.env'))
dotenv.load_dotenv(dotenv_path=env_path)


def find_free_port():
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]


def gen_access_token(auth_user: schemas.UserCreate):
    payload = {
        "user": auth_user.username,
        "email": auth_user.email,
        "is_student": auth_user.is_student,
        # Keep logged in for 5 mins before refresh
        "exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=300)
    }
    return jwt.encode(payload, key=os.environ['SECRET_TOKEN'])
