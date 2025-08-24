
import hashlib
import hmac

SECRET_KEY = b'super-secret'

def sign_ticket(ticket_id: str) -> str:
    return hmac.new(SECRET_KEY, ticket_id.encode(), hashlib.sha256).hexdigest()

def verify_ticket_signature(ticket_id: str, signature: str) -> bool:
    expected = sign_ticket(ticket_id)
    return hmac.compare_digest(expected, signature)
