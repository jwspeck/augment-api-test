const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Validation failed', 
            details: errors.array() 
        });
    }
    next();
};

// Task creation validation
const validateCreateTask = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be 500 characters or less'),
    body('details')
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage('Details must be 10,000 characters or less'),
    body('parentId')
        .optional()
        .isInt({ min: 1 }).withMessage('Parent ID must be a positive integer'),
    body('order')
        .optional()
        .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    handleValidationErrors
];

// Task update validation
const validateUpdateTask = [
    param('id')
        .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    body('title')
        .optional()
        .trim()
        .notEmpty().withMessage('Title cannot be empty')
        .isLength({ max: 200 }).withMessage('Title must be 200 characters or less'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be 500 characters or less'),
    body('details')
        .optional()
        .trim()
        .isLength({ max: 10000 }).withMessage('Details must be 10,000 characters or less'),
    body('done')
        .optional()
        .isBoolean().withMessage('Done must be a boolean'),
    body('parentId')
        .optional()
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage('Parent ID must be null or a positive integer'),
    body('order')
        .optional()
        .isInt({ min: 0 }).withMessage('Order must be a non-negative integer'),
    handleValidationErrors
];

// Task ID validation
const validateTaskId = [
    param('id')
        .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    handleValidationErrors
];

// Move task validation
const validateMoveTask = [
    param('id')
        .isInt({ min: 1 }).withMessage('Task ID must be a positive integer'),
    body('newParentId')
        .optional()
        .custom((value) => value === null || (Number.isInteger(value) && value > 0))
        .withMessage('New parent ID must be null or a positive integer'),
    body('newOrder')
        .optional()
        .isInt({ min: 0 }).withMessage('New order must be a non-negative integer'),
    handleValidationErrors
];

// Search validation
const validateSearch = [
    query('q')
        .trim()
        .notEmpty().withMessage('Search query is required')
        .isLength({ max: 100 }).withMessage('Search query must be 100 characters or less'),
    handleValidationErrors
];

module.exports = {
    validateCreateTask,
    validateUpdateTask,
    validateTaskId,
    validateMoveTask,
    validateSearch
};

