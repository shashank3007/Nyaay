import type { DocumentType } from '@/types'

export interface FormField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'number' | 'select'
  required?: boolean
  placeholder?: string
  hint?: string
  options?: Array<{ value: string; label: string }>
  rows?: number
}

export const DOCUMENT_FIELDS: Record<DocumentType, FormField[]> = {
  LEGAL_NOTICE: [
    { key: 'sender_name',       label: 'Your Full Name',              type: 'text',     required: true  },
    { key: 'sender_address',    label: 'Your Address',                type: 'textarea', required: true, rows: 2 },
    { key: 'sender_phone',      label: 'Your Phone Number',           type: 'text',     required: true  },
    { key: 'recipient_name',    label: "Recipient's Full Name",       type: 'text',     required: true  },
    { key: 'recipient_address', label: "Recipient's Address",         type: 'textarea', required: true, rows: 2 },
    { key: 'subject',           label: 'Subject of Notice',           type: 'text',     required: true, placeholder: 'e.g. Non-payment of security deposit' },
    { key: 'details',           label: 'Details of Grievance',        type: 'textarea', required: true, rows: 4, hint: 'Describe the dispute, dates, amounts, and what happened' },
    { key: 'relief_sought',     label: 'Relief / Action Demanded',   type: 'textarea', required: true, rows: 2, hint: 'What do you want the recipient to do?' },
    { key: 'deadline_days',     label: 'Days to Respond',             type: 'number',   placeholder: '15', hint: 'Typically 15–30 days' },
    { key: 'notice_date',       label: 'Date of Notice',              type: 'date',     required: true  },
  ],

  RTI_APPLICATION: [
    { key: 'applicant_name',    label: 'Applicant Full Name',         type: 'text',     required: true  },
    { key: 'applicant_address', label: 'Applicant Address',           type: 'textarea', required: true, rows: 2 },
    { key: 'applicant_phone',   label: 'Phone / Email',               type: 'text',     required: true  },
    { key: 'department',        label: 'Department / Ministry',       type: 'text',     required: true, placeholder: 'e.g. Municipal Corporation, Delhi' },
    { key: 'pio_designation',   label: 'PIO Designation',             type: 'text',     placeholder: 'Public Information Officer', hint: 'Leave blank if unknown' },
    { key: 'information_sought', label: 'Information Sought',         type: 'textarea', required: true, rows: 5, hint: 'Be specific. List each query as a separate numbered point.' },
    { key: 'period',            label: 'Period of Information',       type: 'text',     placeholder: 'e.g. FY 2022–23', hint: 'Time period for which information is sought' },
    { key: 'fee_mode',          label: 'RTI Fee Payment Mode',        type: 'select',   required: true, options: [
        { value: 'IPO',  label: 'Indian Postal Order (IPO) — ₹10' },
        { value: 'DD',   label: 'Demand Draft — ₹10' },
        { value: 'Cash', label: 'Cash — ₹10' },
        { value: 'BPL',  label: 'BPL / Below Poverty Line — Free' },
    ]},
    { key: 'application_date',  label: 'Date of Application',        type: 'date',     required: true  },
  ],

  POLICE_COMPLAINT: [
    { key: 'complainant_name',    label: 'Your Full Name',            type: 'text',     required: true  },
    { key: 'complainant_address', label: 'Your Address',              type: 'textarea', required: true, rows: 2 },
    { key: 'complainant_phone',   label: 'Your Phone Number',         type: 'text',     required: true  },
    { key: 'police_station',      label: 'Police Station Name',       type: 'text',     required: true  },
    { key: 'accused_name',        label: 'Name of Accused',           type: 'text',     hint: 'Leave blank if unknown' },
    { key: 'incident_date',       label: 'Date of Incident',          type: 'date',     required: true  },
    { key: 'incident_place',      label: 'Place of Incident',         type: 'text',     required: true  },
    { key: 'description',         label: 'Description of Incident',   type: 'textarea', required: true, rows: 5, hint: 'Describe what happened in chronological order' },
    { key: 'witnesses',           label: 'Names of Witnesses',        type: 'textarea', rows: 2, hint: 'Optional — names and contact of any witnesses' },
    { key: 'complaint_date',      label: 'Date of Complaint',         type: 'date',     required: true  },
  ],

  CONSUMER_COMPLAINT: [
    { key: 'complainant_name',    label: 'Your Full Name',            type: 'text',     required: true  },
    { key: 'complainant_address', label: 'Your Address',              type: 'textarea', required: true, rows: 2 },
    { key: 'complainant_phone',   label: 'Your Phone / Email',        type: 'text',     required: true  },
    { key: 'company_name',        label: 'Company / Service Provider',type: 'text',     required: true  },
    { key: 'company_address',     label: 'Company Address',           type: 'textarea', required: true, rows: 2 },
    { key: 'product_service',     label: 'Product / Service',         type: 'text',     required: true, placeholder: 'e.g. Mobile phone, insurance policy, airline ticket' },
    { key: 'purchase_date',       label: 'Date of Purchase / Service',type: 'date',     required: true  },
    { key: 'amount_paid',         label: 'Amount Paid (₹)',           type: 'number',   required: true  },
    { key: 'complaint_details',   label: 'Complaint Details',         type: 'textarea', required: true, rows: 4, hint: 'Describe the defect, deficiency, or unfair trade practice' },
    { key: 'relief_sought',       label: 'Relief Sought',             type: 'textarea', required: true, rows: 2, hint: 'Refund, replacement, compensation, etc.' },
    { key: 'complaint_date',      label: 'Date',                      type: 'date',     required: true  },
  ],

  AFFIDAVIT: [
    { key: 'deponent_name',    label: 'Your Full Name (Deponent)',   type: 'text',     required: true  },
    { key: 'father_name',      label: "Father's / Husband's Name",   type: 'text',     required: true  },
    { key: 'age',              label: 'Your Age',                     type: 'number',   required: true  },
    { key: 'address',          label: 'Your Address',                 type: 'textarea', required: true, rows: 2 },
    { key: 'purpose',          label: 'Purpose of Affidavit',        type: 'text',     required: true, placeholder: 'e.g. Change of name, lost document, proof of residence' },
    { key: 'statement',        label: 'Sworn Statement',             type: 'textarea', required: true, rows: 6, hint: 'Write the content of your sworn statement in first person' },
    { key: 'place',            label: 'Place of Execution',          type: 'text',     required: true  },
    { key: 'affidavit_date',   label: 'Date',                        type: 'date',     required: true  },
  ],

  RENT_AGREEMENT: [
    { key: 'landlord_name',     label: 'Landlord Full Name',         type: 'text',     required: true  },
    { key: 'landlord_address',  label: 'Landlord Permanent Address', type: 'textarea', required: true, rows: 2 },
    { key: 'landlord_phone',    label: 'Landlord Phone',             type: 'text',     required: true  },
    { key: 'tenant_name',       label: 'Tenant Full Name',           type: 'text',     required: true  },
    { key: 'tenant_address',    label: 'Tenant Permanent Address',   type: 'textarea', required: true, rows: 2 },
    { key: 'tenant_phone',      label: 'Tenant Phone',               type: 'text',     required: true  },
    { key: 'property_address',  label: 'Property Address (Rented)',  type: 'textarea', required: true, rows: 2 },
    { key: 'monthly_rent',      label: 'Monthly Rent (₹)',           type: 'number',   required: true  },
    { key: 'security_deposit',  label: 'Security Deposit (₹)',       type: 'number',   required: true  },
    { key: 'start_date',        label: 'Lease Start Date',           type: 'date',     required: true  },
    { key: 'duration_months',   label: 'Lease Duration (months)',    type: 'number',   required: true, placeholder: '11' },
    { key: 'lock_in_months',    label: 'Lock-in Period (months)',    type: 'number',   placeholder: '6'  },
    { key: 'notice_days',       label: 'Notice Period (days)',       type: 'number',   placeholder: '30'  },
    { key: 'agreement_date',    label: 'Agreement Date',             type: 'date',     required: true  },
  ],
}
