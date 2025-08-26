import json
import base64
import hashlib
import os
from datetime import datetime, timezone
from uagents import Agent, Context, Protocol, Model
from ic.client import Client
from ic.canister import Canister
from dotenv import load_dotenv

load_dotenv()
CANISTER_ID = os.getenv("CANISTER_ID")
IC_URL = os.getenv("IC_URL", "http://localhost:4349")

with open("../declarations/ticket/ticket.did", "r") as f:
    did = f.read()
canister = Canister(IC_URL, CANISTER_ID, did)

# ====================================================
# Dummy private key
# ====================================================
PRIVATE_KEY = "EcyezEVmi4A7Osyq1qFyNQNOFMkjSe8j"

def simple_sign(file_b64: str) -> str:
    return hashlib.sha256((file_b64 + PRIVATE_KEY).encode()).hexdigest()

def simple_verify(file_b64: str, signature: str) -> bool:
    expected = hashlib.sha256((file_b64 + PRIVATE_KEY).encode()).hexdigest()
    return expected == signature


async def process_query_simple(query: str) -> str:
    if query.startswith("pay::"):
        ticket_id = query.split("::", 1)[1]
        ticket = await canister.checkTicketByCode(ticket_id)
        if ticket.code:
            ticket_data = {
                "ticket_id": ticket.code,
                "date": ticket.createdAt,
                "issued_at": datetime.now(timezone.utc).isoformat()
            }

            ticket_json = json.dumps(ticket_data)
            ticket_b64 = base64.b64encode(ticket_json.encode()).decode()
            signature = simple_sign(ticket_b64)

            return json.dumps({
                "status": "success",
                "ticket_id": ticket_id,
                "ticket_base64": ticket_b64,
                "signature": signature
            })
        else:
            return json.dumps({"status": "error", "message": "Not found"})

    elif query.startswith("verify::"):
        try:
            _, file_b64, signature = query.split("::", 2)
            is_valid = simple_verify(file_b64, signature)
            return json.dumps({
                "action": "verify",
                "status": "success",
                "verified": is_valid
            })
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    else:
        return json.dumps({"status": "error", "message": "Format salah. Gunakan pay::<id> atau verify::<b64>::<sign>"})


agent = Agent(
    name="openticket-agent",
    port=8005,
    endpoint=["http://127.0.0.1:8005/submit"],
    mailbox=True
)

ticket_proto = Protocol(name="TicketProtocol", version="0.1.0")

class QueryMessage(Model):
    text: str

class ResponseMessage(Model):
    text: str

@ticket_proto.on_message(model=QueryMessage)
async def handle_query(ctx: Context, sender: str, msg: QueryMessage):
    response_text = await process_query_simple(msg.text)
    await ctx.send(sender, ResponseMessage(text=response_text))

agent.include(ticket_proto)

if __name__ == "__main__":
    agent.run()
