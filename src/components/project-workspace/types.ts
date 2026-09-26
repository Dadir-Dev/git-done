export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETE";

export type ProjectTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
};

export type ProjectDetail = {
  id: string;
  name: string;
  description: string | null;
  tasks: ProjectTask[];
};