export type ProjectSummary = {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  completedCount: number;
};

export type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
