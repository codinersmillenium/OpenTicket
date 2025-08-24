from fastapi import FastAPI, Request
from utils import sign_ticket, verify_ticket_signature
import uvicorn

app = FastAPI()

@app.get("/")
async def on_connect():
    return {"status": "connect"}

@app.post("/pay")
async def pay(request: Request):
    data = await request.json()
    return {"status": "paid", "amount": data.get("amount")}

@app.post("/ticket")
async def create_ticket(request: Request):
    data = await request.json()
    ticket_id = data.get("ticket_id")
    signed = sign_ticket(str(ticket_id))
    return {"ticket_id": ticket_id, "tte": signed}

@app.post("/verify")
async def verify(request: Request):
    data = await request.json()
    return {"valid": verify_ticket_signature(data.get("ticket_id"), data.get("tte"))}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
