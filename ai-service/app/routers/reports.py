"""
Reports Router — API endpoints for generating analytical reports.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from typing import Dict, List, Optional
from app.services.report_generator import generate_department_pdf_report, generate_accreditation_report
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


class DepartmentReportRequest(BaseModel):
    department: str
    metrics: Dict
    top_projects: List[Dict]


class AccreditationReportRequest(BaseModel):
    data: Dict


@router.post("/reports/department/pdf")
async def get_department_pdf(request: DepartmentReportRequest):
    """Generate a PDF report for a department."""
    try:
        pdf_bytes = generate_department_pdf_report(
            request.department,
            request.metrics,
            request.top_projects
        )
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=department_report_{request.department}.pdf"
            }
        )
    except RuntimeError as e:
        logger.error(f"Report generation error: {e}")
        raise HTTPException(status_code=501, detail="PDF generation is currently unavailable")
    except Exception as e:
        logger.error(f"Report generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate report")


@router.post("/reports/accreditation")
async def get_accreditation_report(request: AccreditationReportRequest):
    """Generate comprehensive JSON report for accreditation."""
    try:
        return generate_accreditation_report(request.data)
    except Exception as e:
        logger.error(f"Accreditation report error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate accreditation report")
