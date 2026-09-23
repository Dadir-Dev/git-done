import {
  getProjectById,
  updateProject,
  deleteProject,
} from "@/src/actions/project.actions";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
} from "@/src/actions/task.actions";
import { notFound, redirect } from "next/navigation";
import DeleteConfirmationForm from "./delete-confirmation-form";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const result = await getProjectById(projectId);
  if (!result.success) notFound();
  const project = result.data;

  async function handleUpdateProject(formData: FormData) {
    "use server";
    await updateProject(projectId, {
      name: formData.get("name") as string,
      description: (formData.get("description") as string) || undefined,
    });
  }

  async function handleDeleteProject() {
    "use server";
    await deleteProject(projectId);
    redirect("/dashboard");
  }

  async function handleAddTask(formData: FormData) {
    "use server";
    await createTask(projectId, {
      title: formData.get("title") as string,
    });
  }

  return (
    <main className="min-h-screen bg-[#f5f7f4] text-[#17231e]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-12">
        <header className="mb-10 flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[#5d7767]">
              Project workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
              {project.name}
            </h1>
            {project.description && (
              <p className="mt-3 max-w-xl text-base leading-7 text-[#68766d]">
                {project.description}
              </p>
            )}
          </div>
          <div className="hidden rounded-full border border-[#cfdbd1] bg-white px-4 py-2 text-sm font-medium text-[#4f6658] shadow-sm sm:block">
            {project.tasks.length}{" "}
            {project.tasks.length === 1 ? "task" : "tasks"}
          </div>
        </header>

        <section className="mb-6 rounded-4xl border border-[#dce5dd] bg-white p-6 shadow-[0_20px_60px_-40px_#17231e] sm:p-9">
          <div className="mb-8 border-b border-[#e5ebe6] pb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78907e]">
              Project settings
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
              Edit details
            </h2>
          </div>
          <form action={handleUpdateProject} className="space-y-6">
            <label className="block space-y-2 text-sm font-medium text-[#405048]">
              Name
              <input
                name="name"
                defaultValue={project.name}
                required
                maxLength={100}
                className="w-full rounded-xl border border-[#d7e1d8] bg-[#fbfcfa] px-4 py-3 text-base text-[#17231e] outline-none transition focus:border-[#779e78] focus:ring-4 focus:ring-[#edf6df]"
              />
            </label>
            <label className="block space-y-2 text-sm font-medium text-[#405048]">
              Description
              <textarea
                name="description"
                defaultValue={project.description ?? ""}
                rows={4}
                maxLength={500}
                placeholder="What is this project trying to accomplish?"
                className="w-full resize-none rounded-xl border border-[#d7e1d8] bg-[#fbfcfa] px-4 py-3 text-base text-[#17231e] outline-none transition focus:border-[#779e78] focus:ring-4 focus:ring-[#edf6df]"
              />
            </label>
            <div className="flex justify-end border-t border-[#e5ebe6] pt-6">
              <button
                type="submit"
                className="rounded-xl bg-[#173329] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#285341]"
              >
                Save changes
              </button>
            </div>
          </form>
          <div className="mt-6 border-t border-[#e5ebe6] pt-6">
            <DeleteConfirmationForm
              action={handleDeleteProject}
              itemName={project.name}
              buttonLabel="Delete project"
            />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
          <aside className="rounded-4xl bg-[#173329] p-7 text-[#f4f7f2] shadow-[0_24px_60px_-30px_#173329] sm:p-8">
            <div className="mb-14 flex items-center justify-between">
              <span className="text-lg font-semibold tracking-[-0.02em]">
                PT / 01
              </span>
              <span className="h-3 w-3 rounded-full bg-[#b8df80] shadow-[0_0_0_5px_rgba(184,223,128,0.15)]" />
            </div>
            <p className="text-sm leading-6 text-[#b9c9be]">
              Add the next action for this project and move it through your
              workflow.
            </p>
            <form action={handleAddTask} className="mt-7 space-y-3">
              <label
                htmlFor="task-title"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b8df80]"
              >
                New task
              </label>
              <input
                id="task-title"
                name="title"
                placeholder="Task title"
                required
                className="w-full rounded-xl border border-[#466254] bg-[#24483a] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#8fa797] focus:border-[#b8df80]"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-[#b8df80] px-4 py-3 text-sm font-semibold text-[#173329] transition hover:bg-[#d0efa6]"
              >
                Add task
              </button>
            </form>
            <div className="mt-16 border-t border-[#466254] pt-5 text-xs leading-5 text-[#9eb4a4]">
              TODO / IN PROGRESS / COMPLETE
              <br />
              Select a task to advance it.
            </div>
          </aside>

          <section className="rounded-4xl border border-[#dce5dd] bg-white p-6 shadow-[0_20px_60px_-40px_#17231e] sm:p-9">
            <div className="mb-8 flex items-end justify-between gap-4 border-b border-[#e5ebe6] pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#78907e]">
                  Project tasks
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                  Current work
                </h2>
              </div>
              <span className="text-sm text-[#748078]">
                {project.tasks.length} total
              </span>
            </div>

            {project.tasks.length > 0 ?
              <ul className="divide-y divide-[#e5ebe6]">
                {project.tasks.map((task) => {
                  const next =
                    task.status === "TODO" ? "IN_PROGRESS"
                    : task.status === "IN_PROGRESS" ? "COMPLETE"
                    : "TODO";

                  return (
                    <li
                      key={task.id}
                      className="flex flex-col gap-4 py-5 first:pt-0 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-[#173329]">
                          {task.title}
                        </h3>
                        <span className="mt-2 inline-flex rounded-full bg-[#edf6df] px-3 py-1.5 text-xs font-semibold text-[#4d7133]">
                          {task.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex flex-col items-stretch gap-3 sm:items-end">
                        <form
                          action={async () => {
                            "use server";
                            await updateTaskStatus(task.id, next);
                          }}
                        >
                          <button
                            type="submit"
                            className="w-full rounded-xl border border-[#cfdbd1] px-4 py-2.5 text-sm font-semibold text-[#405048] transition hover:border-[#779e78] hover:bg-[#f5f8f4] sm:w-auto"
                          >
                            Advance status
                          </button>
                        </form>
                        <DeleteConfirmationForm
                          action={async () => {
                            "use server";
                            await deleteTask(task.id);
                          }}
                          itemName={task.title}
                          buttonLabel="Delete"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            : <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-[#d7e1d8] bg-[#fbfcfa] px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#edf6df] text-2xl text-[#63874a]">
                  +
                </div>
                <h3 className="text-lg font-semibold">No tasks yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-[#748078]">
                  Add the first task from the panel to make progress visible
                  here.
                </p>
              </div>
            }
          </section>
        </section>
      </div>
    </main>
  );
}
