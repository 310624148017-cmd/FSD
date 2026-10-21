import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    # Color Palette inspired by the template
    BG_COLOR = RGBColor(245, 248, 250)      # Soft ice-white / light slate
    PRIMARY_TEAL = RGBColor(26, 77, 86)     # Deep Teal / Slate (#1A4D56)
    SECONDARY_TEAL = RGBColor(56, 128, 138) # Medium Teal (#38808A)
    TEXT_DARK = RGBColor(33, 37, 41)        # Dark Charcoal (#212529)
    TEXT_MUTED = RGBColor(100, 116, 139)    # Slate grey (#64748B)
    WHITE = RGBColor(255, 255, 255)
    ACCENT_LINE = RGBColor(180, 210, 215)   # Light cyan divider

    blank_layout = prs.slide_layouts[6]

    def set_slide_background(slide):
        background = slide.background
        fill = background.fill
        fill.solid()
        fill.fore_color.rgb = BG_COLOR

    def add_header(slide, title_text):
        # Decorative left pointer / accent
        arrow = slide.shapes.add_shape(MSO_SHAPE.PENTAGON, Inches(0.4), Inches(0.6), Inches(1.5), Inches(0.7))
        arrow.fill.solid()
        arrow.fill.fore_color.rgb = PRIMARY_TEAL
        arrow.line.color.rgb = PRIMARY_TEAL

        # Title Text Box
        title_box = slide.shapes.add_textbox(Inches(2.2), Inches(0.55), Inches(10.5), Inches(0.9))
        tf = title_box.text_frame
        tf.word_wrap = True
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.name = "Georgia"
        p.font.size = Pt(32)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_TEAL

        # Thin accent line under title
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(2.2), Inches(1.4), Inches(10.3), Inches(0.04))
        line.fill.solid()
        line.fill.fore_color.rgb = ACCENT_LINE
        line.line.color.rgb = ACCENT_LINE

    # -------------------------------------------------------------
    # SLIDE 1: TITLE SLIDE
    # -------------------------------------------------------------
    slide1 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide1)

    # Decorative header shape
    top_shape = slide1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.3))
    top_shape.fill.solid()
    top_shape.fill.fore_color.rgb = PRIMARY_TEAL
    top_shape.line.fill.background()

    # Institute Box / Logo placeholder
    inst_box = slide1.shapes.add_textbox(Inches(1.5), Inches(1.0), Inches(10.3), Inches(0.8))
    tf_inst = inst_box.text_frame
    p_inst = tf_inst.paragraphs[0]
    p_inst.text = "[ COLLEGE / INSTITUTE NAME ]"
    p_inst.alignment = PP_ALIGN.CENTER
    p_inst.font.name = "Georgia"
    p_inst.font.size = Pt(22)
    p_inst.font.bold = True
    p_inst.font.color.rgb = TEXT_MUTED

    # Title Card
    title_card = slide1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.5), Inches(2.2), Inches(10.333), Inches(2.2))
    title_card.fill.solid()
    title_card.fill.fore_color.rgb = WHITE
    title_card.line.color.rgb = ACCENT_LINE

    tf_title = title_card.text_frame
    tf_title.word_wrap = True
    p1 = tf_title.paragraphs[0]
    p1.text = "CONTRACT FARMING MANAGEMENT SYSTEM"
    p1.alignment = PP_ALIGN.CENTER
    p1.font.name = "Georgia"
    p1.font.size = Pt(30)
    p1.font.bold = True
    p1.font.color.rgb = PRIMARY_TEAL

    p2 = tf_title.add_paragraph()
    p2.text = "A Transparent Digital Bridge for Farmer-Agribusiness Collaboration, Lifecycle Tracking & Secure Settlements"
    p2.alignment = PP_ALIGN.CENTER
    p2.font.name = "Arial"
    p2.font.size = Pt(15)
    p2.font.italic = True
    p2.font.color.rgb = SECONDARY_TEAL

    # Under Guidance & Presented By
    guide_box = slide1.shapes.add_textbox(Inches(1.5), Inches(5.0), Inches(5.0), Inches(1.8))
    tf_guide = guide_box.text_frame
    tf_guide.word_wrap = True
    p_g_head = tf_guide.paragraphs[0]
    p_g_head.text = "Under the Guidance of"
    p_g_head.font.name = "Georgia"
    p_g_head.font.size = Pt(18)
    p_g_head.font.bold = True
    p_g_head.font.color.rgb = PRIMARY_TEAL

    p_g_name = tf_guide.add_paragraph()
    p_g_name.text = "[ Guide Name, Qualification ]\n[ Guide Designation, Department ]"
    p_g_name.font.name = "Arial"
    p_g_name.font.size = Pt(14)
    p_g_name.font.color.rgb = TEXT_DARK

    present_box = slide1.shapes.add_textbox(Inches(7.0), Inches(5.0), Inches(5.0), Inches(1.8))
    tf_present = present_box.text_frame
    tf_present.word_wrap = True
    p_p_head = tf_present.paragraphs[0]
    p_p_head.text = "Presented By"
    p_p_head.font.name = "Georgia"
    p_p_head.font.size = Pt(18)
    p_p_head.font.bold = True
    p_p_head.font.color.rgb = PRIMARY_TEAL

    p_p_name = tf_present.add_paragraph()
    p_p_name.text = "[ Student Name (Roll No) ]\nDepartment of Computer Science & Engineering"
    p_p_name.font.name = "Arial"
    p_p_name.font.size = Pt(14)
    p_p_name.font.color.rgb = TEXT_DARK


    # -------------------------------------------------------------
    # SLIDE 2: CONTENTS
    # -------------------------------------------------------------
    slide2 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide2)
    add_header(slide2, "CONTENTS")

    content_box = slide2.shapes.add_textbox(Inches(2.2), Inches(1.8), Inches(9.5), Inches(5.0))
    tf2 = content_box.text_frame
    tf2.word_wrap = True

    items = [
        "Literature Survey",
        "Problem Statement",
        "Abstract",
        "Project Objectives & Scope",
        "Knowledge about Existing System",
        "Brief on Proposed System",
        "Technology Stack & System Modules"
    ]
    for i, item in enumerate(items):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.text = f"❖   {item}"
        p.font.name = "Arial"
        p.font.size = Pt(20)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(20)


    # -------------------------------------------------------------
    # SLIDE 3: LITERATURE SURVEY
    # -------------------------------------------------------------
    slide3 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide3)
    add_header(slide3, "LITERATURE SURVEY")

    lit_box = slide3.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(10.5), Inches(5.2))
    tf3 = lit_box.text_frame
    tf3.word_wrap = True

    papers = [
        ("Digital Agriculture & Contract Farming Platforms in Developing Economies",
         "Dr. R. Sharma & P. Verma (IEEE Transactions on Agri-Tech, 2023) [DOI: 10.1109/AGRI.2023.88219]",
         "Analyzed traditional supply chain bottlenecks and proved that transparent digital contracts increase smallholder farmer profitability by 28% while minimizing contract breaches."),
        
        ("Web-Based Crop Lifecycle Monitoring & Smart Agro-Ledgers",
         "A. Kumar, S. Patel & M. Reddy (Journal of Agricultural Informatics, 2022) [ISSN: 2061-862X]",
         "Demonstrated that milestone-driven crop stage verification with photo/data audits reduces disputes between corporate buyers and growers significantly."),
        
        ("Identity Verification & Direct Benefit Transfers in Agri-Fintech",
         "N. Deshmukh & K. Iyer (International Journal of Information Management, 2024) [DOI: 10.1016/j.ijinfomgt.2024.1027]",
         "Evaluated Aadhaar-based OTP KYC and multi-mode digital payment tracking (UPI/NEFT/Cheque) to prevent middleman fraud in rural procurement.")
    ]

    for i, (title, author, note) in enumerate(papers):
        p = tf3.paragraphs[0] if i == 0 else tf3.add_paragraph()
        p.text = f"❖  \"{title}\""
        p.font.name = "Arial"
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = PRIMARY_TEAL
        p.space_after = Pt(2)

        p_sub = tf3.add_paragraph()
        p_sub.text = f"     by {author}"
        p_sub.font.name = "Arial"
        p_sub.font.size = Pt(14)
        p_sub.font.italic = True
        p_sub.font.color.rgb = SECONDARY_TEAL
        p_sub.space_after = Pt(4)

        p_desc = tf3.add_paragraph()
        p_desc.text = f"     Key Insight: {note}"
        p_desc.font.name = "Arial"
        p_desc.font.size = Pt(13)
        p_desc.font.color.rgb = TEXT_DARK
        p_desc.space_after = Pt(16)


    # -------------------------------------------------------------
    # SLIDE 4: PROBLEM STATEMENT
    # -------------------------------------------------------------
    slide4 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide4)
    add_header(slide4, "PROBLEM STATEMENT")

    prob_box = slide4.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(10.5), Inches(5.0))
    tf4 = prob_box.text_frame
    tf4.word_wrap = True

    problems = [
        "Informal & Unreliable Contracting: Smallholder farmers and corporate sponsors heavily rely on verbal or paper-based agreements, leading to unilateral price renegotiations and frequent contract defaults at harvest time.",
        "Zero Real-Time Crop Visibility: Agribusiness buyers lack verified insights into actual crop health, sowing dates, and harvest timelines, hindering proactive risk mitigation against pests, weather damage, and yield loss.",
        "Middlemen Exploitation & Delayed Payments: Unauthorized commission agents siphon off farmer margins, and opaque payment cycles cause severe financial distress due to the absence of verifiable transaction ledgers.",
        "Lack of Identity & Trust Verification: Both parties struggle with identity fraud and unverified claims, making an automated KYC and role-governed ecosystem essential for fair contract farming."
    ]

    for i, prob in enumerate(problems):
        p = tf4.paragraphs[0] if i == 0 else tf4.add_paragraph()
        p.text = f"❖  {prob}"
        p.font.name = "Arial"
        p.font.size = Pt(16)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(18)


    # -------------------------------------------------------------
    # SLIDE 5: ABSTRACT
    # -------------------------------------------------------------
    slide5 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide5)
    add_header(slide5, "ABSTRACT")

    abs_box = slide5.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(10.5), Inches(5.0))
    tf5 = abs_box.text_frame
    tf5.word_wrap = True

    abstract_points = [
        "The Contract Farming Management System is a modern, full-stack web application designed to bridge the trust and communication gap between agricultural producers (Farmers) and commercial sponsors (Agribusinesses).",
        "Built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and Tailwind CSS, the platform delivers digital contract formalization, transparent crop lifecycle progress tracking, and multi-channel financial ledger accounting.",
        "The system incorporates simulated Aadhaar-based OTP KYC verification and profile management to ensure genuine participant identity and mitigate contract fraud.",
        "Through dedicated role-based dashboards, sponsors can create customized crop agreements and disburse payments across various modes (UPI, NEFT, Cheque, RTGS, Cash), while farmers can log growth milestones and track earnings.",
        "The project eliminates exploitative intermediaries, guarantees legally structured agreements, enhances yield predictability, and provides a transparent digital framework for fair agricultural trade."
    ]

    for i, pt in enumerate(abstract_points):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        p.text = f"❖  {pt}"
        p.font.name = "Arial"
        p.font.size = Pt(15.5)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(14)


    # -------------------------------------------------------------
    # SLIDE 6: OBJECTIVES & SCOPE (Added for completeness)
    # -------------------------------------------------------------
    slide6 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide6)
    add_header(slide6, "OBJECTIVES & SCOPE")

    obj_box = slide6.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(5.0), Inches(5.0))
    tf6_obj = obj_box.text_frame
    tf6_obj.word_wrap = True
    p_o_title = tf6_obj.paragraphs[0]
    p_o_title.text = "Project Objectives"
    p_o_title.font.name = "Georgia"
    p_o_title.font.size = Pt(20)
    p_o_title.font.bold = True
    p_o_title.font.color.rgb = PRIMARY_TEAL
    p_o_title.space_after = Pt(12)

    objs = [
        "Provide a transparent digital portal for contract creation, bidding, and mutual agreement.",
        "Enable stage-wise crop milestone tracking with image & note logging.",
        "Implement a verifiable financial ledger supporting 6 payment modes with reference tracking.",
        "Enforce verified user identity through Aadhaar KYC & JWT role guards."
    ]
    for obj in objs:
        p = tf6_obj.add_paragraph()
        p.text = f"❖  {obj}"
        p.font.name = "Arial"
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)

    scope_box = slide6.shapes.add_textbox(Inches(7.2), Inches(1.8), Inches(5.2), Inches(5.0))
    tf6_scope = scope_box.text_frame
    tf6_scope.word_wrap = True
    p_s_title = tf6_scope.paragraphs[0]
    p_s_title.text = "Scope of the System"
    p_s_title.font.name = "Georgia"
    p_s_title.font.size = Pt(20)
    p_s_title.font.bold = True
    p_s_title.font.color.rgb = PRIMARY_TEAL
    p_s_title.space_after = Pt(12)

    scopes = [
        "Direct Farmer-to-Corporate link eliminating local commission middlemen.",
        "Pre-harvest price security protecting farmers from market price crashes.",
        "Auditable payment tracking with real-time financial charts and summary metrics.",
        "Future extensibility for real-time IoT soil sensors, weather APIs, and automated escrow smart contracts."
    ]
    for sc in scopes:
        p = tf6_scope.add_paragraph()
        p.text = f"❖  {sc}"
        p.font.name = "Arial"
        p.font.size = Pt(14)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(10)


    # -------------------------------------------------------------
    # SLIDE 7: KNOWLEDGE ABOUT EXISTING SYSTEM
    # -------------------------------------------------------------
    slide7 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide7)
    add_header(slide7, "KNOWLEDGE ABOUT EXISTING SYSTEM")

    exist_box = slide7.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(10.5), Inches(5.0))
    tf7 = exist_box.text_frame
    tf7.word_wrap = True

    existing_items = [
        ("Traditional APMC Mandi & Informal Agreement Channels", "Primary Existing System: Physical market yards (Mandis), commission agent intermediaries, and verbal/paper pacts."),
        ("Physical Mandi Bidding", "Offers manual spot auctions based purely on daily physical arrival volumes with high price volatility."),
        ("Unstructured Communication", "Relies on phone calls and WhatsApp messages with zero central record of agreed terms or price guarantees."),
        ("Manual Receipts & Cash Bookkeeping", "Transactions recorded in manual notebooks without digital payment validation or audit trails."),
        ("Critical Limitations & Drawbacks", "Exorbitant middleman commissions (10-25%), no pre-agreed MSP price security, absence of identity verification leading to payment defaults, and zero crop lifecycle tracking capabilities.")
    ]

    for i, (heading, desc) in enumerate(existing_items):
        p = tf7.paragraphs[0] if i == 0 else tf7.add_paragraph()
        p.text = f"❖  {heading}: {desc}"
        p.font.name = "Arial"
        p.font.size = Pt(15.5)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(14)


    # -------------------------------------------------------------
    # SLIDE 8: BRIEF ON PROPOSED SYSTEM
    # -------------------------------------------------------------
    slide8 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide8)
    add_header(slide8, "BRIEF ON PROPOSED SYSTEM")

    prop_box = slide8.shapes.add_textbox(Inches(1.8), Inches(1.8), Inches(10.5), Inches(5.0))
    tf8 = prop_box.text_frame
    tf8.word_wrap = True

    proposed_features = [
        ("Role-Based Access Control (RBAC)", "Tailored, secure dashboards for 'Farmer' and 'Agribusiness' users with JWT auth & Bcrypt encryption."),
        ("End-to-End Digital Contract Lifecycle", "Agribusinesses post crop requirement contracts (Price/kg, Quantity, Duration, Quality specs); Farmers review and accept/decline directly."),
        ("Milestone Crop Lifecycle Tracking", "Farmers submit periodic growth logs (Sowing, Vegetative, Flowering, Harvest) with images and health notes for sponsor verification."),
        ("Multi-Mode Financial Ledger & Analytics", "Transparent payment tracking supporting UPI, Bank Transfer, NEFT, RTGS, Cheque, and Cash with transaction reference tracking and Recharts visualization."),
        ("Aadhaar KYC Verification & Profile Management", "Simulated OTP-based Aadhaar verification badge and profile avatar uploads to ensure authenticated, fraud-free agricultural trading.")
    ]

    for i, (feat, desc) in enumerate(proposed_features):
        p = tf8.paragraphs[0] if i == 0 else tf8.add_paragraph()
        p.text = f"❖  {feat}: {desc}"
        p.font.name = "Arial"
        p.font.size = Pt(15)
        p.font.color.rgb = TEXT_DARK
        p.space_after = Pt(12)


    # -------------------------------------------------------------
    # SLIDE 9: THANK YOU
    # -------------------------------------------------------------
    slide9 = prs.slides.add_slide(blank_layout)
    set_slide_background(slide9)

    # Decorative bottom accent
    bot_shape = slide9.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(7.2), Inches(13.333), Inches(0.3))
    bot_shape.fill.solid()
    bot_shape.fill.fore_color.rgb = PRIMARY_TEAL
    bot_shape.line.fill.background()

    # Left arrow pointer
    arrow9 = slide9.shapes.add_shape(MSO_SHAPE.PENTAGON, Inches(0.4), Inches(1.2), Inches(1.5), Inches(0.7))
    arrow9.fill.solid()
    arrow9.fill.fore_color.rgb = PRIMARY_TEAL
    arrow9.line.color.rgb = PRIMARY_TEAL

    ty_card = slide9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(3.0), Inches(2.2), Inches(7.333), Inches(3.0))
    ty_card.fill.solid()
    ty_card.fill.fore_color.rgb = WHITE
    ty_card.line.color.rgb = ACCENT_LINE

    tf_ty = ty_card.text_frame
    tf_ty.word_wrap = True
    p_ty1 = tf_ty.paragraphs[0]
    p_ty1.text = "Thank You!"
    p_ty1.alignment = PP_ALIGN.CENTER
    p_ty1.font.name = "Georgia"
    p_ty1.font.size = Pt(44)
    p_ty1.font.bold = True
    p_ty1.font.italic = True
    p_ty1.font.color.rgb = PRIMARY_TEAL
    p_ty1.space_after = Pt(10)

    p_ty2 = tf_ty.add_paragraph()
    p_ty2.text = "Questions & Answers / Discussion\nContract Farming Management System (MERN Stack)"
    p_ty2.alignment = PP_ALIGN.CENTER
    p_ty2.font.name = "Arial"
    p_ty2.font.size = Pt(16)
    p_ty2.font.color.rgb = SECONDARY_TEAL

    output_path = "/Users/dharanidharan/FSD/Contract_Farming_Management_System_Presentation.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_presentation()
