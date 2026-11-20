import asyncio
import socket

import pytest

from podflow.security.resource_probe import (
    ProbeFailure,
    _parse_probe_target,
    _public_addresses,
)


def test_probe_restricts_scheme_and_port():
    with pytest.raises(ProbeFailure, match="invalid_url"):
        _parse_probe_target("file:///etc/passwd")
    with pytest.raises(ProbeFailure, match="invalid_port"):
        _parse_probe_target("https://example.com:8443/")


def test_probe_rejects_private_dns_answers(monkeypatch):
    async def getaddrinfo(*args, **kwargs):
        return [
            (socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, "", ("127.0.0.1", 443))
        ]

    loop = asyncio.new_event_loop()
    monkeypatch.setattr(loop, "getaddrinfo", getaddrinfo)
    try:
        with pytest.raises(ProbeFailure, match="blocked_address"):
            loop.run_until_complete(_public_addresses("attacker.example", 443))
    finally:
        loop.close()
