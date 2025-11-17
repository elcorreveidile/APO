const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const {
  getContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact
} = require('../controllers/contactController');

// Validation rules
const contactValidation = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('phone').notEmpty().withMessage('El teléfono es requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('relation').isIn(['Familiar', 'Amigo/a', 'Vecino/a', 'Compañero/a', 'Otro'])
    .withMessage('Relación inválida')
];

router.use(protect); // All routes are protected

router.route('/')
  .get(getContacts)
  .post(contactValidation, validate, createContact);

router.route('/:id')
  .get(getContact)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
