<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { casesApi } from '../../api/casesApi';
import { modalitiesApi } from '../../api/modalitiesApi';
import { categoriesApi } from '../../api/categoriesApi';
import { usersApi } from '../../api/usersApi';
import type { ImagingModality, CaseCategory, CaseMedia, CaseReference } from '../../types/cases';
import { DIFFICULTY_LABELS, GENDER_LABELS, STATUS_LABELS } from '../../types/cases';
import { ArrowLeft, Plus, Trash2, GripVertical, Image as ImageIcon, Link as LinkIcon } from 'lucide-vue-next';
import type { User } from '../../types/user';

const router = useRouter();
const route = useRoute();
const isEditing = route.params.id !== undefined;
const caseId = isEditing ? Number(route.params.id) : null;

// Lookups
const modalities = ref<ImagingModality[]>([]);
const categories = ref<CaseCategory[]>([]);
const users = ref<User[]>([]);

const form = ref({
  title: '',
  modalityId: '' as number | '',
  categoryId: '' as number | '',
  difficulty: 'BEGINNER' as any,
  patientGender: 'NOT_SPECIFIED' as any,
  patientAge: null as number | null,
  clinicalContext: '',
  trainingInstruction: '',
  trainingPlaceholder: '',
  expertDescription: '',
  diagnosis: '',
  globalDiscussion: '',
  authorId: '' as number | '',
  status: 'DRAFT' as any
});

const media = ref<CaseMedia[]>([]);
const references = ref<CaseReference[]>([]);

const loading = ref(true);
const saving = ref(false);
const error = ref<any>({});
const globalError = ref('');

onMounted(async () => {
  try {
    // Load lookups
    const [mods, cats, usersData] = await Promise.all([
      modalitiesApi.getActive(),
      categoriesApi.getActive(),
      usersApi.getAll({ limit: 100 }) // Load up to 100 users for author dropdown
    ]);
    
    modalities.value = mods;
    categories.value = cats;
    users.value = usersData.items;

    if (isEditing && caseId) {
      const caseData = await casesApi.getAdminById(caseId);
      form.value = {
        title: caseData.title,
        modalityId: caseData.modality?.id || caseData.modalityId || '',
        categoryId: caseData.category?.id || caseData.categoryId || '',
        difficulty: typeof caseData.difficulty === 'object' ? caseData.difficulty.value : caseData.difficulty,
        patientGender: typeof caseData.patientGender === 'object' ? caseData.patientGender.value : caseData.patientGender,
        patientAge: caseData.patientAge,
        clinicalContext: caseData.clinicalContext,
        trainingInstruction: caseData.trainingInstruction || '',
        trainingPlaceholder: caseData.trainingPlaceholder || '',
        expertDescription: caseData.expertDescription,
        diagnosis: caseData.diagnosis,
        globalDiscussion: caseData.globalDiscussion || '',
        authorId: caseData.author?.id || caseData.authorId || '',
        status: typeof caseData.status === 'object' ? caseData.status.value : caseData.status
      };
      media.value = [...caseData.media];
      references.value = [...caseData.references];
    }
  } catch (err: any) {
    globalError.value = "Erreur lors de l'initialisation du formulaire.";
  } finally {
    loading.value = false;
  }
});

// --- Media Actions ---
const addMedia = () => {
  media.value.push({
    path: '',
    mediaType: 'IMAGE',
    title: '',
    caption: '',
    altText: '',
    position: media.value.length,
    isPrimary: media.value.length === 0 // First is primary by default
  });
};

const removeMedia = (index: number) => {
  const removed = media.value.splice(index, 1)[0];
  // Reassign primary if needed
  if (removed.isPrimary && media.value.length > 0) {
    media.value[0].isPrimary = true;
  }
  reorderMedia();
};

const setPrimaryMedia = (index: number) => {
  media.value.forEach((m, i) => {
    m.isPrimary = (i === index);
  });
};

