import { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle, X, Search, Filter, RefreshCw, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-toastify';
import useAuthStore from '../../stores/authStore';

const statuses = [
  { id: 'open', name: 'Open', icon: <AlertCircle className="h-4 w-4" />, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'in_progress', name: 'In Progress', icon: <Clock className="h-4 w-4" />, color: 'bg-blue-100 text-blue-800' },
  { id: 'resolved', name: 'Resolved', icon: <Check className="h-4 w-4" />, color: 'bg-green-100 text-green-800' },
  { id: 'closed', name: 'Closed', icon: <X className="h-4 w-4" />, color: 'bg-gray-100 text-gray-800' },
  { id: 'cancelled', name: 'Cancelled', icon: <X className="h-4 w-4" />, color: 'bg-red-100 text-red-800' },
];

const priorities = [
  { id: 'Low', name: 'Low', color: 'bg-blue-100 text-blue-800' },
  { id: 'Medium', name: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'High', name: 'High', color: 'bg-red-100 text-red-800' },
];

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [viewingTicket, setViewingTicket] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    sort: 'newest',
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    resolution_comment: '',
  });

  const { token } = useAuthStore();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.sort) queryParams.append('sort', filters.sort);

      const response = await fetch(`/api/admin/tickets?${queryParams.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      
      if (response.ok) {
        setTickets(Array.isArray(data) ? data : []);
      } else {
        throw new Error(data.error || 'Failed to fetch tickets');
      }
    } catch (error) {
      toast.error(error.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !statusUpdate.status) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/tickets/${selectedTicket.ticket_id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(statusUpdate)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update ticket status');
      }

      toast.success('Ticket status updated successfully');
      setSelectedTicket(null);
      setStatusUpdate({ status: '', resolution_comment: '' });
      fetchTickets();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusObj = statuses.find(s => s.id === status) || { name: status, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusObj.color}`}>
        {statusObj.icon || null}
        {statusObj.name}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityObj = priorities.find(p => p.id === priority) || { name: priority, color: 'bg-gray-100 text-gray-800' };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityObj.color}`}>
        {priorityObj.name}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !filters.search || 
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.ticket_id.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || ticket.status === filters.status;
    const matchesPriority = !filters.priority || ticket.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (filters.sort === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (filters.sort === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (filters.sort === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    }
    return 0;
  });

  return (
    <div className="p-6 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-gray-900">Ticket Management</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchTickets}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              id="priority-filter"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">All Priorities</option>
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <div className="relative">
              <select
                id="sort"
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedTickets.length > 0 ? (
                  sortedTickets.map((ticket) => (
                    <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.ticket_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.category || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ticket.owner?.username || ticket.owner || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(ticket.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setStatusUpdate({
                              status: ticket.status,
                              resolution_comment: ticket.resolution_comment || ''
                            });
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
                        >
                          Update Status
                        </button>
                        <button
                          onClick={() => setViewingTicket(ticket)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      No tickets found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedTicket(null)}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={(e) => e.stopPropagation()}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Update Ticket Status
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    <span className="font-medium">Ticket ID:</span> {selectedTicket.ticket_id}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">{selectedTicket.title}</p>
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={statusUpdate.status}
                    onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    {statuses.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>

                {statusUpdate.status === 'resolved' && (
                  <div>
                    <label htmlFor="resolution_comment" className="block text-sm font-medium text-gray-700 mb-1">
                      Resolution Details
                    </label>
                    <textarea
                      id="resolution_comment"
                      name="resolution_comment"
                      rows="3"
                      value={statusUpdate.resolution_comment}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, resolution_comment: e.target.value })}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Enter resolution details..."
                      required
                    ></textarea>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isUpdating ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                  {isUpdating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {viewingTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setViewingTicket(null)}>
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={(e) => e.stopPropagation()}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Ticket Details
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ticket ID</p>
                    <p className="text-sm text-gray-900">{viewingTicket.ticket_id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <p className="text-sm text-gray-900">{viewingTicket.category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Owner</p>
                    <p className="text-sm text-gray-900">{viewingTicket.owner?.username || viewingTicket.owner || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <div className="mt-1">{getStatusBadge(viewingTicket.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Priority</p>
                    <div className="mt-1">{getPriorityBadge(viewingTicket.priority)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-sm text-gray-900">{formatDate(viewingTicket.created_at)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Title</p>
                  <p className="text-sm text-gray-900 mt-1">{viewingTicket.title}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Description</p>
                  <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{viewingTicket.description}</p>
                </div>
                {viewingTicket.resolution_comment && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Resolution Comment</p>
                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{viewingTicket.resolution_comment}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setViewingTicket(null);
                    setSelectedTicket(viewingTicket);
                    setStatusUpdate({
                      status: viewingTicket.status,
                      resolution_comment: viewingTicket.resolution_comment || ''
                    });
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Status
                </button>
                <button
                  type="button"
                  onClick={() => setViewingTicket(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
