import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from agent_local import process_query_simple  # pakai versi simple

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # bisa dibatasi ke domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/query")
async def query_api(request: Request):
    body = await request.json()
    query = body.get("query", "")
    response_text = await process_query_simple(query)
    try:
        return json.loads(response_text)
    except Exception:
        return {"response": response_text}
