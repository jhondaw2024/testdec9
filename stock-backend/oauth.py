from fastapi import Depends, HTTPException, status
from jwttoken import verify_token
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # Ensure verify_token returns the token data
    current_user = verify_token(token, credentials_exception)
    if current_user is None:
        raise credentials_exception
    return current_user