const reorderMedia = () => {
  media.value.forEach((m, i) => {
    m.position = i;
  });
};

const moveMediaUp = (index: number) => {
  if (index === 0) return;
  const temp = media.value[index];
  media.value[index] = media.value[index - 1];
  media.value[index - 1] = temp;
  reorderMedia();
};

const moveMediaDown = (index: number) => {
  if (index === media.value.length - 1) return;
  const temp = media.value[index];
  media.value[index] = media.value[index + 1];
  media.value[index + 1] = temp;
  reorderMedia();
};

// --- References Actions ---
const addReference = () => {
  references.value.push({
    title: '',
    authors: '',
    source: '',
    url: '',
    doi: '',
    position: references.value.length
  });
};

const removeReference = (index: number) => {
  references.value.splice(index, 1);
  reorderReferences();
};

const reorderReferences = () => {
  references.value.forEach((r, i) => {
    r.position = i;
  });
};

const moveReferenceUp = (index: number) => {
  if (index === 0) return;
  const temp = references.value[index];
  references.value[index] = references.value[index - 1];
  references.value[index - 1] = temp;
  reorderReferences();
};

const moveReferenceDown = (index: number) => {
  if (index === references.value.length - 1) return;
  const temp = references.value[index];
  references.value[index] = references.value[index + 1];
  references.value[index + 1] = temp;
  reorderReferences();
};

