import { httpClient } from "./httpClient";

export interface CourseBlockForm {
  id?: number;
  _key?: string;
  contentHtml: string;
  imagePath: string | null;
  layout: string;
}
export interface CourseSectionForm {
  id?: number;
  _key?: string;
  title: string;
  blocks: CourseBlockForm[];
  children: CourseSectionForm[];
}
export interface EvaluationRuleForm {
  id?: number;
  _key?: string;
  grade: string;
  semiology: string;
  clinicalDescription: string;
}
export type Resource =
  | "specialties"
  | "classifications"
  | "courses"
  | "dems-exercises"
  | "report-exams"
  | "report-templates";
export const resources: Record<Resource, { label: string; singular: string }> =
  {
    specialties: { label: "Spécialités", singular: "Spécialité" },
    classifications: { label: "Classifications", singular: "Classification" },
    courses: { label: "Cours théoriques", singular: "Cours théorique" },
    "dems-exercises": { label: "Planchages DEMS", singular: "Planchage DEMS" },
    "report-exams": { label: "Examens", singular: "Examen" },
    "report-templates": {
      label: "Modèles de comptes rendus",
      singular: "Modèle de compte rendu",
    },
  };
export const answerFields = [
  ["identification", "Identification du dossier radiologique"],
  ["analyticStudy", "Étude analytique"],
  ["syntheticStudy", "Étude synthétique"],
  ["differentialDiagnosis", "Diagnostic différentiel"],
  ["management", "Conduite à tenir"],
] as const;
export const layouts = [
  ["IMAGE_LEFT", "Image à gauche / texte à droite"],
  ["IMAGE_RIGHT", "Texte à gauche / image à droite"],
  ["IMAGE_TOP", "Image au-dessus / texte en dessous"],
  ["IMAGE_BOTTOM", "Texte au-dessus / image en dessous"],
] as const;
export const editorialApi = {
  async list(resource: Resource, search = "") {
    let page = 1,
      pages = 1;
    const items: any[] = [];
    do {
      const r = await httpClient.get(`/api/admin/content/${resource}`, {
        params: { search, limit: 100, page },
      });
      items.push(...r.data.items);
      pages = r.data.pagination.totalPages;
    } while (++page <= pages);
    return items;
  },
  async get(resource: Resource, id: number) {
    return (await httpClient.get(`/api/admin/content/${resource}/${id}`)).data;
  },
  async create(resource: Resource, data: any) {
    return (await httpClient.post(`/api/admin/content/${resource}`, data)).data;
  },
  async update(resource: Resource, id: number, data: any) {
    return (
      await httpClient.patch(`/api/admin/content/${resource}/${id}`, data)
    ).data;
  },
  async remove(resource: Resource, id: number) {
    await httpClient.delete(`/api/admin/content/${resource}/${id}`);
  },
  async upload(file: File, signal?: AbortSignal) {
    const data = new FormData();
    data.append("file", file);
    return (
      await httpClient.post("/api/admin/media", data, {
        signal,
        headers: { "Content-Type": undefined },
      })
    ).data.path as string;
  },
};
export const mediaUrl = (path: string) =>
  path.startsWith("/uploads/")
    ? (
        import.meta.env.VITE_API_BASE_URL || "https://api.e-radiologie.com"
      ).replace(/\/$/, "") + path
    : path;
export function errorMessage(error: any) {
  const errors = error.response?.data?.errors;
  if (errors)
    return Object.entries(errors)
      .map(
        ([field, messages]) => `${field} : ${(messages as string[]).join(" ")}`,
      )
      .join("\n");
  return error.response?.data?.message || "Une erreur est survenue. Réessayez.";
}
