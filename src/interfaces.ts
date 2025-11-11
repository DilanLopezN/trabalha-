export type UserRole = "PRESTADOR" | "EMPREGADOR";

export type HighlightPlanCode = "BRONZE" | "PRATA" | "OURO" | "PLATINA";

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface Availability {
  [key: string]: TimeSlot[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  whatsapp?: string;
  cnpj?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerProfile {
  resumeUrl: boolean;
  id: string;
  userId: string;
  categoryId: string;
  category?: Category;
  averagePrice: number;
  availability: Availability;
  description: string;
  user?: User;
  activeHighlight?: Highlight;
}

export interface EmployerProfile {
  id: string;
  userId: string;
  advertisedService: string;
  budget: number;
  categoryId?: string;
  category?: Category;
  availability: Availability;
  user?: User;
  activeHighlight?: Highlight;
}

export interface HighlightPlan {
  id: string;
  code: HighlightPlanCode;
  price: number;
  durationDays: number;
  priority: number;
}

export interface Highlight {
  id: string;
  userId: string;
  planId: string;
  plan?: HighlightPlan;
  startsAt: Date;
  endsAt: Date;
  status: "ACTIVE" | "EXPIRED";
}

export interface Ad {
  id: string;
  ownerId: string;
  planId: string;
  plan?: HighlightPlan;
  title: string;
  content: string;
  imageUrl?: string;
  target: "ALL" | "WORKERS" | "EMPLOYERS";
  startsAt: Date;
  endsAt: Date;
  status: "ACTIVE" | "EXPIRED";
}

export interface SearchFilters {
  type: "workers" | "employers";
  categoryId?: string;
  availableAt?: string;
  minPrice?: number;
  maxPrice?: number;
  minBudget?: number;
  showVagas?: boolean;
  maxBudget?: number;
  q?: string;
}

export interface SearchResult {
  image?: string;
  id: string;
  name: string;
  role: UserRole;
  imageUrl?: string;
  whatsapp?: string;
  profile: WorkerProfile | EmployerProfile;
  highlightPlan?: HighlightPlanCode;
  relevanceScore: number;
}
