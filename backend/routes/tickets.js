import express from 'express';
import { body, validationResult } from 'express-validator';
import Ticket from '../models/Ticket.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create ticket
router.post('/', auth, [
  body('title').isLength({ min: 1 }).trim().escape(),
  body('description').isLength({ min: 1 }).trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, priority } = req.body;

    const ticket = new Ticket({
      ticketId: 'TICK-' + Date.now(),
      title,
      description,
      category: category || 'Software',
      priority: priority || 'Medium',
      owner: req.user._id
    });

    await ticket.save();

    res.status(201).json({
      ticket_id: ticket.ticketId,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
      assigned_to_username: null,
      notes: ticket.notes,
      resolution_comment: ticket.resolutionComment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user tickets
router.get('/', auth, async (req, res) => {
  try {
    const tickets = await Ticket.find({ owner: req.user._id })
      .populate('owner', 'username')
      .populate('assignedTo', 'username');

    const formattedTickets = tickets.map(ticket => ({
      ticket_id: ticket.ticketId,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      created_at: ticket.createdAt,
      updated_at: ticket.updatedAt,
      owner: ticket.owner?.username || ticket.owner,
      assigned_to_username: ticket.assignedTo?.username || null,
      notes: ticket.notes,
      resolution_comment: ticket.resolutionComment
    }));

    res.json(formattedTickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel ticket
router.put('/:ticketId/cancel', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ ticketId: req.params.ticketId, owner: req.user._id });
    
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticket.status !== 'Submitted') {
      return res.status(400).json({ error: 'Can only cancel submitted tickets' });
    }

    ticket.status = 'Dropped';
    await ticket.save();

    res.json({ message: 'Ticket cancelled' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;