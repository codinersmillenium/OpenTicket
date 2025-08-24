
from uagents import Agent, Context

agent = Agent(name="payment_agent")

@agent.on_message(model=str)
async def handle_payment(ctx: Context, sender: str, msg: str):
    ctx.logger.info(f"Payment processed for {msg}")
