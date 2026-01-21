import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Ticket from '../models/Ticket.js';
import { auth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Helper function to format user data
const formatUserData = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  supportCategory: user.supportCategory,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users.map(formatUserData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create new user (admin or support)
router.post('/users', [
  auth,
  requireAdmin,
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'support', 'user']),
  body('supportCategory').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, supportCategory } = req.body;

    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password,
      role,
      ...(role === 'support' && { supportCategory })
    });

    await user.save();
    res.status(201).json(formatUserData(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/users/:userId', [
  auth,
  requireAdmin,
  body('email').optional().isEmail(),
  body('role').optional().isIn(['admin', 'support', 'user']),
  body('supportCategory').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, supportCategory } = req.body;
    const updateData = {};
    
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (supportCategory !== undefined) updateData.supportCategory = supportCategory;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(formatUserData(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/users/:userId', auth, requireAdmin, async (req, res) => {
  try {
    // Prevent deleting self
    if (req.user.id === req.params.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reassign or delete user's tickets
    await Ticket.updateMany(
      { assignedTo: req.params.userId },
      { $set: { assignedTo: null } }
    );

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get all tickets
router.get('/tickets', auth, requireAdmin, async (req, res) => {
  try {
    const { status, priority, search, sort } = req.query;

    // Build query object
    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { ticketId: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortOption = { createdAt: -1 }; // default: newest first

    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'priority') {
      // For priority sorting, we need to sort by priority level
      // Since we can't easily sort strings by priority, we'll sort in memory after fetching
      sortOption = {}; // No MongoDB sort, we'll sort in JS
    }

    let tickets = await Ticket.find(query)
      .populate('owner', 'username')
      .populate('assignedTo', 'username')
      .sort(sort === 'priority' ? {} : sortOption);

    // Handle priority sorting in JavaScript since MongoDB string sort doesn't work for priority levels
    if (sort === 'priority') {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      tickets = tickets.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    }

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

// Update ticket status
router.put('/tickets/:ticketId/status', [
  auth,
  requireAdmin,
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed', 'cancelled']),
  body('resolution_comment').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, resolution_comment } = req.body;
    const updateData = { status };
    
    if (status === 'resolved' && resolution_comment) {
      updateData.resolutionComment = resolution_comment;
      updateData.resolvedAt = new Date();
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { $set: updateData },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({
      message: 'Ticket status updated',
      ticket: {
        ticket_id: ticket.ticketId,
        status: ticket.status,
        updated_at: ticket.updatedAt,
        ...(ticket.status === 'resolved' && { 
          resolved_at: ticket.resolvedAt,
          resolution_comment: ticket.resolutionComment 
        })
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ticket status' });
  }
});

// Assign ticket to support
router.put('/tickets/:ticketId/assign', [
  auth,
  requireAdmin,
  body('assigned_to_id').isMongoId()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assigned_to_id } = req.body;

    // Check if user is support
    const supportUser = await User.findById(assigned_to_id);
    if (!supportUser || supportUser.role !== 'support') {
      return res.status(400).json({ error: 'Invalid support user' });
    }

    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: req.params.ticketId },
      { 
        $set: {
          assignedTo: assigned_to_id,
          status: 'in_progress'
        }
      },
      { new: true }
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json({ 
      message: 'Ticket assigned successfully',
      assigned_to: {
        id: supportUser._id,
        username: supportUser.username,
        supportCategory: supportUser.supportCategory
      },
      ticket_id: ticket.ticketId,
      status: ticket.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// Get statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalTickets = await Ticket.countDocuments();
    const ticketsByStatus = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const ticketsByCategory = await Ticket.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.json({
      total_tickets: totalTickets,
      tickets_by_status: ticketsByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      tickets_by_category: ticketsByCategory.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create user (admin only)
router.post('/users', auth, requireAdmin, [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['user', 'support', 'admin']),
  body('supportCategory').optional().isIn(['HR', 'Hardware', 'Software', 'Access'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password, role, supportCategory } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Validate support category for support role
    if (role === 'support' && !supportCategory) {
      return res.status(400).json({ error: 'Support category is required for support role' });
    }

    const user = new User({ username, email, password, role, supportCategory });
    await user.save();

    res.status(201).json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      supportCategory: user.supportCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;