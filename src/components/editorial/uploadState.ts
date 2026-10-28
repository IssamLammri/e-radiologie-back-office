import type { InjectionKey, Ref } from "vue";

export const pendingUploadsKey: InjectionKey<Ref<number>> =
  Symbol("pendingUploads");
