import { useState, useEffect, useCallback } from "react";
import { jsPDF } from "jspdf";
import useAuthStore from "../stores/authStore";
import AdminUsers from "../components/admin/AdminUsers";
import AdminTickets from "../components/admin/AdminTickets";
import SupportTickets from "../components/admin/SupportTickets";
import Sidebar from "../components/dashboard/Sidebar";
import MobileHeader from "../components/dashboard/MobileHeader";
import StatsCards from "../components/dashboard/StatsCards";
import TicketList from "../components/dashboard/TicketList";
import ProfileView from "../components/dashboard/ProfileView";
import CreateTicketForm from "../components/dashboard/CreateTicketForm";
import AdminStats from "../components/dashboard/AdminStats";
import EmptyState from "../components/dashboard/EmptyState";
import LoadingSpinner from "../components/dashboard/LoadingSpinner";
import {
  FileText,
  Clock,
  CheckCircle,
  Ticket,
  Home,
  Plus,
  User,
} from "lucide-react";

function DashboardPage({
  user,
  tickets,
  dashboardView,
  setDashboardView,
  title,
  setTitle,
  description,
  setDescription,
  generateTicket,
  loading,
  error,
  onLogout,
}) {
  // const [adminStats, setAdminStats] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { getProfile } = useAuthStore();

  useEffect(() => {
    const ensureUserProfile = async () => {
      // If user exists but doesn't have role, fetch profile
      if (user && !user.role) {
        console.log("User exists but no role, fetching profile...");
        try {
          await getProfile();
        } catch (error) {
          console.error("Failed to fetch profile:", error);
        }
      }
    };

    ensureUserProfile();
  }, [user, getProfile]);

  const fetchAdminData = useCallback(async () => {
    try {
      console.log("User object:", user);
      console.log("User role:", user?.role);

      // If user exists but no role, try to refresh profile
      if (user && !user.role) {
        console.log("No role found, refreshing profile...");
        try {
          await getProfile();
          return; // Exit and let the useEffect re-run with updated user
        } catch (error) {
          console.error("Failed to refresh profile:", error);
          // If we can't refresh profile, clear auth and redirect to login
          if (
            error.message?.includes("token") ||
            error.message?.includes("unauthorized")
          ) {
            onLogout();
          }
          return;
        }
      }

      if (user?.role !== "admin") {
        console.log("User is not admin, skipping admin data fetch");
        return;
      }

      console.log("Fetching admin data for view:", dashboardView);
      setAdminLoading(true);

      // Get token from auth store
      const { token } = useAuthStore.getState();

      if (!token) {
        console.error("No authentication token found");
        onLogout();
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      let endpoint = "";
      switch (dashboardView) {
        case "admin-stats":
          endpoint = "/api/admin/stats";
          break;
        default:
          console.warn("Unknown dashboard view:", dashboardView);
          return;
      }

      console.log(`Fetching from ${endpoint}...`);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || ""}${endpoint}`,
        {
          headers,
          credentials: "include",
        },
      );

      if (response.status === 401) {
        // Token is invalid or expired
        console.error("Authentication failed, logging out...");
        onLogout();
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.error ||
          data?.message ||
          `Failed to fetch ${dashboardView.replace("admin-", "")}`;
        throw new Error(errorMessage);
      }

      // Handle successful response
      const responseData = Array.isArray(data) ? data : data.data || data;

      // Update the appropriate state based on the current view
      switch (dashboardView) {
        case "admin-stats":
          setAdminStats(responseData);
          break;
      }
    } catch (error) {
      console.error("Error in fetchAdminData:", error);
      const errorMessage =
        error.message || "An error occurred while fetching data";
      if (dashboardView === "admin-stats") {
        setAdminStats({ error: errorMessage });
      }

      // If it's an auth error, log the user out
      if (
        error.message?.includes("401") ||
        error.message?.includes("token") ||
        error.message?.includes("unauthorized")
      ) {
        onLogout();
      }
    } finally {
      setAdminLoading(false);
    }
  }, [dashboardView, user, getProfile, onLogout]);

  // Fetch data when dashboardView changes to admin-stats
  useEffect(() => {
    if (dashboardView === "admin-stats") {
      fetchAdminData();
    } else {
      // Reset admin states when not in admin view
      setAdminLoading(false);
    }
  }, [dashboardView, fetchAdminData]);

  const downloadTicket = (ticketData) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Support Ticket", 20, 20);
    doc.setFontSize(12);
    doc.text(`Ticket ID: ${ticketData.ticket_id}`, 20, 40);
    doc.text(`Title: ${ticketData.title}`, 20, 50);
    doc.text(`Status: ${ticketData.status}`, 20, 60);
    doc.text(`Category: ${ticketData.category}`, 20, 70);
    doc.text(`Priority: ${ticketData.priority}`, 20, 80);
    doc.text(
      `Created: ${new Date(ticketData.created_at).toLocaleString()}`,
      20,
      90,
    );
    doc.text("Description:", 20, 110);
    const splitDescription = doc.splitTextToSize(ticketData.description, 170);
    doc.text(splitDescription, 20, 120);

    doc.save(`ticket_${ticketData.ticket_id}.pdf`);
  };

  const getSidebarItems = useCallback(() => {
    const baseItems = [
      { key: "home", label: "Dashboard", icon: Home, color: "text-blue-500" },
      {
        key: "profile",
        label: "My Profile",
        icon: User,
        color: "text-purple-500",
      },
      {
        key: "create",
        label: "Create Ticket",
        icon: Plus,
        color: "text-green-500",
      },
      {
        key: "my-tickets",
        label: "My Tickets",
        icon: FileText,
        color: "text-indigo-500",
      },
    ];

    // Add support-specific items if user is support staff
    if (user?.role === "support") {
      baseItems.splice(3, 0, {
        key: "assigned-tickets",
        label: "My Category Tickets",
        icon: Ticket,
        color: "text-orange-500",
      });
    }

    // Add admin-specific items if user is admin
    if (user?.role === "admin") {
      baseItems.splice(2, 0, {
        key: "admin-users",
        label: "Manage Users",
        icon: User,
        color: "text-purple-500",
      });
      baseItems.splice(3, 0, {
        key: "admin-tickets",
        label: "All Tickets",
        icon: Ticket,
        color: "text-indigo-500",
      });
    }

    return baseItems;
  }, [user?.role]);

  const [sidebarItems, setSidebarItems] = useState(getSidebarItems());

  useEffect(() => {
    setSidebarItems(getSidebarItems());
  }, [getSidebarItems]);

  const renderContent = () => {
    switch (dashboardView) {
      case "profile":
        return <ProfileView user={user} />;
      case "my-tickets": {
        const myTicketsStats = [
          {
            title: "Total Tickets",
            count: tickets.length,
            icon: FileText,
            bgClass: "bg-blue-50",
            borderClass: "border-blue-200",
            titleClass: "text-blue-900",
            countClass: "text-blue-600",
            iconClass: "text-blue-500",
          },
          {
            title: "In Progress",
            count: tickets.filter((t) => t.status === "in_progress").length,
            icon: Clock,
            bgClass: "bg-orange-50",
            borderClass: "border-orange-200",
            titleClass: "text-orange-900",
            countClass: "text-orange-600",
            iconClass: "text-orange-500",
          },
          {
            title: "Completed",
            count: tickets.filter((t) => t.status === "resolved").length,
            icon: CheckCircle,
            bgClass: "bg-green-50",
            borderClass: "border-green-200",
            titleClass: "text-green-900",
            countClass: "text-green-600",
            iconClass: "text-green-500",
          },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                My Tickets
              </h2>
              <p className="text-gray-600 mb-6">
                View and manage all your support tickets
              </p>
              <StatsCards stats={myTicketsStats} />
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                All My Tickets
              </h3>
              {tickets.length > 0 ? (
                <TicketList tickets={tickets} downloadTicket={downloadTicket} />
              ) : (
                <EmptyState
                  icon={FileText}
                  message="No tickets found"
                  subMessage="Create your first ticket to get started"
                />
              )}
            </div>
          </div>
        );
      }
      case "assigned-tickets":
        return <SupportTickets />;
      case "home": {
        const homeStats = [
          {
            title: "Generated Tickets",
            count: tickets.filter((t) => t.status === "open").length,
            icon: FileText,
            bgClass: "bg-white",
            borderClass: "border-l-4 border-blue-500",
            titleClass: "text-gray-900",
            countClass: "text-blue-600",
            iconClass: "text-blue-500",
          },
          {
            title: "In-Process Tickets",
            count: tickets.filter((t) => t.status === "in_progress").length,
            icon: Clock,
            bgClass: "bg-white",
            borderClass: "border-l-4 border-orange-500",
            titleClass: "text-gray-900",
            countClass: "text-orange-600",
            iconClass: "text-orange-500",
          },
          {
            title: "Completed Tickets",
            count: tickets.filter((t) => t.status === "resolved").length,
            icon: CheckCircle,
            bgClass: "bg-white",
            borderClass: "border-l-4 border-green-500",
            titleClass: "text-gray-900",
            countClass: "text-green-600",
            iconClass: "text-green-500",
          },
        ];
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome back, {user.username}!
                {user.role === "admin" && (
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    Admin
                  </span>
                )}
              </h2>
              <p className="text-gray-600">
                {user.role === "admin"
                  ? "Manage the entire support system from the admin panel."
                  : "Manage your support tickets from the sidebar."}
              </p>
            </div>
            <StatsCards stats={homeStats} />
            {user.role === "admin" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Admin Quick Actions
                </h3>
                <p className="text-gray-600 mb-4">
                  Access admin features from the sidebar to manage user
                   and tickets.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setDashboardView("admin-users")}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Manage Users
                  </button>
                  <button
                    onClick={() => setDashboardView("admin-tickets")}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                  >
                    View All Tickets
                  </button>
                  {/* <button
                    onClick={() => setDashboardView('admin-stats')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-sm font-medium"
                  >
                    System Stats
                  </button> */}
                </div>
              </div>
            )}
          </div>
        );
      }
      case "create":
        return (
          <CreateTicketForm
            title={title}
            setTitle={setTitle}
            description={description}
            setDescription={setDescription}
            generateTicket={generateTicket}
            loading={loading}
          />
        );
      case "submitted": {
        const submittedTickets = tickets.filter((t) => t.status === "open");
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Generated Tickets
            </h2>
            <div className="space-y-4">
              {submittedTickets.length > 0 ? (
                <TicketList
                  tickets={submittedTickets}
                  downloadTicket={downloadTicket}
                />
              ) : (
                <EmptyState
                  icon={FileText}
                  message="No generated tickets yet"
                />
              )}
            </div>
          </div>
        );
      }
      case "in-process": {
        const inProcessTickets = tickets.filter(
          (t) => t.status === "In-Process",
        );
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              In-Process Tickets
            </h2>
            <div className="space-y-4">
              {inProcessTickets.length > 0 ? (
                <TicketList
                  tickets={inProcessTickets}
                  downloadTicket={downloadTicket}
                />
              ) : (
                <EmptyState icon={Clock} message="No tickets in progress" />
              )}
            </div>
          </div>
        );
      }
      case "completed": {
        const completedTickets = tickets.filter(
          (t) => t.status === "Completed",
        );
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Completed Tickets
            </h2>
            <div className="space-y-4">
              {completedTickets.length > 0 ? (
                <TicketList
                  tickets={completedTickets}
                  downloadTicket={downloadTicket}
                />
              ) : (
                <EmptyState
                  icon={CheckCircle}
                  message="No completed tickets yet"
                />
              )}
            </div>
          </div>
        );
      }

      case "admin-users":
        return <AdminUsers />;

      case "admin-tickets":
        return <AdminTickets />;

      // case 'admin-stats':
      //   return <AdminStats adminLoading={adminLoading} adminStats={adminStats} />
      default:
        return <div>Select an option from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <MobileHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <Sidebar
        sidebarItems={sidebarItems}
        dashboardView={dashboardView}
        setDashboardView={setDashboardView}
        setSidebarOpen={setSidebarOpen}
        onLogout={onLogout}
        sidebarOpen={sidebarOpen}
      />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 p-4 lg:p-8 bg-white lg:ml-64 overflow-x-hidden">
        {renderContent()}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage;
