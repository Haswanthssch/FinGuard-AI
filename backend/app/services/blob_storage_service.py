import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from uuid import uuid4
from urllib.parse import quote, urlsplit

import httpx

from app.core.config import settings


@dataclass(frozen=True)
class BlobPdf:
    name: str
    url: str
    public_url: str
    size: int | None = None
    last_modified: str | None = None


@dataclass(frozen=True)
class UploadedBlob:
    name: str
    url: str
    public_url: str
    size: int


class BlobStorageService:
    def __init__(self) -> None:
        self.container_url = settings.AZURE_BLOB_CONTAINER_URL.strip().rstrip("/")
        self.sas_token = settings.AZURE_BLOB_SAS_TOKEN.strip().lstrip("?")
        self.prefix = settings.AZURE_BLOB_PDF_PREFIX.strip().strip("/")
        self.upload_prefix = settings.AZURE_BLOB_UPLOAD_PREFIX.strip().strip("/")

    def configured(self) -> bool:
        return bool(self.container_url)

    async def list_pdfs(self) -> list[BlobPdf]:
        if not self.configured():
            raise RuntimeError("AZURE_BLOB_CONTAINER_URL is not configured")

        pdfs: list[BlobPdf] = []
        marker = ""
        async with httpx.AsyncClient(timeout=60.0) as client:
            while True:
                params = {"restype": "container", "comp": "list"}
                if self.prefix:
                    params["prefix"] = f"{self.prefix}/"
                if marker:
                    params["marker"] = marker
                response = await client.get(self._with_sas(self.container_url), params=params)
                if response.status_code >= 400:
                    if "AuthorizationPermissionMismatch" in response.text:
                        raise RuntimeError(
                            "Azure Blob listing failed: the SAS token does not have List permission. "
                            "Create a container SAS with Read and List permissions (sp=rl), then update AZURE_BLOB_SAS_TOKEN."
                        )
                    raise RuntimeError(f"Azure Blob listing failed: {response.status_code} {response.text[:1000]}")

                root = ET.fromstring(response.text)
                for blob in root.findall("./Blobs/Blob"):
                    name = blob.findtext("Name") or ""
                    if not name.lower().endswith(".pdf"):
                        continue
                    size_text = blob.findtext("./Properties/Content-Length")
                    pdfs.append(
                        BlobPdf(
                            name=name,
                            url=self.get_blob_url(name, include_sas=True),
                            public_url=self.get_blob_url(name, include_sas=False),
                            size=int(size_text) if size_text and size_text.isdigit() else None,
                            last_modified=blob.findtext("./Properties/Last-Modified"),
                        )
                    )

                marker = root.findtext("NextMarker") or ""
                if not marker:
                    break
        return pdfs

    def get_blob_url(self, blob_name: str | BlobPdf, include_sas: bool = True) -> str:
        name = blob_name.name if isinstance(blob_name, BlobPdf) else blob_name
        encoded_name = "/".join(quote(part) for part in name.split("/"))
        url = f"{self.container_url}/{encoded_name}"
        return self._with_sas(url) if include_sas else url

    async def upload_portfolio_file(
        self,
        *,
        content: bytes,
        filename: str,
        user_id: str,
        portfolio_id: str,
        content_type: str | None = None,
    ) -> UploadedBlob:
        if not self.configured():
            raise RuntimeError("AZURE_BLOB_CONTAINER_URL is not configured")

        blob_name = self._portfolio_blob_name(filename, user_id, portfolio_id)
        headers = {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": content_type or "application/octet-stream",
        }
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.put(self.get_blob_url(blob_name, include_sas=True), content=content, headers=headers)
            if response.status_code >= 400:
                if "AuthorizationPermissionMismatch" in response.text:
                    raise RuntimeError(
                        "Azure Blob upload failed: the SAS token needs Write/Create permissions. "
                        "Create a container SAS with Read, List, Create, and Write permissions."
                    )
                raise RuntimeError(f"Azure Blob upload failed: {response.status_code} {response.text[:1000]}")

        return UploadedBlob(
            name=blob_name,
            url=self.get_blob_url(blob_name, include_sas=True),
            public_url=self.get_blob_url(blob_name, include_sas=False),
            size=len(content),
        )

    def _portfolio_blob_name(self, filename: str, user_id: str, portfolio_id: str) -> str:
        today = datetime.utcnow()
        safe_name = Path(filename or "portfolio.csv").name.replace("\\", "_").replace("/", "_")
        parts = [
            self.upload_prefix,
            f"year={today:%Y}",
            f"month={today:%m}",
            f"day={today:%d}",
            f"user={user_id}",
            f"portfolio={portfolio_id}",
            f"{uuid4()}_{safe_name}",
        ]
        return "/".join(part for part in parts if part)

    def _with_sas(self, url: str) -> str:
        if not self.sas_token:
            return url
        separator = "&" if urlsplit(url).query else "?"
        return f"{url}{separator}{self.sas_token}"


blob_storage_service = BlobStorageService()