// --- Submit ---
const handleSubmit = async () => {
  saving.value = true;
  error.value = {};
  
  // Format payload
  const payload = {
    ...form.value,
    modalityId: Number(form.value.modalityId),
    categoryId: Number(form.value.categoryId),
    authorId: Number(form.value.authorId),
    patientAge: form.value.patientAge ? Number(form.value.patientAge) : null,
    media: media.value,
    references: references.value
  };

  try {
    if (isEditing && caseId) {
      await casesApi.update(caseId, payload);
    } else {
      await casesApi.create(payload);
    }
    router.push('/cases');
  } catch (err: any) {
    if (err.response?.status === 422) {
      error.value = err.response.data.errors || {};
    } else {
      error.value = { global: err.response?.data?.message || 'Une erreur est survenue lors de l\'enregistrement.' };
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  } finally {
    saving.value = false;
  }
};
</script>

<template>
  <div class="space-y-6 max-w-5xl mx-auto pb-12">
    
    <div class="flex items-center gap-4 sticky top-0 bg-slate-50 pt-2 pb-4 z-10">
      <RouterLink to="/cases" class="p-2 text-slate-400 hover:text-slate-600 bg-white rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">
        <ArrowLeft class="h-5 w-5" />
      </RouterLink>
      <h1 class="text-2xl font-bold tracking-tight text-slate-900">
        {{ isEditing ? 'Modifier le cas' : 'Créer un cas' }}
      </h1>
      
      <div class="ml-auto flex gap-3">
        <button @click="handleSubmit" :disabled="saving"
                class="py-2 px-5 border border-transparent text-sm font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center">
          <span v-if="saving" class="mr-2">...</span>
          Enregistrer
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <p class="text-slate-500">Chargement du formulaire...</p>
    </div>
    
    <div v-else-if="globalError" class="bg-red-50 text-red-700 p-6 rounded-2xl text-center border border-red-100">
      <p class="font-medium">{{ globalError }}</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-8">
      
      <div v-if="error.global" class="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
        {{ error.global }}
      </div>

      <!-- Informations générales -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Informations générales</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Titre du cas <span class="text-red-500">*</span></label>
            <input type="text" v-model="form.title" required
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm" />
            <p v-if="error.title" class="mt-1 text-sm text-red-600">{{ error.title[0] }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Modalité <span class="text-red-500">*</span></label>
            <select v-model="form.modalityId" required class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="m in modalities" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
            <p v-if="error.modalityId" class="mt-1 text-sm text-red-600">{{ error.modalityId[0] }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Catégorie <span class="text-red-500">*</span></label>
            <select v-model="form.categoryId" required class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
            <p v-if="error.categoryId" class="mt-1 text-sm text-red-600">{{ error.categoryId[0] }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Niveau de difficulté <span class="text-red-500">*</span></label>
            <select v-model="form.difficulty" required class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm">
              <option v-for="(label, key) in DIFFICULTY_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
            <p v-if="error.difficulty" class="mt-1 text-sm text-red-600">{{ error.difficulty[0] }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Auteur / Médecin rédacteur <span class="text-red-500">*</span></label>
            <select v-model="form.authorId" required class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm">
              <option value="" disabled>Sélectionner...</option>
              <option v-for="u in users" :key="u.id" :value="u.id">{{ u.firstName }} {{ u.lastName }} ({{ u.email }})</option>
            </select>
            <p v-if="error.authorId" class="mt-1 text-sm text-red-600">{{ error.authorId[0] }}</p>
          </div>
          
          <div v-if="isEditing">
            <label class="block text-sm font-medium text-slate-700 mb-1">Statut</label>
            <select v-model="form.status" disabled class="block w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 sm:text-sm cursor-not-allowed">
              <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
            <p class="text-xs text-slate-500 mt-1">Le statut se gère via les actions de la liste principale.</p>
          </div>
        </div>
      </section>

      <!-- Patient -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Patient & Contexte</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Sexe du patient <span class="text-red-500">*</span></label>
            <select v-model="form.patientGender" required class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm">
              <option v-for="(label, key) in GENDER_LABELS" :key="key" :value="key">{{ label }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Âge du patient</label>
            <input type="number" v-model="form.patientAge" min="0" max="150"
                   class="appearance-none block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm" />
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Contexte clinique <span class="text-red-500">*</span></label>
            <textarea v-model="form.clinicalContext" required rows="3"
                      class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm"></textarea>
            <p v-if="error.clinicalContext" class="mt-1 text-sm text-red-600">{{ error.clinicalContext[0] }}</p>
          </div>
        </div>
      </section>

      <!-- Médias -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 class="text-lg font-semibold text-slate-900">Médias ({{ media.length }})</h2>
          <button type="button" @click="addMedia" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
            <Plus class="h-4 w-4 mr-1" /> Ajouter
          </button>
        </div>
        
        <p v-if="error.media" class="mb-4 text-sm text-red-600">{{ error.media[0] || 'Erreur dans les médias' }}</p>
        
        <div v-if="media.length === 0" class="text-center py-8 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <ImageIcon class="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p>Aucun média ajouté. Un cas doit contenir au moins un média pour être publié.</p>
        </div>
        
        <div class="space-y-4">
          <div v-for="(m, idx) in media" :key="idx" class="relative bg-slate-50 p-5 rounded-xl border" :class="m.isPrimary ? 'border-blue-400 ring-1 ring-blue-400' : 'border-slate-200'">
            
            <div class="absolute top-4 right-4 flex gap-1">
              <button type="button" @click="moveMediaUp(idx)" :disabled="idx === 0" class="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronLeft class="h-5 w-5 rotate-90" /></button>
              <button type="button" @click="moveMediaDown(idx)" :disabled="idx === media.length - 1" class="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronRight class="h-5 w-5 rotate-90" /></button>
              <button type="button" @click="removeMedia(idx)" class="p-1 text-red-400 hover:text-red-600 ml-2"><Trash2 class="h-5 w-5" /></button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div class="md:col-span-2 flex items-center gap-4 border-b border-slate-200 pb-4 mb-2">
                <label class="flex items-center gap-2 text-sm font-medium text-slate-900 cursor-pointer">
                  <input type="radio" :name="'primary_media'" :checked="m.isPrimary" @change="setPrimaryMedia(idx)" class="text-blue-600 focus:ring-blue-500 h-4 w-4">
                  Média principal
                </label>
                <span class="text-xs text-slate-500">Ordre: {{ m.position }}</span>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Type</label>
                <select v-model="m.mediaType" class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm">
                  <option value="IMAGE">Image</option>
                  <option value="VIDEO">Vidéo</option>
                  <option value="DICOM">DICOM</option>
                  <option value="DOCUMENT">Document</option>
                </select>
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Chemin / URL (Upload non géré) <span class="text-red-500">*</span></label>
                <input type="text" v-model="m.path" required placeholder="/uploads/cases/image.jpg"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Titre <span class="text-red-500">*</span></label>
                <input type="text" v-model="m.title" required
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1">Texte alternatif (Accessibilité)</label>
                <input type="text" v-model="m.altText"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              
              <div class="md:col-span-2">
                <label class="block text-xs font-medium text-slate-700 mb-1">Légende</label>
                <input type="text" v-model="m.caption"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Entraînement & Conclusion -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Entraînement & Conclusion</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Consignes pour l'étudiant</label>
            <textarea v-model="form.trainingInstruction" rows="2"
                      class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Texte indicatif (Placeholder)</label>
            <textarea v-model="form.trainingPlaceholder" rows="2"
                      class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm"></textarea>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Description experte (Correction) <span class="text-red-500">*</span></label>
            <textarea v-model="form.expertDescription" required rows="4"
                      class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm"></textarea>
            <p v-if="error.expertDescription" class="mt-1 text-sm text-red-600">{{ error.expertDescription[0] }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Diagnostic principal <span class="text-red-500">*</span></label>
            <input type="text" v-model="form.diagnosis" required
                   class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm" />
            <p v-if="error.diagnosis" class="mt-1 text-sm text-red-600">{{ error.diagnosis[0] }}</p>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1">Discussion globale</label>
            <textarea v-model="form.globalDiscussion" rows="4"
                      class="block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white sm:text-sm"></textarea>
          </div>
        </div>
      </section>

      <!-- Références -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div class="flex justify-between items-center mb-6 border-b border-slate-100 pb-2">
          <h2 class="text-lg font-semibold text-slate-900">Références bibliographiques ({{ references.length }})</h2>
          <button type="button" @click="addReference" class="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
            <Plus class="h-4 w-4 mr-1" /> Ajouter
          </button>
        </div>
        
        <p v-if="error.references" class="mb-4 text-sm text-red-600">{{ error.references[0] || 'Erreur dans les références' }}</p>
        
        <div v-if="references.length === 0" class="text-center py-6 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-300">
          <LinkIcon class="h-6 w-6 mx-auto text-slate-400 mb-2" />
          <p class="text-sm">Aucune référence ajoutée.</p>
        </div>
        
        <div class="space-y-3">
          <div v-for="(r, idx) in references" :key="idx" class="relative bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start gap-4">
            
            <div class="flex flex-col gap-1 mt-1">
              <button type="button" @click="moveReferenceUp(idx)" :disabled="idx === 0" class="text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronLeft class="h-4 w-4 rotate-90" /></button>
              <button type="button" @click="moveReferenceDown(idx)" :disabled="idx === references.length - 1" class="text-slate-400 hover:text-slate-700 disabled:opacity-30"><ChevronRight class="h-4 w-4 rotate-90" /></button>
            </div>
            
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="md:col-span-2">
                <input type="text" v-model="r.title" required placeholder="Titre de la référence *"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500 font-medium text-slate-900" />
              </div>
              <div>
                <input type="text" v-model="r.authors" placeholder="Auteurs (optionnel)"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              <div>
                <input type="text" v-model="r.source" required placeholder="Source (ex: CERF) *"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              <div>
                <input type="url" v-model="r.url" placeholder="URL (optionnel)"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
              <div>
                <input type="text" v-model="r.doi" placeholder="DOI (optionnel)"
                       class="block w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-blue-500" />
              </div>
            </div>

            <button type="button" @click="removeReference(idx)" class="p-2 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 class="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

    </form>
  </div>
</template>
