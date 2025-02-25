const express = require('express');
const router = express.Router();

// Just a placeholder for now
router.get('/', (req, res) => {
  res.json({ message: 'Transactions route working' });
});

module.exports = router;