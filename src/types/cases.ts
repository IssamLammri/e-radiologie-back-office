export type CaseDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type RadiologyCaseStatus = 'DRAFT' | 'PENDING_VALIDATION' | 'PUBLISHED' | 'ARCHIVED';

export type PatientGender = 'MALE' | 'FEMALE' | 'OTHER' | 'NOT_SPECIFIED';

export type MediaType = 'IMAGE' | 'VIDEO' | 'DICOM' | 'DOCUMENT';

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface ImagingModality {
  id: number;
  name: string;
  code: string;
  active: boolean;
  position: number;
}

export interface CaseCategory {
  id: number;
  name: string;
  description: string | null;
  active: boolean;
  position: number;
}

export interface CaseMedia {
  id?: number;
  path: string;
  mediaType: MediaType;
  title: string;
  caption: string | null;
  altText: string | null;
  position: number;
  isPrimary: boolean;
}

export interface CaseReference {
  id?: number;
  title: string;
  authors: string | null;
  source: string;
  url: string | null;
  doi: string | null;
  position: number;
}

export interface RadiologyCase {
  id: number;
  title: string;
  slug: string;
  modalityId?: number;
  categoryId?: number;
  modality?: ImagingModality;
  category?: CaseCategory;
  difficulty: CaseDifficulty | { value: CaseDifficulty; label: string };
  patientGender: PatientGender | { value: PatientGender; label: string };
  patientAge: number | null;
  clinicalContext: string;
  trainingInstruction: string | null;
  trainingPlaceholder: string | null;
  expertDescription: string;
  diagnosis: string;
  globalDiscussion: string | null;
  authorId?: number;
  author?: { id: number; firstName: string; lastName: string; displayName?: string };
  status: RadiologyCaseStatus | { value: RadiologyCaseStatus; label: string };
  media: CaseMedia[];
  references: CaseReference[];
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const DIFFICULTY_LABELS: Record<CaseDifficulty, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé'
};

export const STATUS_LABELS: Record<RadiologyCaseStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_VALIDATION: 'En attente de validation',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé'
};

export const GENDER_LABELS: Record<PatientGender, string> = {
  MALE: 'Homme',
  FEMALE: 'Femme',
  OTHER: 'Autre',
  NOT_SPECIFIED: 'Non renseigné'
};
