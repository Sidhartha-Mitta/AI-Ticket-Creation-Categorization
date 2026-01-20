const express = require('express');
const { body, validationResult } = require('express-validator');
const Ticket = require('../models/Ticket');
const { auth, requireSupport } = require('../middleware/auth');

const router = express.Router();


// Get support tickets in user's category
router.get('/tickets', auth, requireSupport, async (req, res) => {
  try {
    const tickets = await Ticket.find({
      category: req.user.supportCategory
    }).populate('owner', 'username').populate('assignedTo', 'username');

    const formattedTickets = tickets.map(ticket => ({
      ticket_id: ticket.ticketId,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
      assigned_to_username: ticket.assignedTo?.username || null,
      notes: ticket.notes,
      resolution_comment: ticket.resolutionComment
    }));

    res.json(formattedTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket
router.put('/tickets/:ticketId', auth, requireSupport, [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled']),
  body('notes').optional().trim().escape(),
  body('resolutionComment').optional().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, notes, resolutionComment } = req.body;
    
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId, category: req.user.supportCategory });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    ticket.status = status;
    if (notes !== undefined) ticket.notes = notes;
    if (resolutionComment !== undefined) ticket.resolutionComment = resolutionComment;
    
    await ticket.save();

    res.json({ message: 'Ticket updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;