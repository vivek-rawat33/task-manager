import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getTeamTasks } from "@/api/taskApi";
import {
  getTeamMembers,
  getMyTeams,
  addTeamMember,
  removeTeamMember,
  changeMemberRole,
  updateTeam,
  deleteTeam,
} from "@/api/teamApi";
import { toast } from "sonner";

import { StatusChart } from "@/components/status-chart";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { UserPlusIcon, Trash2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  getTeamAnnouncements,
  createTeamAnnouncement,
  deleteTeamAnnouncement,
} from "@/api/announcementApi";

function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function normalizeTeam(item) {
  const team = item.team || item.teamId || item;

  const id = team?._id || team?.id || item?._id || item?.id || "";

  return {
    id: id ? String(id) : "",
    name: team?.name || item?.name || "Untitled Team",
    description: team?.description || item?.description || "",
    role: item?.role || team?.role || "",
  };
}

function getLoggedInUserId() {
  const token = localStorage.getItem("token");

  if (!token) return "";

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload._id || payload.id || payload.userId || "";
  } catch (error) {
    console.error("Failed to decode token:", error);
    return "";
  }
}

export default function Dashboard() {
  const [currentTeam, setCurrentTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const { teamId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUserRole, setCurrentUserRole] = useState("");
  const isMembersPage = location.pathname.endsWith("/members");
  const isMyTasksPage = location.pathname.endsWith("/my-tasks");
  const [currentUserId, setCurrentUserId] = useState("");
  const isAnnouncementsPage = location.pathname.endsWith("/announcements");
  const isSettingsPage = location.pathname.endsWith("/settings");
  useEffect(() => {
    async function fetchTasks() {
      try {
        if (!teamId) {
          setLoading(false);
          return;
        }
        const [taskRes, memberRes, teamRes] = await Promise.all([
          getTeamTasks(teamId),
          getTeamMembers(teamId),
          getMyTeams(),
        ]);

        const rawTeams = teamRes.teams || teamRes.teamMembers || teamRes || [];

        const formattedTeams = rawTeams
          .map(normalizeTeam)
          .filter((team) => team.id);

        const selectedTeam = formattedTeams.find(
          (team) => String(team.id) === String(teamId),
        );

        setCurrentTeam(selectedTeam || null);

        const rawTasks = taskRes.tasks || [];
        const rawMembers =
          memberRes.members || memberRes.teamMembers || memberRes || [];

        const formattedMembers = rawMembers.map((member) => {
          const user = member.userId || member.user || {};

          return {
            id: String(user._id || member.userId || member.user || ""),
            name: user.name || member.name || "Unknown user",
            email: user.email || member.email || "",
            role: member.role,
          };
        });

        setMembers(formattedMembers);

        const loggedInUserId = getLoggedInUserId();
        setCurrentUserId(loggedInUserId);
        const currentMember = formattedMembers.find(
          (member) => String(member.id) === String(loggedInUserId),
        );

        setCurrentUserRole(currentMember?.role || "");

        const formattedTasks = rawTasks.map((task) => ({
          id: task._id || task.id,
          header: task.title || "Untitled Task",
          type: task.category || "General",

          // For table UI
          status:
            task.status === "pending"
              ? "Todo"
              : task.status === "in-progress"
                ? "In Process"
                : task.status === "completed"
                  ? "Done"
                  : task.status || "Todo",

          // For chart logic
          rawStatus: task.status,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
          completedAt: task.completedAt,

          target: task.dueDate ? task.dueDate.split("T")[0] : "",

          limit:
            task.priority === "high"
              ? "High"
              : task.priority === "medium"
                ? "Medium"
                : task.priority === "low"
                  ? "Low"
                  : task.priority || "Medium",

          reviewer: task.assignedTo?.name || "Unassigned",
          assignedToId: task.assignedTo?._id ? String(task.assignedTo._id) : "",
        }));
        setTasks(formattedTasks);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, [teamId]);

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />

      <SidebarInset className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="rounded-xl border bg-card px-5 py-4 text-card-foreground shadow-sm">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">
                      Current team
                    </p>

                    <h1 className="text-2xl font-semibold tracking-tight">
                      {currentTeam?.name || "Team Dashboard"}
                    </h1>

                    <p className="text-sm text-muted-foreground">
                      {currentTeam?.description ||
                        "Manage tasks, deadlines, and team members from one place."}
                    </p>
                  </div>
                </div>
              </div>
              {loading ? (
                <div className="px-4 text-sm text-muted-foreground lg:px-6">
                  Loading tasks...
                </div>
              ) : (
                <>
                  {isMembersPage ? (
                    <TeamMembersSection
                      teamId={teamId}
                      members={members}
                      currentUserRole={currentUserRole}
                      onMemberAdded={(newMember) => {
                        setMembers((prev) => [...prev, newMember]);
                      }}
                      onMemberRemoved={(memberId) => {
                        setMembers((prev) =>
                          prev.filter(
                            (member) => String(member.id) !== String(memberId),
                          ),
                        );
                      }}
                      onMemberRoleChanged={(memberId, newRole) => {
                        setMembers((prev) =>
                          prev.map((member) =>
                            String(member.id) === String(memberId)
                              ? { ...member, role: newRole }
                              : member,
                          ),
                        );
                      }}
                    />
                  ) : isAnnouncementsPage ? (
                    <AnnouncementsSection
                      teamId={teamId}
                      currentUserRole={currentUserRole}
                    />
                  ) : isSettingsPage ? (
                    <TeamSettingsSection
                      teamId={teamId}
                      currentTeam={currentTeam}
                      currentUserRole={currentUserRole}
                      onTeamUpdated={(updatedTeam) => {
                        setCurrentTeam((prev) => ({
                          ...prev,
                          ...updatedTeam,
                        }));
                      }}
                      onTeamDeleted={() => {
                        navigate("/dashboard");
                      }}
                    />
                  ) : (
                    <>
                      {/* Charts Section */}
                      <div className="space-y-4 px-4 lg:px-6">
                        {/* Chart 1: Mobile + Tablet + Desktop */}
                        <ChartAreaInteractive tasks={tasks} />

                        {/* Chart 2: Mobile + Tablet + Desktop */}
                        <div className="grid gap-4">
                          <StatusChart tasks={tasks} />
                        </div>

                        {/* 
    Desktop/Laptop only charts.
    Inko tab uncomment karna jab components bana lo.

    <div className="hidden xl:grid xl:grid-cols-2 xl:gap-4">
      <PriorityChart tasks={tasks} />
      <DeadlineChart tasks={tasks} />
    </div>

    <div className="hidden xl:grid xl:grid-cols-2 xl:gap-4">
      <MemberPerformanceChart tasks={tasks} />
    </div>
  */}
                      </div>
                      <DataTable
                        data={
                          isMyTasksPage
                            ? tasks.filter(
                                (task) =>
                                  String(task.assignedToId) ===
                                  String(currentUserId),
                              )
                            : tasks
                        }
                        teamId={teamId}
                        members={members}
                        currentUserRole={currentUserRole}
                        currentUserId={currentUserId}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function TeamMembersSection({
  teamId,
  members = [],
  currentUserRole = "",
  onMemberAdded,
  onMemberRemoved,
  onMemberRoleChanged,
}) {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memberForm, setMemberForm] = useState({
    email: "",
    role: "member",
  });
  const [addMemberError, setAddMemberError] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const canManageMembers =
    currentUserRole === "owner" || currentUserRole === "admin";

  async function handleAddMember(e) {
    e.preventDefault();

    const email = memberForm.email.trim();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      const res = await addTeamMember(teamId, {
        email,
        role: memberForm.role,
      });

      const member = res.member || res.teamMember || res;

      const formattedMember = {
        id: String(
          member.userId?._id || member.userId || member.user?._id || "",
        ),
        name: member.userId?.name || member.user?.name || "Unknown user",
        email: member.userId?.email || member.user?.email || email,
        role: member.role || memberForm.role,
      };

      onMemberAdded?.(formattedMember);

      setMemberForm({
        email: "",
        role: "member",
      });

      setIsAddMemberOpen(false);
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Add member failed:", error);

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 404) {
        toast.error("User not found. Ask this user to sign up first.");
        return;
      }

      if (status === 409 || message?.toLowerCase().includes("already")) {
        toast.error("This user is already a member of this team.");
        return;
      }

      if (status === 403) {
        toast.error("You do not have permission to add members.");
        return;
      }

      if (status === 401) {
        toast.error("Please sign in again.");
        localStorage.removeItem("token");
        window.location.href = "/signin";
        return;
      }

      toast.error(message || "Failed to add member");
    }
  }
  async function handleRemoveMember(member) {
    const confirmed = window.confirm(
      `Remove ${member.name || "this member"} from this team?`,
    );

    if (!confirmed) return;

    try {
      await removeTeamMember(teamId, member.id);

      onMemberRemoved?.(member.id);

      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Remove member failed:", error);

      const message = error.response?.data?.message;

      toast.error(message || "Failed to remove member");
    }
  }

  async function handleChangeMemberRole(member, newRole) {
    if (!teamId) {
      toast.error("Team ID missing");
      return;
    }

    if (member.role === "owner") {
      toast.error("Owner role cannot be changed");
      return;
    }

    try {
      await changeMemberRole(teamId, member.id, newRole);

      onMemberRoleChanged?.(member.id, newRole);

      toast.success("Role updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change role");
    }
  }
  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Team Members
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage team access, member roles, and permissions.
            </p>
          </div>

          {canManageMembers && (
            <Button
              varient="default"
              onClick={() => setIsAddMemberOpen(true)}
              className="gap-2 bg-foreground text-background hover:bg-foreground/90"
            >
              <UserPlusIcon className="size-4" />
              Add Member
            </Button>
          )}
        </div>
        <div className="divide-y">
          {members.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              No members found in this team.
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-muted text-sm font-semibold uppercase text-muted-foreground">
                    {member.name?.charAt(0) || "U"}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{member.name}</p>

                      {member.role === "owner" && (
                        <Badge variant="secondary" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>

                    <p className="truncate text-sm text-muted-foreground">
                      {member.email || "No email"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  {currentUserRole === "owner" && member.role !== "owner" ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleChangeMemberRole(member, value)
                      }
                    >
                      <SelectTrigger className="h-8 w-32 rounded-full text-xs capitalize">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-1 capitalize"
                    >
                      {member.role}
                    </Badge>
                  )}

                  {canManageMembers && member.role !== "owner" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member)}
                      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2Icon className="size-4" />
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog
        open={isAddMemberOpen}
        onOpenChange={(open) => {
          setIsAddMemberOpen(open);

          if (!open) {
            setAddMemberError("");
            setMemberForm({
              email: "",
              role: "member",
            });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Add an existing registered user to this team by email.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="memberEmail">Email</Label>

              <Input
                id="memberEmail"
                type="email"
                placeholder="member@example.com"
                value={memberForm.email}
                onChange={(e) => {
                  setMemberForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }));

                  if (addMemberError) {
                    setAddMemberError("");
                  }
                }}
                className={addMemberError ? "border-destructive" : ""}
              />

              <p className="text-xs text-muted-foreground">
                The user must already have an account before you can add them.
              </p>

              {addMemberError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {addMemberError}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="memberRole">Role</Label>
              <Select
                value={memberForm.role}
                onValueChange={(value) =>
                  setMemberForm((prev) => ({
                    ...prev,
                    role: value,
                  }))
                }
              >
                <SelectTrigger id="memberRole" className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isAddingMember}>
                {isAddingMember ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AnnouncementsSection({ teamId, currentUserRole = "" }) {
  const [announcements, setAnnouncements] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
  });
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const canManageAnnouncements =
    currentUserRole === "owner" || currentUserRole === "admin";

  useEffect(() => {
    async function fetchAnnouncements() {
      if (!teamId) return;

      try {
        setLoading(true);

        const res = await getTeamAnnouncements(teamId);
        setAnnouncements(res.announcements || []);
      } catch (error) {
        console.error("Fetch announcements failed:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch announcements",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAnnouncements();
  }, [teamId]);

  async function handleCreateAnnouncement(e) {
    e.preventDefault();

    const title = announcementForm.title.trim();
    const message = announcementForm.message.trim();

    if (!title) {
      toast.error("Announcement title is required");
      return;
    }

    if (!message) {
      toast.error("Announcement message is required");
      return;
    }

    try {
      setIsCreating(true);

      const res = await createTeamAnnouncement(teamId, {
        title,
        message,
      });

      setAnnouncements((prev) => [res.announcement, ...prev]);

      setAnnouncementForm({
        title: "",
        message: "",
      });

      setIsCreateOpen(false);

      toast.success("Announcement posted successfully");
    } catch (error) {
      console.error("Create announcement failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to create announcement",
      );
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDeleteAnnouncement(announcementId) {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;

    try {
      await deleteTeamAnnouncement(teamId, announcementId);

      setAnnouncements((prev) =>
        prev.filter(
          (announcement) => String(announcement._id) !== String(announcementId),
        ),
      );

      toast.success("Announcement deleted successfully");
    } catch (error) {
      console.error("Delete announcement failed:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete announcement",
      );
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Announcements
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Share important updates with your team.
            </p>
          </div>

          {canManageAnnouncements && (
            <Button onClick={() => setIsCreateOpen(true)}>
              Create Announcement
            </Button>
          )}
        </div>

        <div className="divide-y">
          {loading ? (
            <div className="px-5 py-6 text-sm text-muted-foreground">
              Loading announcements...
            </div>
          ) : announcements.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No announcements yet.
            </div>
          ) : (
            announcements.map((announcement) => (
              <div key={announcement._id} className="px-5 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold tracking-tight">
                      {announcement.title}
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {announcement.message}
                    </p>

                    <p className="mt-3 text-xs text-muted-foreground">
                      Posted by {announcement.createdBy?.name || "Unknown user"}{" "}
                      ·{" "}
                      {new Date(announcement.createdAt).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>

                  {canManageAnnouncements && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create announcement</DialogTitle>
            <DialogDescription>
              Post an update that all team members can read.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAnnouncement} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="announcementTitle">Title</Label>
              <Input
                id="announcementTitle"
                value={announcementForm.title}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Example: Sprint planning update"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcementMessage">Message</Label>
              <textarea
                id="announcementMessage"
                value={announcementForm.message}
                onChange={(e) =>
                  setAnnouncementForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder="Write your announcement..."
                rows={5}
                className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateOpen(false)}
              >
                Cancel
              </Button>

              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Posting..." : "Post Announcement"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TeamSettingsSection({
  teamId,
  currentTeam,
  currentUserRole = "",
  onTeamUpdated,
  onTeamDeleted,
}) {
  const [teamForm, setTeamForm] = useState({
    name: currentTeam?.name || "",
    description: currentTeam?.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canUpdateTeam =
    currentUserRole === "owner" || currentUserRole === "admin";

  const canDeleteTeam = currentUserRole === "owner";

  useEffect(() => {
    setTeamForm({
      name: currentTeam?.name || "",
      description: currentTeam?.description || "",
    });
  }, [currentTeam]);

  async function handleUpdateTeam(e) {
    e.preventDefault();

    const name = teamForm.name.trim();
    const description = teamForm.description.trim();

    if (!name) {
      toast.error("Team name is required");
      return;
    }

    try {
      setIsSaving(true);

      const res = await updateTeam(teamId, {
        name,
        description,
      });

      onTeamUpdated?.(res.team);

      toast.success("Team updated successfully");
    } catch (error) {
      console.error("Update team failed:", error);
      toast.error(error.response?.data?.message || "Failed to update team");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteTeam() {
    const confirmed = window.confirm(
      "Delete this team permanently? This will delete all tasks and members from this team.",
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      await deleteTeam(teamId);

      toast.success("Team deleted successfully");

      onTeamDeleted?.();
    } catch (error) {
      console.error("Delete team failed:", error);
      toast.error(error.response?.data?.message || "Failed to delete team");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
        <div className="border-b px-5 py-5">
          <h2 className="text-xl font-semibold tracking-tight">
            Team Settings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Update team details and manage dangerous actions.
          </p>
        </div>

        <div className="grid gap-6 px-5 py-5 lg:grid-cols-[1fr_320px]">
          <form onSubmit={handleUpdateTeam} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={teamForm.name}
                disabled={!canUpdateTeam}
                onChange={(e) =>
                  setTeamForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Example: Product Team"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="teamDescription">Description</Label>
              <textarea
                id="teamDescription"
                value={teamForm.description}
                disabled={!canUpdateTeam}
                onChange={(e) =>
                  setTeamForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Describe this team..."
                rows={5}
                className="min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {canUpdateTeam ? (
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                You do not have permission to edit this team.
              </p>
            )}
          </form>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <h3 className="font-semibold text-destructive">Danger Zone</h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Deleting a team permanently removes its tasks, members, and team
              data.
            </p>

            <Button
              type="button"
              variant="destructive"
              className="mt-4"
              disabled={!canDeleteTeam || isDeleting}
              onClick={handleDeleteTeam}
            >
              {isDeleting ? "Deleting..." : "Delete Team"}
            </Button>

            {!canDeleteTeam && (
              <p className="mt-2 text-xs text-muted-foreground">
                Only the team owner can delete this team.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
