import logging
from urllib.parse import urlsplit


class ShareTokenRedactionFilter(logging.Filter):
    """Remove bearer share tokens from Uvicorn's request-target access log field."""

    def filter(self, record: logging.LogRecord) -> bool:
        if not isinstance(record.args, tuple) or len(record.args) < 3:
            return True
        args = list(record.args)
        request_target = args[2]
        if isinstance(request_target, str):
            path = urlsplit(request_target).path
            prefix = "/api/v1/shares/"
            if path.startswith(prefix) and path[len(prefix) :]:
                args[2] = prefix + "[REDACTED]"
                record.args = tuple(args)
        return True


def install_access_log_filters() -> None:
    logger = logging.getLogger("uvicorn.access")
    if not any(isinstance(item, ShareTokenRedactionFilter) for item in logger.filters):
        logger.addFilter(ShareTokenRedactionFilter())
