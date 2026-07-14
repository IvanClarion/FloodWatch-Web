import os
import json
import sys
import mimetypes
from pathlib import Path

class LantawScanAndAnalysis:
    """
    The entry-point scanner for Lantaw AI's file processing pipeline.
    
    When a file is uploaded, this class determines the file type,
    validates it, and routes it to the correct extraction handler:
      - Document files (.pdf, .docx, .xlsx, .csv, .txt) → LantawExtractDataFromFiles
      - Image files (.png, .jpg, .jpeg, .webp) → LantawExtractDataFromImage
    
    After extraction, it runs Lantaw AI-powered duplication detection
    against existing database records before allowing insertion.
    
    It also performs basic safety checks (file size, extension whitelist).
    """

    # Supported file categories and their extensions
    DOCUMENT_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".csv", ".txt"]
    IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"]
    ALLOWED_EXTENSIONS = DOCUMENT_EXTENSIONS + IMAGE_EXTENSIONS

    # Max file size: 10 MB
    MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

    @staticmethod
    def identify_file_type(file_path: str) -> str:
        """
        Identifies whether the uploaded file is a 'document' or 'image'
        based on its extension.
        
        Returns:
            'document' | 'image' | 'unsupported'
        """
        ext = Path(file_path).suffix.lower()

        if ext in LantawScanAndAnalysis.DOCUMENT_EXTENSIONS:
            return "document"
        elif ext in LantawScanAndAnalysis.IMAGE_EXTENSIONS:
            return "image"
        else:
            return "unsupported"

    @staticmethod
    def validate_file(file_path: str) -> dict:
        """
        Performs pre-processing validation on the uploaded file.
        Checks: existence, extension whitelist, and file size limit.

        Returns:
            dict with keys: 'valid' (bool), 'error' (str|None), 'file_type' (str|None), 'metadata' (dict|None)
        """
        path = Path(file_path)

        # 1. Check existence
        if not path.exists():
            return {"valid": False, "error": "File does not exist.", "file_type": None, "metadata": None}

        # 2. Check extension
        ext = path.suffix.lower()
        if ext not in LantawScanAndAnalysis.ALLOWED_EXTENSIONS:
            return {
                "valid": False,
                "error": f"Unsupported file type '{ext}'. Allowed: {', '.join(LantawScanAndAnalysis.ALLOWED_EXTENSIONS)}",
                "file_type": None,
                "metadata": None
            }

        # 3. Check file size
        file_size = path.stat().st_size
        if file_size > LantawScanAndAnalysis.MAX_FILE_SIZE_BYTES:
            size_mb = file_size / (1024 * 1024)
            return {
                "valid": False,
                "error": f"File too large ({size_mb:.1f} MB). Maximum allowed: 10 MB.",
                "file_type": None,
                "metadata": None
            }

        # 4. Determine type
        file_type = LantawScanAndAnalysis.identify_file_type(file_path)
        mime_type, _ = mimetypes.guess_type(file_path)

        metadata = {
            "file_name": path.name,
            "extension": ext,
            "mime_type": mime_type or "unknown",
            "size_bytes": file_size,
            "size_readable": f"{file_size / 1024:.1f} KB" if file_size < 1024 * 1024 else f"{file_size / (1024 * 1024):.2f} MB"
        }

        return {"valid": True, "error": None, "file_type": file_type, "metadata": metadata}

    @staticmethod
    def _fetch_existing_utilities() -> list:
        """
        Fetches existing utilities from the Supabase database
        for duplication comparison.
        """
        try:
            from lantaw.utilities.LantawSources import supabase
            response = supabase.table('utilities').select('id, name, type, serial_number').execute()
            return response.data or []
        except Exception as e:
            print(f"Warning: Could not fetch existing utilities for duplication check: {e}", file=sys.stderr)
            return []

    @staticmethod
    def _check_for_duplicates(extracted_items: list) -> dict:
        """
        Runs Lantaw AI-powered duplication detection on extracted items
        against the existing database records.

        Returns:
            dict with keys: 'has_duplicates' (bool), 'duplicates' (list), 'report' (str)
        """
        from lantaw.utilities.LantawDuplicationDetection import LantawDuplicationDetection

        existing = LantawScanAndAnalysis._fetch_existing_utilities()

        if not existing:
            # No existing records, so no duplicates possible
            return {"has_duplicates": False, "duplicates": [], "report": "No existing records to compare against."}

        # Run AI-powered detection
        duplicates = LantawDuplicationDetection.detect_duplicate_utilities(extracted_items, existing)
        report = LantawDuplicationDetection.format_duplicate_report(duplicates)

        return {
            "has_duplicates": len(duplicates) > 0,
            "duplicates": duplicates,
            "report": report
        }

    @staticmethod
    def scan_and_route(file_path: str) -> dict:
        """
        Main orchestrator method. Validates the file, routes it to the
        correct extractor, then runs duplication detection.

        Pipeline:
          1. Validate file (size, extension)
          2. Extract data (document or image)
          3. Check for duplicates against existing database records
          4. Return result (success or error with duplicate details)

        Returns:
            dict with keys: 'success' (bool), 'file_type' (str), 'data' (dict|str), 
                            'duplicates' (list|None), 'error' (str|None)
        """
        from lantaw.utilities.LantawExtractDataFromFiles import LantawExtractDataFromFiles
        from lantaw.utilities.LantawExtractDataFromImage import LantawExtractDataFromImage

        # Step 1: Validate
        validation = LantawScanAndAnalysis.validate_file(file_path)
        if not validation["valid"]:
            return {
                "success": False,
                "file_type": None,
                "data": None,
                "duplicates": None,
                "error": validation["error"]
            }

        file_type = validation["file_type"]
        metadata = validation["metadata"]

        # Step 2: Route to the correct extractor
        try:
            if file_type == "document":
                extracted = LantawExtractDataFromFiles.extract(file_path)
            elif file_type == "image":
                extracted = LantawExtractDataFromImage.extract(file_path)
            else:
                return {
                    "success": False,
                    "file_type": file_type,
                    "data": None,
                    "duplicates": None,
                    "error": "No extractor available for this file type."
                }

            # Check if extraction itself failed
            if extracted.get("error"):
                return {
                    "success": False,
                    "file_type": file_type,
                    "data": None,
                    "duplicates": None,
                    "error": extracted["error"]
                }

        except Exception as e:
            return {
                "success": False,
                "file_type": file_type,
                "data": None,
                "duplicates": None,
                "error": f"Extraction failed: {str(e)}"
            }

        # Step 3: Run duplication detection against the database
        extracted_items = extracted.get("content", [])
        duplicate_result = {"has_duplicates": False, "duplicates": [], "report": ""}

        if isinstance(extracted_items, list) and len(extracted_items) > 0:
            try:
                duplicate_result = LantawScanAndAnalysis._check_for_duplicates(extracted_items)
            except Exception as e:
                # Duplication check failure should not block the pipeline,
                # but we log it and include a warning
                print(f"Warning: Duplication check failed: {e}", file=sys.stderr)

        if duplicate_result["has_duplicates"]:
            return {
                "success": False,
                "file_type": file_type,
                "metadata": metadata,
                "data": extracted,
                "duplicates": duplicate_result["duplicates"],
                "error": f"Lantaw AI detected duplicate items already in the database.\n{duplicate_result['report']}"
            }

        # Step 4: All clear — return extracted data
        return {
            "success": True,
            "file_type": file_type,
            "metadata": metadata,
            "data": extracted,
            "duplicates": None,
            "error": None
        }

    @staticmethod
    def get_scan_instructions() -> str:
        """
        Returns the system prompt segment that instructs the AI on how
        to handle uploaded file data during the thinking/decision phase.
        """
        return (
            "\n\n--- FILE SCAN & ANALYSIS INSTRUCTIONS ---\n"
            "When a user uploads a file, it will be scanned and its contents extracted automatically.\n"
            "You will receive the extracted data as structured context.\n"
            "1. DOCUMENT FILES (PDF, DOCX, XLSX, CSV, TXT): Raw text or tabular data will be extracted and provided.\n"
            "2. IMAGE FILES (PNG, JPG, JPEG, WEBP): The image will be analyzed using vision capabilities.\n"
            "3. VALIDATION: Files exceeding 10MB or with unsupported extensions will be rejected before processing.\n"
            "4. DUPLICATION: Extracted items are checked against the existing database. Duplicates are flagged and blocked.\n"
            "5. Your role is to interpret the extracted data and respond to the user's query about that data.\n"
            "6. NEVER fabricate file contents. Only reference what was actually extracted.\n"
        )

if __name__ == "__main__":
    # Ensure src directory is in sys.path so 'lantaw' package can be imported
    src_path = str(Path(__file__).resolve().parent.parent.parent)
    if src_path not in sys.path:
        sys.path.insert(0, src_path)

    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No file path provided."}))
        sys.exit(1)

    file_to_process = sys.argv[1]
    result = LantawScanAndAnalysis.scan_and_route(file_to_process)
    
    # Print exactly the JSON output so Node.js can parse it easily
    print(json.dumps(result, default=str))
