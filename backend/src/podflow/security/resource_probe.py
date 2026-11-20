"""Bounded URL availability checks with address validation before each connection."""

import asyncio
import ipaddress
import socket
import ssl
from urllib.parse import urljoin, urlsplit

_REDIRECT_STATUSES = {301, 302, 303, 307, 308}
_MAX_REDIRECTS = 3
_MAX_HEADER_BYTES = 16_384
_TIMEOUT_SECONDS = 3.0


class ProbeFailure(Exception):
    def __init__(self, code: str):
        self.code = code
        super().__init__(code)


def _parse_probe_target(url: str):
    try:
        parts = urlsplit(url)
        hostname = parts.hostname
        port = parts.port
    except ValueError as exc:
        raise ProbeFailure("invalid_url") from exc
    if parts.scheme not in {"http", "https"} or not hostname or parts.username or parts.password:
        raise ProbeFailure("invalid_url")
    expected_port = 443 if parts.scheme == "https" else 80
    if port not in {None, expected_port}:
        raise ProbeFailure("invalid_port")
    return parts, hostname, expected_port


async def _public_addresses(hostname: str, port: int) -> list[str]:
    try:
        ipaddress.ip_address(hostname)
        records = [(socket.AF_INET6 if ":" in hostname else socket.AF_INET, hostname)]
    except ValueError:
        loop = asyncio.get_running_loop()
        try:
            results = await loop.getaddrinfo(
                hostname, port, type=socket.SOCK_STREAM, proto=socket.IPPROTO_TCP
            )
        except OSError as exc:
            raise ProbeFailure("dns_error") from exc
        records = [(family, sockaddr[0]) for family, _, _, _, sockaddr in results]
    addresses = list(dict.fromkeys(address for _, address in records))
    if not addresses:
        raise ProbeFailure("dns_error")
    try:
        if any(not ipaddress.ip_address(address).is_global for address in addresses):
            raise ProbeFailure("blocked_address")
    except ValueError as exc:
        raise ProbeFailure("blocked_address") from exc
    return addresses


async def _request_once(url: str) -> tuple[int, str | None]:
    parts, hostname, port = _parse_probe_target(url)
    addresses = await _public_addresses(hostname, port)
    context = ssl.create_default_context() if parts.scheme == "https" else None
    path = parts.path or "/"
    if parts.query:
        path += "?" + parts.query
    try:
        path.encode("ascii")
    except UnicodeEncodeError as exc:
        raise ProbeFailure("invalid_url") from exc
    host_header = f"[{hostname}]" if ":" in hostname else hostname
    if parts.port:
        host_header += f":{parts.port}"
    last_error = None
    for address in addresses:
        writer = None
        try:
            reader, writer = await asyncio.open_connection(
                address,
                port,
                ssl=context,
                server_hostname=hostname if context else None,
                limit=_MAX_HEADER_BYTES,
            )
            writer.write(
                f"GET {path} HTTP/1.1\r\nHost: {host_header}\r\n"
                "User-Agent: PodFlow-Resource-Check/1\r\nAccept: */*\r\n"
                "Connection: close\r\n\r\n".encode("ascii")
            )
            await writer.drain()
            status_line = await reader.readline()
            if len(status_line) > 8192 or not status_line.startswith(b"HTTP/"):
                raise ProbeFailure("invalid_response")
            try:
                status_code = int(status_line.split(b" ", 2)[1])
            except (IndexError, ValueError) as exc:
                raise ProbeFailure("invalid_response") from exc
            used = len(status_line)
            location = None
            while True:
                line = await reader.readline()
                used += len(line)
                if used > _MAX_HEADER_BYTES:
                    raise ProbeFailure("headers_too_large")
                if line in {b"\r\n", b"\n", b""}:
                    break
                name, separator, value = line.partition(b":")
                if separator and name.lower() == b"location":
                    location = value.decode("latin-1").strip()
            return status_code, location
        except ProbeFailure:
            raise
        except (
            OSError,
            ssl.SSLError,
            asyncio.IncompleteReadError,
            asyncio.LimitOverrunError,
            ValueError,
        ) as exc:
            last_error = exc
        finally:
            if writer is not None:
                writer.close()
                try:
                    await writer.wait_closed()
                except OSError:
                    pass
    raise ProbeFailure("connection_error") from last_error


async def check_url_available(url: str) -> None:
    """Return on a final 2xx response; raise a safe, non-sensitive reason otherwise."""
    current = url
    try:
        async with asyncio.timeout(_TIMEOUT_SECONDS):
            for redirects in range(_MAX_REDIRECTS + 1):
                status_code, location = await _request_once(current)
                if status_code in _REDIRECT_STATUSES and location:
                    if redirects == _MAX_REDIRECTS:
                        raise ProbeFailure("too_many_redirects")
                    current = urljoin(current, location)
                    continue
                if 200 <= status_code < 300:
                    return
                raise ProbeFailure("http_unavailable")
    except TimeoutError as exc:
        raise ProbeFailure("timeout") from exc
