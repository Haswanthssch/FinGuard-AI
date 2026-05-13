from uuid import uuid4


def new_session_id(prefix: str = "aihub") -> str:
    return f"{prefix}_{uuid4().hex[:16]}"


def clamp(value: float, minimum: float = 0.0, maximum: float = 1.0) -> float:
    return max(minimum, min(maximum, value))

