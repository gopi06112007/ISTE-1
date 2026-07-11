const Event = require('../models/Event');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const logActivity = require('../utils/activityLogger');

/**
 * GET /api/events
 * Public — supports ?branch= &category= &status=upcoming|past filters
 */
const getEvents = async (req, res) => {
  try {
    const { branch, category, status } = req.query;
    const filter = {};

    if (branch) filter.branch = branch.toUpperCase();
    if (category) filter.category = category;

    // For status filter, we filter based on date since status is a virtual
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (status === 'upcoming') {
      filter.date = { $gte: now };
    } else if (status === 'past') {
      filter.date = { $lt: now };
    }

    const events = await Event.find(filter)
      .populate({
        path: 'createdBy',
        select: 'role branch',
        populate: {
          path: 'profileId',
          select: 'name',
        },
      })
      .sort({ date: status === 'past' ? -1 : 1 });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get events error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/events/:id
 * Public
 */
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate({
      path: 'createdBy',
      select: 'role branch',
      populate: {
        path: 'profileId',
        select: 'name',
      },
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * POST /api/events
 * Branch Faculty | Central
 */
const createEvent = async (req, res) => {
  try {
    const { title, description, date, time, venue, branch, category } = req.body;

    if (!title || !description || !date || !time || !venue || !branch || !category) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, description, date, time, venue, branch, category.',
      });
    }

    // Handle poster upload
    let posterUrl = '';
    let posterPublicId = '';
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/events');
      posterUrl = uploadResult.url;
      posterPublicId = uploadResult.publicId;
    }

    const event = await Event.create({
      title,
      description,
      date: new Date(date),
      time,
      venue,
      branch: branch.toUpperCase(),
      category,
      posterUrl,
      posterPublicId,
      createdBy: req.user.userId,
    });

    await logActivity({
      action: 'CREATE',
      performedBy: req.user.userId,
      targetModel: 'Event',
      targetId: event._id,
      details: `Created event "${title}" in ${branch}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/events/:id
 * Creator | Central
 */
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Only creator or central can update
    const isCreator = event.createdBy.toString() === req.user.userId.toString();
    const isCentral = req.user.role === 'central_faculty';

    if (!isCreator && !isCentral) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the event creator or central admin can edit.',
      });
    }

    // Handle poster upload
    if (req.file) {
      if (event.posterPublicId) {
        await deleteFromCloudinary(event.posterPublicId);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, 'iste-gmrit/events');
      req.body.posterUrl = uploadResult.url;
      req.body.posterPublicId = uploadResult.publicId;
    }

    // Parse date if provided
    if (req.body.date) {
      req.body.date = new Date(req.body.date);
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    await logActivity({
      action: 'UPDATE',
      performedBy: req.user.userId,
      targetModel: 'Event',
      targetId: event._id,
      details: `Updated event "${updatedEvent.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * DELETE /api/events/:id
 * Creator | Central
 */
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    const isCreator = event.createdBy.toString() === req.user.userId.toString();
    const isCentral = req.user.role === 'central_faculty';

    if (!isCreator && !isCentral) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the event creator or central admin can delete.',
      });
    }

    if (event.posterPublicId) {
      await deleteFromCloudinary(event.posterPublicId);
    }

    await Event.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      performedBy: req.user.userId,
      targetModel: 'Event',
      targetId: event._id,
      details: `Deleted event "${event.title}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Event deleted successfully.',
    });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
