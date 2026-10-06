"""Veyra — autonomous treasury and agentic-payments infrastructure for Stellar (x402 + MPP), Python client."""

from typing import TYPE_CHECKING

from .client import Agent, WebSocketMaxRetriesExceeded, WebSocketStatus  # type: ignore

if TYPE_CHECKING:
    from .langchain_tools import VeyraX402Tool, create_veyra_x402_tool

__version__ = "0.11.0"
__all__ = [
    "Agent",
    "WebSocketMaxRetriesExceeded",
    "WebSocketStatus",
    "VeyraX402Tool",
    "create_veyra_x402_tool",
]


def __getattr__(name: str):
    if name in {"VeyraX402Tool", "create_veyra_x402_tool"}:
        from .langchain_tools import VeyraX402Tool, create_veyra_x402_tool

        return {
            "VeyraX402Tool": VeyraX402Tool,
            "create_veyra_x402_tool": create_veyra_x402_tool,
        }[name]
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
