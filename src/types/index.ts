// User Types
export interface User {
  uid: string;
  email: string;
  emailLower: string;
  displayName: string;
  photoURL?: string;
  isActive: boolean;
  createdAt: string;
  tenantId?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  emailLower: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  createdAt: string;
}

export type UserRole = 'admin' | 'user';

export interface UserRoleDoc {
  role: UserRole;
}

// Tenant Types
export type TenantMemberRole = 'owner' | 'staff' | 'readonly';

export interface Tenant {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  settings?: TenantSettings;
}

export interface TenantSettings {
  logoUrl?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  userId: string;
  role: TenantMemberRole;
  email: string;
  displayName: string;
  joinedAt: string;
  invitedBy?: string;
}

// Patient Types
export interface Patient {
  id: string;
  tenantId: string;
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  tags: string[];
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Medical Record Types
export interface MedicalRecord {
  id: string;
  tenantId: string;
  patientId: string;
  procedureType: string;
  chiefComplaint: string;
  professionalAssessment: string;
  procedureDetails: string;
  productsUsed: ProductUsed[];
  treatedAreas: string[];
  postCareInstructions: string;
  additionalNotes?: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy?: string;
  revisionHistory?: RecordRevision[];
}

export interface ProductUsed {
  name: string;
  batch: string;
  dosage: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf' | 'document';
  uploadedAt: string;
}

export interface RecordRevision {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  changes: string;
}

// Form Types
export interface PatientFormData {
  name: string;
  email?: string;
  phone: string;
  dateOfBirth?: string;
  tags: string[];
  notes?: string;
}

export interface MedicalRecordFormData {
  procedureType: string;
  chiefComplaint: string;
  professionalAssessment: string;
  procedureDetails: string;
  productsUsed: ProductUsed[];
  treatedAreas: string[];
  postCareInstructions: string;
  additionalNotes?: string;
}

// Stats Types
export interface DashboardStats {
  totalPatients: number;
  proceduresThisMonth: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'patient_created' | 'record_created' | 'record_updated';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}
