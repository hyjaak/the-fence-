export type PhaseRecord = {
  phaseId: number;
  title: string;
  filename: string;
  fullPath: string;
  content: string;
};

export type PhaseRegistry = {
  getPhaseById(id: number): PhaseRecord | undefined;
  hasPhase(id: number): boolean;
  listPhasesSorted(): PhaseRecord[];
};
