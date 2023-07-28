from fastapi import FastAPI
from pydantic import BaseModel
from underthesea import word_tokenize
from flask import Flask, request

app = Flask(__name__)

@app.route('/tok', methods=['POST'])
def tokenize():
    request_data = request.get_json()
    tokens = word_tokenize(request_data["text"])
    return {"tokens": tokens}

if __name__ == '__main__':
    app.run(port=5328)



# app = FastAPI()


# class Payload(BaseModel):
#     text: str


# @app.post("/tok")
# def tokenize(req: Payload):
#     tokens = word_tokenize(req.text)
#     return {"tokens": tokens}
