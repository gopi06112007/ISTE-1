const Gallery = require('../models/Gallery');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinaryUpload');
const logActivity = require('../utils/activityLogger');

/**
 * GET /api/gallery
 * Public — returns all albums
 */
const getAlbums = async (req, res) => {
  try {
    const { branch } = req.query;
    const filter = {};

    if (branch) filter.branch = branch.toUpperCase();

    const albums = await Gallery.find(filter)
      .populate({
        path: 'eventId',
        select: 'title date',
      })
      .populate({
        path: 'createdBy',
        select: 'role branch',
        populate: {
          path: 'profileId',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: albums.length,
      data: albums,
    });
  } catch (error) {
    console.error('Get albums error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * GET /api/gallery/:id
 * Public — get a single album
 */
const getAlbumById = async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id)
      .populate({
        path: 'eventId',
        select: 'title date venue',
      })
      .populate({
        path: 'createdBy',
        select: 'role branch',
        populate: {
          path: 'profileId',
          select: 'name',
        },
      });

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: album,
    });
  } catch (error) {
    console.error('Get album by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * POST /api/gallery
 * Branch Faculty | Central — multipart upload, Cloudinary
 */
const createAlbum = async (req, res) => {
  try {
    const { albumName, branch, eventId } = req.body;

    if (!albumName || !branch) {
      return res.status(400).json({
        success: false,
        message: 'albumName and branch are required.',
      });
    }

    // Upload all photos to Cloudinary
    const photoUrls = [];
    const photoPublicIds = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'iste-gmrit/gallery')
      );
      const results = await Promise.all(uploadPromises);
      results.forEach((res) => {
        photoUrls.push(res.url);
        photoPublicIds.push(res.publicId);
      });
    }

    const album = await Gallery.create({
      albumName,
      branch: branch.toUpperCase(),
      eventId: eventId || undefined,
      photos: photoUrls,
      photoPublicIds,
      createdBy: req.user.userId,
    });

    await logActivity({
      action: 'CREATE',
      performedBy: req.user.userId,
      targetModel: 'Gallery',
      targetId: album._id,
      details: `Created album "${albumName}" with ${photoUrls.length} photos in ${branch}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Album created successfully.',
      data: album,
    });
  } catch (error) {
    console.error('Create album error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * PATCH /api/gallery/:id/photos
 * Add photos to an existing album
 */
const addPhotosToAlbum = async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    // Creator or Central can add photos
    const isCreator = album.createdBy.toString() === req.user.userId.toString();
    const isCentral = req.user.role === 'central_faculty';

    if (!isCreator && !isCentral) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const newPhotoUrls = [];
    const newPhotoPublicIds = [];

    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, 'iste-gmrit/gallery')
      );
      const results = await Promise.all(uploadPromises);
      results.forEach((res) => {
        newPhotoUrls.push(res.url);
        newPhotoPublicIds.push(res.publicId);
      });
    }

    album.photos.push(...newPhotoUrls);
    if (album.photoPublicIds) {
      album.photoPublicIds.push(...newPhotoPublicIds);
    } else {
      album.photoPublicIds = newPhotoPublicIds;
    }
    await album.save();

    return res.status(200).json({
      success: true,
      message: `Added ${newPhotoUrls.length} photos to album.`,
      data: album,
    });
  } catch (error) {
    console.error('Add photos error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

/**
 * DELETE /api/gallery/:id
 * Creator | Central
 */
const deleteAlbum = async (req, res) => {
  try {
    const album = await Gallery.findById(req.params.id);

    if (!album) {
      return res.status(404).json({
        success: false,
        message: 'Album not found.',
      });
    }

    const isCreator = album.createdBy.toString() === req.user.userId.toString();
    const isCentral = req.user.role === 'central_faculty';

    if (!isCreator && !isCentral) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the album creator or central admin can delete.',
      });
    }

    if (album.photoPublicIds && album.photoPublicIds.length > 0) {
      const deletePromises = album.photoPublicIds.map((publicId) =>
        deleteFromCloudinary(publicId)
      );
      await Promise.all(deletePromises);
    }

    await Gallery.findByIdAndDelete(req.params.id);

    await logActivity({
      action: 'DELETE',
      performedBy: req.user.userId,
      targetModel: 'Gallery',
      targetId: album._id,
      details: `Deleted album "${album.albumName}"`,
    });

    return res.status(200).json({
      success: true,
      message: 'Album deleted successfully.',
    });
  } catch (error) {
    console.error('Delete album error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};

module.exports = {
  getAlbums,
  getAlbumById,
  createAlbum,
  addPhotosToAlbum,
  deleteAlbum,
};
