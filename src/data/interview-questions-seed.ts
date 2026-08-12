import type { Company, QuestionSet, InterviewQuestion, InterviewTopic } from "@/types";

export const defaultCompanies: Company[] = [
  {
    id: "company-general-legacy",
    name: "General / Core Topics",
    description: "Core technical interview questions organized by Java & Backend Engineering topics",
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "company-tcs",
    name: "TCS",
    description: "Tata Consultancy Services Java Backend & Systems Technical Interviews",
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "company-infosys",
    name: "Infosys",
    description: "Infosys Java & Microservices Technical Rounds",
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
];

export const defaultQuestionSets: QuestionSet[] = [
  {
    id: "set-tcs-java-technical",
    companyId: "company-tcs",
    title: "Java Backend Technical Round",
    role: "Java Developer",
    experience: "2 YOE",
    interviewRound: "Technical Round 1",
    source: "LinkedIn",
    sourceUrl: "https://linkedin.com",
    notes: "Focused on Core Java, HashMap internals, Spring Boot @Transactional, and Multithreading",
    rawContent: "1. What is the difference between == and equals() in Java?\n2. Explain the internal working of HashMap in Java.\n3. What is @Transactional in Spring Boot?",
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "set-infosys-java-interview",
    companyId: "company-infosys",
    title: "Java Backend Interview",
    role: "Senior Systems Engineer",
    experience: "3 YOE",
    interviewRound: "Technical Round",
    source: "Interview Experience",
    notes: "HashMap internals and REST API design questions",
    rawContent: "1. Explain the internal working of HashMap in Java.\n2. How does Garbage Collection work in JVM?",
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
];

export const defaultInterviewQuestions: InterviewQuestion[] = [
  {
    id: "iq-seed-1",
    questionSetId: "set-tcs-java-technical",
    question: "What is the difference between == and equals() in Java?",
    answer: "In Java, '==' compares reference equality (memory addresses) for objects and primitive values directly. The 'equals()' method compares logical value equality when overridden by a class (such as String, Integer, or custom domain objects). By default, Object.equals() uses '=='.",
    order: 1,
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "iq-seed-2",
    questionSetId: "set-tcs-java-technical",
    question: "Explain the internal working of HashMap in Java.",
    answer: "HashMap uses an array of Node buckets (Node<K,V>[] table). Keys are hashed using key.hashCode() combined with a high-bit spread function (h ^ (h >>> 16)). Index is calculated as (n - 1) & hash. Collisions are handled using a linked list until bucket length reaches 8 (TREEIFY_THRESHOLD) and array capacity >= 64, at which point it converts to a Red-Black Tree (O(log n) lookup). Resizing doubles array capacity when size > threshold (capacity * loadFactor, default 0.75).",
    order: 2,
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
  {
    id: "iq-seed-3",
    questionSetId: "set-infosys-java-interview",
    question: "Explain the internal working of HashMap in Java.",
    answer: "HashMap uses hashing to store key-value pairs in buckets. When a collision occurs, entries are stored in a linked list or red-black tree.",
    order: 1,
    createdAt: "2026-08-10T12:00:00.000Z",
    updatedAt: "2026-08-10T12:00:00.000Z",
  },
];

// Preserved for legacy topic migration
export const defaultInterviewTopics: InterviewTopic[] = [
  { id: "core-java", name: "Core Java", description: "Fundamentals, language features, and core APIs", order: 1 },
  { id: "collections", name: "Collections", description: "List, Map, Set internals and custom implementations", order: 2 },
  { id: "multithreading-concurrency", name: "Multithreading & Concurrency", description: "Locks, Executors, Atomics, and Memory Visibility", order: 3 },
  { id: "spring-boot", name: "Spring Boot", description: "Auto-configuration, Starters, Actuator, and Profiles", order: 4 },
  { id: "system-design", name: "System Design", description: "Scalability, Caching, Rate limiting, Load balancing, and Partitioning", order: 5 },
];
