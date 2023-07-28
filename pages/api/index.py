from fastapi import FastAPI
from pydantic import BaseModel
from underthesea import word_tokenize

app = FastAPI()


class Payload(BaseModel):
    text: str


@app.post("/api/tok")
def tokenize(req: Payload):
    tokens = word_tokenize(req.text)
    return {"tokens": tokens}
