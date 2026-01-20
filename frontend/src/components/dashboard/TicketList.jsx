function TicketList({ tickets, downloadTicket }) {
  return (
    <div className="space-y-4 ">
      {tickets.length > 0 ? tickets.map(ticket => (
        <div key={ticket.ticket_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h4 className="font-semibold text-gray-900">{ticket.title}</h4>
                <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                  ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'in_progress' || ticket.status === 'inprogress' ? 'bg-orange-100 text-orange-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
              <p className="text-gray-600 mb-3 text-sm">{ticket.description}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span>ID: {ticket.ticket_id}</span>
                <span>Category: {ticket.category || 'N/A'}</span>
                <span>Created: {new Date(ticket.created_at).toLocaleDateString()}</span>
                {ticket.priority && <span>Priority: {ticket.priority}</span>}
              </div>
            </div>
            <button
              onClick={() => downloadTicket(ticket)}
              className="ml-4 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Download PDF
            </button>
          </div>
        </div>
      )) : null}
    </div>
  )
}

export default TicketList