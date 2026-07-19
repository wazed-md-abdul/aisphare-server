import { Course } from "./course.model.js";

const SEED_COURSES = [
  {
    courseId: "CS-402",
    title: "Neural Networks and Deep Architecture",
    shortDescription: "Industrial-scale deep learning frameworks and self-evolving cognitive nodes.",
    fullDescription: "A radical departure from traditional computer science focused on the raw industrial application of large-scale cognitive models. Students dismantle existing LLM structures and rebuild them for specific institutional use cases across high-density theoretical loads and hackathon sprints.",
    department: "Computer Science",
    credits: 4,
    term: "Fall 2024",
    maxCapacity: 24,
    level: "PG",
    durationWeeks: 12,
    instructor: "Dr. Aris Thorne",
    imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "ETH-101",
    title: "Algorithmic Bias and Digital Sovereignty",
    shortDescription: "Philosophy of fairness, bias, and sovereignty in automated decision systems.",
    fullDescription: "Examines how algorithmic systems encode bias and the policy frameworks that govern digital sovereignty in academic and civic institutions.",
    department: "AI Ethics",
    credits: 3,
    term: "Fall 2024",
    maxCapacity: 60,
    level: "UG",
    durationWeeks: 8,
    instructor: "Prof. Julian Vark",
    imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "BIO-550",
    title: "Computational Genomics and Modeling",
    shortDescription: "Synthetic biology meets high-fidelity computational modeling.",
    fullDescription: "Covers computational genomics pipelines, sequence modeling, and synthetic biology simulation for research-grade institutional labs.",
    department: "Bio-Engineering",
    credits: 4,
    term: "Spring 2025",
    maxCapacity: 40,
    level: "PG",
    durationWeeks: 16,
    instructor: "Dr. Elena Kostic",
    imageUrl: "https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "CS-501",
    title: "Quantum Computing Models",
    shortDescription: "Algorithmic stability in high-entropy quantum environments.",
    fullDescription: "The future of algorithmic stability, quantum model shrinking, and deployment of high-fidelity AI on constrained campus hardware.",
    department: "Computer Science",
    credits: 4,
    term: "Fall 2024",
    maxCapacity: 20,
    level: "PHD",
    durationWeeks: 14,
    instructor: "Dr. Aris Thorne",
    imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "ART-210",
    title: "Generative Systems for Digital Arts",
    shortDescription: "Creative coding and generative pipelines for studio practice.",
    fullDescription: "Hands-on generative art systems: diffusion pipelines, procedural composition, and interactive installation for the digital arts studio.",
    department: "Digital Arts",
    credits: 3,
    term: "Spring 2025",
    maxCapacity: 35,
    level: "UG",
    durationWeeks: 10,
    instructor: "Prof. Mara Lindqvist",
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "ENGR-303",
    title: "Institutional AI Logic",
    shortDescription: "Designing the backbone of the next-generation autonomous university.",
    fullDescription: "System design for institutional AI: multi-agent governance clusters, fail-safes, and behavioral limiters for collegiate deployment.",
    department: "Computer Science",
    credits: 4,
    term: "Fall 2024",
    maxCapacity: 30,
    level: "PG",
    durationWeeks: 12,
    instructor: "Dr. Sarah Chen",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "AI-402",
    title: "Bio-Digital Interfaces",
    shortDescription: "Integrating neural nodes into biological sensory frameworks.",
    fullDescription: "Explores brain-computer interfaces, sensory augmentation, and the ethics of bio-digital integration in research settings.",
    department: "Bio-Engineering",
    credits: 4,
    term: "Spring 2025",
    maxCapacity: 25,
    level: "PHD",
    durationWeeks: 16,
    instructor: "Dr. Elena Kostic",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=600&auto=format&fit=crop",
  },
  {
    courseId: "ETH-220",
    title: "Autonomous Agent Ethics",
    shortDescription: "Hard-coding behavioral limiters into multi-agent clusters.",
    fullDescription: "Deep dive into agent alignment, safety constraints, and governance for autonomous multi-agent academic systems.",
    department: "AI Ethics",
    credits: 3,
    term: "Fall 2024",
    maxCapacity: 50,
    level: "UG",
    durationWeeks: 8,
    instructor: "Prof. Julian Vark",
    imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop",
  },
];

export async function seedDatabase() {
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      console.log("No courses found in database, seeding default courses...");
      await Course.insertMany(SEED_COURSES);
      console.log("Database seeded successfully with courses.");
    } else {
      console.log(`Database already has ${count} courses. Syncing course images...`);
      for (const sc of SEED_COURSES) {
        await Course.updateOne(
          { courseId: sc.courseId },
          { $set: { imageUrl: sc.imageUrl } }
        );
      }
      console.log("Course images synced in database.");
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
