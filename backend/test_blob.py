from app.services.blob_storage_service import BlobStorageService

service = BlobStorageService()

pdfs = service.list_pdfs()

for pdf in pdfs:
    print(pdf)