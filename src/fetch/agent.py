import json
import hashlib
import base64
from datetime import datetime, timezone
from uuid import uuid4

from uagents import Agent, Context, Protocol
from uagents_core.contrib.protocols.chat import (
    chat_protocol_spec,
    ChatMessage,
    ChatAcknowledgement,
    TextContent,
    StartSessionContent,
)

PRIVATE_KEY = "EcyezEVmi4A7Osyq1qFyNQNOFMkjSe8j"

def simple_hash(data: str) -> str:
    return hashlib.sha256(data.encode()).hexdigest()

def simple_sign(file_b64: str) -> str:
    """Generate signature dari file base64 + private key"""
    return hashlib.sha256((file_b64 + PRIVATE_KEY).encode()).hexdigest()

def simple_verify(file_b64: str, signature: str) -> bool:
    """Verifikasi signature"""
    expected = hashlib.sha256((file_b64 + PRIVATE_KEY).encode()).hexdigest()
    return expected == signature

async def process_query(query: str, ctx: Context) -> str:
    """
    Query format:
    - register::<base64>
    - verify::<base64>::<signature>
    """
    query_lower = query.lower()

    if query_lower.startswith("register::"):
        try:
            file_b64 = query.split("::", 1)[1]
            # hash file asli
            file_hash = simple_hash(file_b64)
            # tanda tangan digital
            signature = simple_sign(file_b64)

            ctx.logger.info(f"[TTE] Register file -> hash={file_hash}, sig={signature}")
            return json.dumps({
                "action": "register",
                "status": "success",
                "file_base64": file_b64,
                "file_hash": file_hash,
                "signature": signature
            })
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    elif query_lower.startswith("verify::"):
        try:
            parts = query.split("::", 2)
            file_b64 = parts[1]
            signature = parts[2]

            file_hash = simple_hash(file_b64)
            is_valid = simple_verify(file_b64, signature)

            ctx.logger.info(f"[TTE] Verify file -> hash={file_hash}, valid={is_valid}")
            return json.dumps({
                "action": "verify",
                "status": "success",
                "file_base64": file_b64,
                "file_hash": file_hash,
                "signature": signature,
                "verified": is_valid
            })
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)})

    else:
        return "❌ Format salah. Gunakan: 'register::<base64>' atau 'verify::<base64>::<signature>'"


agent = Agent(
    name='tte-agent',
    port=8001,
    mailbox=True
)
chat_proto = Protocol(spec=chat_protocol_spec)


@chat_proto.on_message(model=ChatMessage)
async def handle_chat_message(ctx: Context, sender: str, msg: ChatMessage):
    """Handler utama untuk menerima pesan chat."""
    ack = ChatAcknowledgement(
        timestamp=datetime.now(timezone.utc),
        acknowledged_msg_id=msg.msg_id
    )
    await ctx.send(sender, ack)

    for item in msg.content:
        if isinstance(item, StartSessionContent):
            ctx.logger.info(f"[Chat] Start session from {sender}")
            continue

        elif isinstance(item, TextContent):
            ctx.logger.info(f"[Chat] Message from {sender}: {item.text}")
            response_text = await process_query(item.text, ctx)

            response = ChatMessage(
                timestamp=datetime.now(timezone.utc),
                msg_id=uuid4(),
                content=[TextContent(type="text", text=response_text)]
            )
            await ctx.send(sender, response)

        else:
            ctx.logger.info("[Chat] Unexpected content received")


@chat_proto.on_message(model=ChatAcknowledgement)
async def handle_chat_ack(ctx: Context, sender: str, msg: ChatAcknowledgement):
    ctx.logger.info(f"[Chat] Ack from {sender} for message {msg.acknowledged_msg_id}")


agent.include(chat_proto)

if __name__ == "__main__":
    agent.run()
