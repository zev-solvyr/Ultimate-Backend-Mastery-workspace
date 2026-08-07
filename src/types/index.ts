export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface ProgressTracking {
  status: "not_started" | "in_progress" | "completed";
  completionPercent: number;
  lastStudied?: string;
  timeSpentMinutes: number;
}

export interface Topic {
  id: string;
  title: string;
  overview: string;
  whyItExists: string;
  internalWorking: string;
  realWorldUsage: string;
  codeExamples: { title: string; language: string; code: string }[];
  bestPractices: string[];
  commonMistakes: string[];
  interviewQuestions: { question: string; answer: string }[];
  practiceExercises: { title: string; description: string; difficulty: Difficulty }[];
  estimatedLearningTime: string;
  difficulty: Difficulty;
  prerequisites: string[];
  links: { title: string; url: string; type: "docs" | "video" | "article" | "book" }[];
  personalNotes: string;
  progress: ProgressTracking;
  usedInProjects: string[];
}

export interface RoadmapLevel {
  level: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  xpReward: number;
  topics: Topic[];
}

export interface Roadmap {
  version: string;
  title: string;
  description: string;
  totalLevels: number;
  levels: RoadmapLevel[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpBonus: number;
}

export interface UserStats {
  totalXp: number;
  level: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  achievements: Achievement[];
  heatmap: Record<string, number>;
  companyReadiness: {
    amazon: number;
    google: number;
    microsoft: number;
    netflix: number;
    stripe: number;
    overall: number;
  };
}

export interface Microservice {
  name: string;
  description: string;
  tech: string[];
  responsibilities: string[];
  ports: number[];
}

export interface KafkaTopic {
  name: string;
  description: string;
  producers: string[];
  consumers: string[];
  schema: string;
}

export interface ApiContract {
  service: string;
  endpoint: string;
  method: string;
  description: string;
  request?: string;
  response?: string;
}

export interface DatabaseTable {
  name: string;
  description: string;
  columns: { name: string; type: string; constraints?: string }[];
  indexes?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  order: number;
  unlockedTopics: string[];
  resumeLine: string;
  deliverables: string[];
  estimatedWeeks: number;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domain: string;
  difficulty: Difficulty;
  estimatedDuration: string;
  techStack: string[];
  microservices: Microservice[];
  folderStructure: { path: string; description: string }[];
  databases: DatabaseTable[];
  eventFlows: { name: string; steps: string[] }[];
  apiContracts: ApiContract[];
  kafkaTopics: KafkaTopic[];
  redisUsage: { key: string; pattern: string; ttl: string; purpose: string }[];
  securityArchitecture: { layer: string; implementation: string }[];
  deploymentArchitecture: { component: string; description: string }[];
  cicdPipeline: { stage: string; tools: string[]; description: string }[];
  monitoringStack: { tool: string; purpose: string; metrics: string[] }[];
  testingStrategy: { type: string; tools: string[]; coverage: string }[];
  milestones: Milestone[];
  color: string;
  icon: string;
}

export interface SkillProjectMapping {
  topicId: string;
  topicTitle: string;
  level: number;
  projects: {
    projectId: string;
    projectName: string;
    implementation: string;
    files: string[];
    phase: string;
  }[];
}

export interface BuildOrderStep {
  order: number;
  projectId: string;
  milestoneId: string;
  title: string;
  description: string;
  topicIds: string[];
  teamPhase: string;
  dependencies: number[];
}
