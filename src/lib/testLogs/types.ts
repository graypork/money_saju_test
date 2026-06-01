export type TestLogExplanationSnapshot = {
  title: string;
  subtitle: string;
  firstImpression: string;
  moneyPattern: string;
  elementText: string;
  salText?: string;
  closingNote: string;
};

export type TestLogPayload = {
  createdAt: string;
  birthDate: string;
  calendarType: string;
  birthTime: string;
  gender: string;
  animalKey: string;
  animalTitle: string;
  resultSummary: string;
  firstImpressionSummary: string;
  resultExplanationSnapshot: TestLogExplanationSnapshot;
  dayStem: string;
  element: string;
  salList: string[];
  scoreSnapshot: Record<string, unknown>;
  copyVersion: string;
  logicVersion: string;
  userAgent: string;
  referrer: string;
  path: string;
};

export type TestLogRecord = TestLogPayload & {
  id?: string | number;
};

export type TestLogQuery = {
  q?: string;
  animalKey?: string;
  calendarType?: string;
  birthTime?: string;
  dayStem?: string;
  limit?: number;
};

export type TestLogStorage = {
  create(log: TestLogPayload): Promise<TestLogRecord>;
  list(query?: TestLogQuery): Promise<TestLogRecord[]>;
};
