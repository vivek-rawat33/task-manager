import * as React from "react";
import { createTeamTask, deleteTeamTask, updateTeamTask } from "@/api/taskApi";
import { cn } from "@/lib/utils";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GripVerticalIcon,
  CircleCheckIcon,
  LoaderIcon,
  EllipsisVerticalIcon,
  Columns3Icon,
  ChevronDownIcon,
  PlusIcon,
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsRightIcon,
  CircleIcon,
  SearchIcon,
  CalendarIcon,
} from "lucide-react";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function DragHandle({ id }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function getTodayDateInputValue() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split("T")[0];
}
function formatDeadline(value) {
  if (!value) return "No deadline";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPriorityStyles(priority) {
  if (priority === "High") {
    return {
      badge:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300",
      dot: "bg-red-500",
    };
  }

  if (priority === "Medium") {
    return {
      badge:
        "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300",
      dot: "bg-purple-500",
    };
  }

  return {
    badge:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300",
    dot: "bg-blue-500",
  };
}

const columns = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableSorting: false,
    enableHiding: false,
    meta: {
      headerClassName: "w-10",
      cellClassName: "w-10",
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      headerClassName: "w-10",
      cellClassName: "w-10",
    },
  },
  {
    accessorKey: "header",
    header: "Task",
    cell: ({ row, table }) => {
      return (
        <TableCellViewer
          item={row.original}
          onSaveTask={table.options.meta?.updateTask}
          members={table.options.meta?.members || []}
          canManageTasks={table.options.meta?.canManageTasks}
          isMember={table.options.meta?.isMember}
          currentUserId={table.options.meta?.currentUserId}
        />
      );
    },
    enableHiding: false,
    meta: {
      headerClassName: "w-[280px] min-w-[280px] max-w-[280px]",
      cellClassName: "w-[280px] min-w-[280px] max-w-[280px] overflow-hidden",
    },
  },
  {
    accessorKey: "type",
    header: "Category",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="max-w-32.5 truncate px-2 text-muted-foreground"
        title={row.original.type}
      >
        {row.original.type}
      </Badge>
    ),
    meta: {
      headerClassName: "w-[170px]",
      cellClassName: "w-[170px]",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant="outline"
          className="gap-1.5 px-1.5 text-muted-foreground"
        >
          {status === "Done" ? (
            <CircleCheckIcon className="size-3.5 fill-green-500 dark:fill-green-400" />
          ) : status === "In Process" ? (
            <LoaderIcon className="size-3.5" />
          ) : (
            <CircleIcon className="size-3.5" />
          )}

          {status}
        </Badge>
      );
    },
    meta: {
      headerClassName: "w-[150px]",
      cellClassName: "w-[150px]",
    },
  },
  {
    accessorKey: "target",
    header: "Deadline",
    cell: ({ row }) => {
      const deadline = row.original.target;

      return (
        <div className="text-right text-sm text-muted-foreground">
          {formatDeadline(deadline)}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[150px] text-right",
      cellClassName: "w-[150px] text-right",
    },
  },
  {
    accessorKey: "limit",
    header: "Priority",
    cell: ({ row }) => {
      const priority = row.original.limit || "Medium";
      const styles = getPriorityStyles(priority);

      return (
        <div className="flex justify-end">
          <Badge
            variant="outline"
            className={`gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${styles.badge}`}
          >
            <span className={`size-1.5 rounded-full ${styles.dot}`} />
            {priority}
          </Badge>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[130px] text-right",
      cellClassName: "w-[130px] text-right",
    },
  },
  {
    accessorKey: "reviewer",
    header: "Assignee",

    cell: ({ row, table }) => {
      const members = table.options.meta?.members || [];

      return (
        <Select
          value={String(row.original.assignedToId || "__unassigned")}
          disabled={!table.options.meta?.canManageTasks}
          onValueChange={(value) => {
            const selectedMember = members.find(
              (member) => String(member.id) === String(value),
            );

            table.options.meta?.updateTask(row.original.id, {
              assignedToId: value === "__unassigned" ? "" : value,

              reviewer:
                value === "__unassigned"
                  ? "Unassigned"
                  : selectedMember?.name || "Unknown user",
            });
          }}
        >
          <SelectTrigger className="w-full min-w-40 lg:min-w-0">
            <SelectValue placeholder="Assign member" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="__unassigned">Unassigned</SelectItem>

            {members.map((member) => (
              <SelectItem key={member.id} value={String(member.id)}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },

    meta: {
      headerClassName: "w-[180px] min-w-[180px] lg:w-auto lg:min-w-0",
      cellClassName: "w-[180px] min-w-[180px] lg:w-auto lg:min-w-0",
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
              size="icon"
            >
              <EllipsisVerticalIcon />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {(table.options.meta?.canManageTasks ||
              (table.options.meta?.isMember &&
                String(row.original.assignedToId) ===
                  String(table.options.meta?.currentUserId))) && (
              <DropdownMenuItem
                onClick={() =>
                  table.options.meta?.markTaskDone(row.original.id)
                }
              >
                Mark completed
              </DropdownMenuItem>
            )}

            {table.options.meta?.canManageTasks && (
              <>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    table.options.meta?.deleteTask(row.original.id)
                  }
                >
                  Delete task
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: {
      headerClassName: "w-12",
      cellClassName: "w-12",
    },
  },
];

function DraggableRow({ row }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cn(
            "h-14 whitespace-nowrap px-4 align-middle",
            cell.column.columnDef.meta?.cellClassName,
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

const emptyTask = {
  header: "",
  type: "Frontend",
  status: "Todo",
  target: "",
  limit: "Medium",
  reviewer: "Unassigned",
  assignedToId: "",
};
function toBackendStatus(status) {
  if (status === "Todo") return "pending";
  if (status === "In Process") return "in-progress";
  if (status === "Done") return "completed";
  return "pending";
}

function toBackendPriority(priority) {
  if (priority === "High") return "high";
  if (priority === "Medium") return "medium";
  if (priority === "Low") return "low";
  return "medium";
}

function toFrontendStatus(status) {
  if (status === "pending") return "Todo";
  if (status === "in-progress") return "In Process";
  if (status === "completed") return "Done";
  return status || "Todo";
}

function toFrontendPriority(priority) {
  if (priority === "high") return "High";
  if (priority === "medium") return "Medium";
  if (priority === "low") return "Low";
  return priority || "Medium";
}

function formatTaskForTable(task) {
  const assignedToId =
    typeof task.assignedTo === "object" && task.assignedTo !== null
      ? String(task.assignedTo._id || task.assignedTo.id || "")
      : task.assignedTo
        ? String(task.assignedTo)
        : "";

  return {
    id: task._id || task.id,
    header: task.title || "Untitled Task",
    type: task.category || "General",
    status: toFrontendStatus(task.status),
    target: task.dueDate ? task.dueDate.split("T")[0] : "",
    limit: toFrontendPriority(task.priority),
    reviewer: task.assignedTo?.name || "Unassigned",
    assignedToId,
  };
}
export function DataTable({
  data: initialData,
  teamId,
  members = [],
  currentUserRole,
  currentUserId = "",
}) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [data, setData] = React.useState(() => initialData || []);
  const [view, setView] = React.useState("all");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isAddTaskOpen, setIsAddTaskOpen] = React.useState(false);
  const [newTask, setNewTask] = React.useState(emptyTask);
  const isMobile = useIsMobile();
  const canManageTasks =
    currentUserRole === "owner" || currentUserRole === "admin";

  const isMember = currentUserRole === "member";
  const isViewer = currentUserRole === "viewer";
  React.useEffect(() => {
    setData(initialData || []);
  }, [initialData]);

  const sortableId = React.useId();

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const counts = React.useMemo(() => {
    return {
      all: data.length,
      inProcess: data.filter((task) => task.status === "In Process").length,
      completed: data.filter((task) => task.status === "Done").length,
      unassigned: data.filter(
        (task) => !task.assignedToId || task.reviewer === "Unassigned",
      ).length,
    };
  }, [data]);

  const filteredData = React.useMemo(() => {
    let tasks = data;

    if (view === "in-process") {
      tasks = tasks.filter((task) => task.status === "In Process");
    }

    if (view === "completed") {
      tasks = tasks.filter((task) => task.status === "Done");
    }

    if (view === "unassigned") {
      tasks = tasks.filter(
        (task) => !task.assignedToId || task.reviewer === "Unassigned",
      );
    }

    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return tasks;
    }

    return tasks.filter((task) => {
      const searchableText = [
        task.header,
        task.type,
        task.status,
        task.target,
        task.limit,
        task.reviewer,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [data, view, searchQuery]);

  const dataIds = React.useMemo(
    () => filteredData?.map(({ id }) => id) || [],
    [filteredData],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    meta: {
      deleteTask,
      markTaskDone,
      updateTask,
      members,
      canManageTasks,
      isMember,
      isViewer,
      currentUserId,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setData((currentData) => {
        const oldIndex = currentData.findIndex((task) => task.id === active.id);
        const newIndex = currentData.findIndex((task) => task.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return currentData;
        }

        return arrayMove(currentData, oldIndex, newIndex);
      });
    }
  }
  async function handleAddTask(e) {
    e.preventDefault();

    const taskTitle = newTask.header.trim();

    if (!taskTitle) {
      toast.error("Task title is required");
      return;
    }

    if (!teamId) {
      toast.error("Team ID missing");
      return;
    }

    try {
      const taskPayload = {
        title: taskTitle,
        description: "",
        category: newTask.type,
        status: toBackendStatus(newTask.status),
        priority: toBackendPriority(newTask.limit),
        dueDate: newTask.target || null,
        assignedTo: newTask.assignedToId || null,
      };

      const createdTask = await createTeamTask(teamId, taskPayload);

      const selectedMember = members.find(
        (member) => String(member.id) === String(newTask.assignedToId),
      );

      const formattedTask = {
        ...formatTaskForTable(createdTask),
        assignedToId: newTask.assignedToId || "",
        reviewer: newTask.assignedToId
          ? selectedMember?.name || "Unknown user"
          : "Unassigned",
      };

      setData((currentData) => [formattedTask, ...currentData]);
      setNewTask(emptyTask);
      setIsAddTaskOpen(false);
      setView("all");
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));

      toast.success("Task created successfully");
    } catch (error) {
      console.error("Create task failed:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  }
  async function deleteTask(taskId) {
    if (!teamId) {
      toast.error("Team ID missing");
      return;
    }

    try {
      await deleteTeamTask(teamId, taskId);

      setData((currentData) =>
        currentData.filter((task) => String(task.id) !== String(taskId)),
      );

      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Delete task failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete task");
    }
  }

  async function markTaskDone(taskId) {
    await updateTask(taskId, {
      status: "Done",
    });
  }

  async function updateTask(taskId, updatedTask) {
    if (!teamId) {
      toast.error("Team ID missing");
      return;
    }

    const previousData = data;

    const currentTask = data.find((task) => String(task.id) === String(taskId));

    if (!currentTask) {
      toast.error("Task not found");
      return;
    }

    const mergedTask = {
      ...currentTask,
      ...updatedTask,
    };

    const selectedMember = members.find(
      (member) => String(member.id) === String(mergedTask.assignedToId),
    );

    const updatedUiTask = {
      ...mergedTask,
      assignedToId: mergedTask.assignedToId || "",
      reviewer: mergedTask.assignedToId
        ? selectedMember?.name || mergedTask.reviewer || "Unknown user"
        : "Unassigned",
    };

    // immediately update frontend
    setData((currentData) =>
      currentData.map((task) =>
        String(task.id) === String(taskId) ? updatedUiTask : task,
      ),
    );

    try {
      const payload = {
        title: mergedTask.header,
        description: mergedTask.description || "",
        category: mergedTask.type,
        status: toBackendStatus(mergedTask.status),
        priority: toBackendPriority(mergedTask.limit),
        dueDate: mergedTask.target || null,
        assignedTo: mergedTask.assignedToId || null,
      };
      await updateTeamTask(teamId, taskId, payload);

      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Update task failed:", error);

      // rollback if backend fails
      setData(previousData);

      toast.error(error.response?.data?.message || "Failed to update task");
    }
  }

  return (
    <Tabs
      value={view}
      onValueChange={(value) => {
        setView(value);
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
        setRowSelection({});
      }}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>

        <Select value={view} onValueChange={setView}>
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Select a view" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="in-process">In Process</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="unassigned">Unassigned</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <TabsList className="hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="all">
            All Tasks <Badge variant="secondary">{counts.all}</Badge>
          </TabsTrigger>

          <TabsTrigger value="in-process">
            In Process <Badge variant="secondary">{counts.inProcess}</Badge>
          </TabsTrigger>

          <TabsTrigger value="completed">
            Completed <Badge variant="secondary">{counts.completed}</Badge>
          </TabsTrigger>

          <TabsTrigger value="unassigned">
            Unassigned <Badge variant="secondary">{counts.unassigned}</Badge>
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          <div className="relative hidden md:block">
            <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((prev) => ({ ...prev, pageIndex: 0 }));
                setRowSelection({});
              }}
              placeholder="Search tasks..."
              className="h-8 w-55 pl-8 lg:w-65"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3Icon data-icon="inline-start" />
                Columns
                <ChevronDownIcon data-icon="inline-end" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  const columnLabels = {
                    header: "Task",
                    type: "Category",
                    status: "Status",
                    target: "Deadline",
                    limit: "Priority",
                    reviewer: "Assigned To",
                  };

                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {columnLabels[column.id] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>

          {canManageTasks &&
            (isMobile ? (
              <Drawer open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DrawerTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusIcon />
                    <span className="hidden lg:inline">Add Task</span>
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="max-h-[85vh]">
                  <DrawerHeader className="gap-1 text-left">
                    <DrawerTitle>Add New Task</DrawerTitle>
                    <DrawerDescription>
                      Create a task, assign it to a member and set its priority.
                    </DrawerDescription>
                  </DrawerHeader>

                  <form
                    onSubmit={handleAddTask}
                    className="flex flex-col gap-4 overflow-y-auto px-4 pb-4 text-sm"
                  >
                    <div className="flex flex-col gap-3">
                      <Label htmlFor="new-task-title">Task Title</Label>
                      <Input
                        id="new-task-title"
                        value={newTask.header}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            header: e.target.value,
                          }))
                        }
                        placeholder="Example: Build dashboard layout"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="new-task-category">Category</Label>
                        <Select
                          value={newTask.type}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              type: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-category"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Frontend">Frontend</SelectItem>
                              <SelectItem value="Backend">Backend</SelectItem>
                              <SelectItem value="UI">UI</SelectItem>
                              <SelectItem value="Feature">Feature</SelectItem>
                              <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                              <SelectItem value="Planning">Planning</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-3">
                        <Label htmlFor="new-task-status">Status</Label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              status: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-status"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="Todo">Todo</SelectItem>
                              <SelectItem value="In Process">
                                In Process
                              </SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-3">
                        <Label htmlFor="new-task-deadline">Deadline</Label>
                        <Input
                          id="new-task-deadline"
                          type="date"
                          min={getTodayDateInputValue()}
                          value={newTask.target}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              target: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <Label htmlFor="new-task-priority">Priority</Label>
                        <Select
                          value={newTask.limit}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              limit: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-priority"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="assignedTo">Assign to</Label>

                      <Select
                        value={String(newTask.assignedToId || "__unassigned")}
                        onValueChange={(value) => {
                          const selectedMember = members.find(
                            (member) => String(member.id) === String(value),
                          );

                          setNewTask((prev) => ({
                            ...prev,
                            assignedToId: value === "__unassigned" ? "" : value,
                            reviewer:
                              value === "__unassigned"
                                ? "Unassigned"
                                : selectedMember?.name || "Unknown user",
                          }));
                        }}
                      >
                        <SelectTrigger id="assignedTo" className="w-full">
                          <SelectValue placeholder="Assign member" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="__unassigned">
                            Unassigned
                          </SelectItem>

                          {members.map((member) => (
                            <SelectItem
                              key={member.id}
                              value={String(member.id)}
                            >
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <DrawerFooter className="px-0 pt-2">
                      <Button type="submit">Create Task</Button>

                      <DrawerClose asChild>
                        <Button type="button" variant="outline">
                          Cancel
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </form>
                </DrawerContent>
              </Drawer>
            ) : (
              <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <PlusIcon />
                    <span className="hidden lg:inline">Add Task</span>
                  </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-170 rounded-2xl border bg-background p-0 shadow-2xl">
                  <DialogHeader className="px-6 pt-6 pb-2 text-left">
                    <DialogTitle>Add New Task</DialogTitle>
                    <DialogDescription>
                      Create a task, assign it to a member and set its priority.
                    </DialogDescription>
                  </DialogHeader>

                  <form
                    onSubmit={handleAddTask}
                    className="space-y-4 px-6 pb-6 text-sm"
                  >
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="new-task-title-desktop">Task Title</Label>
                      <Input
                        id="new-task-title-desktop"
                        value={newTask.header}
                        onChange={(e) =>
                          setNewTask((prev) => ({
                            ...prev,
                            header: e.target.value,
                          }))
                        }
                        placeholder="Example: Build dashboard layout"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-task-category-desktop">
                          Category
                        </Label>
                        <Select
                          value={newTask.type}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              type: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-category-desktop"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="General">General</SelectItem>
                              <SelectItem value="Frontend">Frontend</SelectItem>
                              <SelectItem value="Backend">Backend</SelectItem>
                              <SelectItem value="UI">UI</SelectItem>
                              <SelectItem value="Feature">Feature</SelectItem>
                              <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                              <SelectItem value="Planning">Planning</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-task-status-desktop">Status</Label>
                        <Select
                          value={newTask.status}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              status: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-status-desktop"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="Todo">Todo</SelectItem>
                              <SelectItem value="In Process">
                                In Process
                              </SelectItem>
                              <SelectItem value="Done">Done</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-task-deadline-desktop">
                          Deadline
                        </Label>
                        <Input
                          id="new-task-deadline-desktop"
                          type="date"
                          min={getTodayDateInputValue()}
                          value={newTask.target}
                          onChange={(e) =>
                            setNewTask((prev) => ({
                              ...prev,
                              target: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Label htmlFor="new-task-priority-desktop">
                          Priority
                        </Label>
                        <Select
                          value={newTask.limit}
                          onValueChange={(value) =>
                            setNewTask((prev) => ({
                              ...prev,
                              limit: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            id="new-task-priority-desktop"
                            className="w-full"
                          >
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="High">High</SelectItem>
                              <SelectItem value="Medium">Medium</SelectItem>
                              <SelectItem value="Low">Low</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="new-task-assigned-to-desktop">
                        Assigned To
                      </Label>

                      <Select
                        value={String(newTask.assignedToId || "__unassigned")}
                        disabled={!table.options.meta?.canManageTasks}
                        onValueChange={(value) => {
                          const selectedMember = members.find(
                            (member) => String(member.id) === String(value),
                          );

                          setNewTask((prev) => ({
                            ...prev,
                            assignedToId: value === "__unassigned" ? "" : value,
                            reviewer:
                              value === "__unassigned"
                                ? "Unassigned"
                                : selectedMember?.name || "Unknown user",
                          }));
                        }}
                      >
                        <SelectTrigger
                          id="new-task-assigned-to-desktop"
                          className="w-full"
                        >
                          <SelectValue placeholder="Assign member" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="__unassigned">
                              Unassigned
                            </SelectItem>

                            {members.map((member) => (
                              <SelectItem
                                key={member.id}
                                value={String(member.id)}
                              >
                                {member.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddTaskOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">Create Task</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ))}
        </div>
      </div>

      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="relative md:hidden">
          <SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
              setRowSelection({});
            }}
            placeholder="Search tasks..."
            className="h-9 pl-8"
          />
        </div>
        <div className="overflow-x-auto rounded-lg border lg:overflow-x-hidden">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table className="min-w-[1100px] table-fixed lg:w-full lg:min-w-0 lg:table-auto">
              <TableHeader className="sticky top-0 z-10 bg-muted">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          key={header.id}
                          colSpan={header.colSpan}
                          className={cn(
                            "h-12 whitespace-nowrap px-4 align-middle",
                            header.column.columnDef.meta?.headerClassName,
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>

        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} task(s) selected.
          </div>

          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>

              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>

                <SelectContent side="top">
                  <SelectGroup>
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </div>

            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeftIcon />
              </Button>

              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeftIcon />
              </Button>

              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRightIcon />
              </Button>

              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRightIcon />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  );
}

function TableCellViewer({
  item,
  onSaveTask,
  members = [],
  canManageTasks = false,
  isMember = false,
  currentUserId = "",
}) {
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(false);
  const canMemberUpdateStatus =
    isMember && String(item.assignedToId) === String(currentUserId);

  const canEditFullTask = canManageTasks;
  const canUpdateOnlyStatus = canMemberUpdateStatus && !canManageTasks;
  const [formData, setFormData] = React.useState({
    header: item.header,
    type: item.type,
    status: item.status,
    target: item.target,
    limit: item.limit,
    reviewer: item.reviewer,
    assignedToId: item.assignedToId || "",
  });

  React.useEffect(() => {
    setFormData({
      header: item.header,
      type: item.type,
      status: item.status,
      target: item.target,
      limit: item.limit,
      reviewer: item.reviewer,
      assignedToId: item.assignedToId || "",
    });
  }, [item]);

  const deadlineInputRef = React.useRef(null);

  function openDeadlinePicker() {
    const input = deadlineInputRef.current;

    if (!input || !canEditFullTask) return;

    if (typeof input.showPicker === "function") {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  }

  function handleSaveChanges(e) {
    e.preventDefault();

    const taskTitle = formData.header.trim();

    if (!taskTitle) {
      toast.error("Task title is required");
      return;
    }

    if (canUpdateOnlyStatus) {
      onSaveTask?.(item.id, {
        status: formData.status,
      });

      setOpen(false);
      return;
    }

    onSaveTask?.(item.id, {
      ...formData,
      header: taskTitle,
    });

    setOpen(false);
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <button
          type="button"
          className="group flex w-full min-w-0 items-center text-left outline-none"
          title={`${item.header} - Click to view details`}
        >
          <span className="relative block min-w-0 truncate rounded-sm py-1 pr-2 text-sm font-medium text-foreground/85 underline-offset-4 transition-all duration-150 group-hover:translate-x-0.5 group-hover:underline group-hover:decoration-dotted group-hover:decoration-foreground/50 group-focus-visible:underline group-focus-visible:decoration-dotted">
            {item.header}
          </span>
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{formData.header}</DrawerTitle>

          <DrawerDescription>
            View and update task details, assignment, status and priority.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSaveChanges}
          className="flex flex-col gap-4 overflow-y-auto px-4 text-sm"
        >
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{formData.status}</Badge>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Category</span>
                <span className="font-medium">{formData.type}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Deadline</span>
                <span className="font-medium">
                  {formatDeadline(formData.target)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Priority</span>
                <span className="font-medium">{formData.limit}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Assigned To</span>
                <span className="font-medium">
                  {formData.reviewer === "Assign reviewer"
                    ? "Unassigned"
                    : formData.reviewer}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor={`${item.id}-header`}>Task Title</Label>
            <Input
              id={`${item.id}-header`}
              value={formData.header}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  header: e.target.value,
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor={`${item.id}-type`}>Category</Label>

              <Select
                value={formData.type}
                disabled={!canEditFullTask}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    type: value,
                  }))
                }
              >
                <SelectTrigger id={`${item.id}-type`} className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Frontend">Frontend</SelectItem>
                    <SelectItem value="Backend">Backend</SelectItem>
                    <SelectItem value="UI">UI</SelectItem>
                    <SelectItem value="Feature">Feature</SelectItem>
                    <SelectItem value="Bug Fix">Bug Fix</SelectItem>
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Technical content">
                      Technical content
                    </SelectItem>
                    <SelectItem value="Narrative">Narrative</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Visual">Visual</SelectItem>
                    <SelectItem value="Financial">Financial</SelectItem>
                    <SelectItem value="Cover page">Cover page</SelectItem>
                    <SelectItem value="Table of contents">
                      Table of contents
                    </SelectItem>
                    <SelectItem value="Plain language">
                      Plain language
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor={`${item.id}-status`}>Status</Label>

              <Select
                value={formData.status}
                disabled={!canEditFullTask && !canUpdateOnlyStatus}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value,
                  }))
                }
              >
                <SelectTrigger id={`${item.id}-status`} className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Todo">Todo</SelectItem>
                    <SelectItem value="In Process">In Process</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-3">
              <Label htmlFor={`${item.id}-target`}>Deadline</Label>
              <div className="relative">
                <Input
                  ref={deadlineInputRef}
                  id={`${item.id}-target`}
                  type="date"
                  min={getTodayDateInputValue()}
                  value={formData.target || ""}
                  disabled={!canEditFullTask}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      target: e.target.value,
                    }))
                  }
                  className="pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={!canEditFullTask}
                  onClick={openDeadlinePicker}
                  className="absolute inset-y-1 right-1 my-auto size-8 text-muted-foreground transition-colors duration-150 hover:bg-muted/50 hover:text-foreground active:bg-muted/60 active:translate-y-0"
                >
                  <CalendarIcon className="size-4" />
                  <span className="sr-only">Open calendar</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label htmlFor={`${item.id}-limit`}>Priority</Label>

              <Select
                value={formData.limit}
                disabled={!canEditFullTask}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    limit: value,
                  }))
                }
              >
                <SelectTrigger id={`${item.id}-limit`} className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>

                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Label htmlFor={`${item.id}-reviewer`}>Assigned To</Label>

            <Select
              value={String(formData.assignedToId || "__unassigned")}
              disabled={!canEditFullTask}
              onValueChange={(value) => {
                const selectedMember = members.find(
                  (member) => String(member.id) === String(value),
                );

                setFormData((prev) => ({
                  ...prev,
                  assignedToId: value === "__unassigned" ? "" : value,
                  reviewer:
                    value === "__unassigned"
                      ? "Unassigned"
                      : selectedMember?.name || "Unknown user",
                }));
              }}
            >
              <SelectTrigger id={`${item.id}-reviewer`} className="w-full">
                <SelectValue placeholder="Assign member" />
              </SelectTrigger>

              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__unassigned">Unassigned</SelectItem>

                  {members.map((member) => (
                    <SelectItem key={member.id} value={String(member.id)}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <DrawerFooter className="px-0">
            {(canEditFullTask || canUpdateOnlyStatus) && (
              <Button type="submit">Save changes</Button>
            )}

            <DrawerClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
