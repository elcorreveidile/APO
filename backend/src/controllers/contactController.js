const Contact = require('../models/Contact');
const logger = require('../utils/logger');

/**
 * @desc    Get all contacts for logged in user
 * @route   GET /api/contacts
 * @access  Private
 */
exports.getContacts = async (req, res, next) => {
  try {
    const contacts = await Contact.find({
      user: req.user.id,
      isActive: true
    }).sort({ priority: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    logger.error('GetContacts error:', error);
    next(error);
  }
};

/**
 * @desc    Get single contact
 * @route   GET /api/contacts/:id
 * @access  Private
 */
exports.getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('GetContact error:', error);
    next(error);
  }
};

/**
 * @desc    Create new contact
 * @route   POST /api/contacts
 * @access  Private
 */
exports.createContact = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    const contact = await Contact.create(req.body);

    logger.info(`Contact created for user ${req.user.email}: ${contact.name}`);

    res.status(201).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('CreateContact error:', error);
    next(error);
  }
};

/**
 * @desc    Update contact
 * @route   PUT /api/contacts/:id
 * @access  Private
 */
exports.updateContact = async (req, res, next) => {
  try {
    let contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    logger.info(`Contact updated: ${contact.name}`);

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error('UpdateContact error:', error);
    next(error);
  }
};

/**
 * @desc    Delete contact
 * @route   DELETE /api/contacts/:id
 * @access  Private
 */
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: 'Contacto no encontrado'
      });
    }

    // Make sure user owns contact
    if (contact.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'No autorizado'
      });
    }

    // Soft delete - mark as inactive
    contact.isActive = false;
    await contact.save();

    logger.info(`Contact deleted: ${contact.name}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('DeleteContact error:', error);
    next(error);
  }
};
