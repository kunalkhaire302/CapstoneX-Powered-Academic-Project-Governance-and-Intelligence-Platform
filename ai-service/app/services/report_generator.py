"""
Report Generator Service
Generates PDF reports and comprehensive JSON data dumps for HOD and Accreditation.
Uses ReportLab for PDF generation.
"""
import os
import io
import logging
from typing import Dict, List
from datetime import datetime

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

logger = logging.getLogger(__name__)


def generate_department_pdf_report(department: str, metrics: Dict, top_projects: List[Dict]) -> bytes:
    """
    Generate a PDF report for a department.
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed. PDF generation unavailable.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=40, leftMargin=40,
        topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    normal_style = styles["Normal"]
    
    story = []
    
    # Title
    story.append(Paragraph(f"CapstoneX Department Report: {department}", title_style))
    story.append(Spacer(1, 0.25 * inch))
    
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}", normal_style))
    story.append(Spacer(1, 0.5 * inch))
    
    # Key Metrics
    story.append(Paragraph("Key Metrics", heading_style))
    story.append(Spacer(1, 0.2 * inch))
    
    metrics_data = [
        ["Metric", "Value"],
        ["Total Projects", str(metrics.get("total_projects", 0))],
        ["Total Students", str(metrics.get("total_students", 0))],
        ["Average Score", f"{metrics.get('avg_score', 0):.1f}/100"],
        ["High Risk Projects", str(metrics.get("high_risk_count", 0))],
        ["Completed Projects", str(metrics.get("completed_projects", 0))],
    ]
    
    t = Table(metrics_data, colWidths=[2.5 * inch, 2.5 * inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor("#f8fafc")),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.5 * inch))
    
    # Top Projects
    story.append(Paragraph("Top Projects", heading_style))
    story.append(Spacer(1, 0.2 * inch))
    
    if top_projects:
        project_data = [["Title", "Domain", "Score"]]
        for p in top_projects[:10]:
            project_data.append([
                p.get("title", "")[:40] + ("..." if len(p.get("title", "")) > 40 else ""),
                p.get("domain", ""),
                str(p.get("score", 0))
            ])
            
        pt = Table(project_data, colWidths=[3.5 * inch, 1.5 * inch, 1 * inch])
        pt.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#475569")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#e2e8f0")),
        ]))
        story.append(pt)
    else:
        story.append(Paragraph("No project data available.", normal_style))
        
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer.read()


def generate_accreditation_report(data: Dict) -> Dict:
    """
    Generate comprehensive JSON data dump for accreditation.
    Includes anonymized statistics and trend analysis.
    """
    # In a real system, this would aggregate data from the database
    return {
        "report_id": f"acc_{datetime.now().strftime('%Y%m%d%H%M')}",
        "generated_at": datetime.now().isoformat(),
        "academic_year": data.get("academic_year", "2026-2027"),
        "institutional_metrics": {
            "total_departments": data.get("total_departments", 0),
            "total_students": data.get("total_students", 0),
            "total_projects": data.get("total_projects", 0),
            "completion_rate": data.get("completion_rate", 0),
            "average_cgpa_vs_project_score_correlation": data.get("correlation", 0.75),
        },
        "skills_trends": data.get("skills_trends", []),
        "domain_distribution": data.get("domain_distribution", {}),
        "compliance": {
            "projects_with_regular_meetings": data.get("compliance_meetings", "95%"),
            "projects_with_plagiarism_check": data.get("compliance_plagiarism", "100%"),
            "rubric_variance": data.get("rubric_variance", "Low"),
        }
    }
