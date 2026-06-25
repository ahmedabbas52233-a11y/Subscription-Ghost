# expose models so database.init_db can import them in one line
from app.models.user import User  # noqa: F401
from app.models.document import Document  # noqa: F401
