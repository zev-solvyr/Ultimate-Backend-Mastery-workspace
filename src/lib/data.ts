import roadmapData from "@/data/roadmap.json";
import projectsData from "@/data/projects.json";
import skillMappingData from "@/data/skill-mapping.json";
import buildOrderData from "@/data/build-order.json";
import type {
  Roadmap,
  Project,
  SkillProjectMapping,
  BuildOrderStep,
  Topic,
  RoadmapLevel,
} from "@/types";

export const roadmap = roadmapData as Roadmap;
export const projects = projectsData as Project[];
export const skillMappings = skillMappingData as SkillProjectMapping[];
export const buildOrder = buildOrderData as BuildOrderStep[];

export function getAllTopics(): Topic[] {
  return roadmap.levels.flatMap((l) => l.topics);
}

export function getTopicById(id: string): Topic | undefined {
  return getAllTopics().find((t) => t.id === id);
}

export function getLevelByNumber(level: number): RoadmapLevel | undefined {
  return roadmap.levels.find((l) => l.level === level);
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function getTopicsForProject(projectId: string): SkillProjectMapping[] {
  return skillMappings.filter((m) =>
    m.projects.some((p) => p.projectId === projectId)
  );
}

export function getMappingForTopic(topicId: string): SkillProjectMapping | undefined {
  return skillMappings.find((m) => m.topicId === topicId);
}

export function calculateRoadmapProgress(
  topicProgress: Record<string, number>
): number {
  const topics = getAllTopics();
  if (topics.length === 0) return 0;
  const total = topics.reduce(
    (sum, t) => sum + (topicProgress[t.id] ?? t.progress.completionPercent),
    0
  );
  return total / topics.length;
}

export function calculateProjectReadiness(
  topicProgress: Record<string, number>,
  projectId: string
): number {
  const mappings = getTopicsForProject(projectId);
  if (mappings.length === 0) return 0;
  const total = mappings.reduce((sum, m) => {
    const progress = topicProgress[m.topicId] ?? 0;
    return sum + progress;
  }, 0);
  return total / mappings.length;
}
