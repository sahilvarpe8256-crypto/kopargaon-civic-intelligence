const aiService = require('../src/services/aiService');
const aiValidator = require('../src/services/aiValidator');
const mockAi = require('../src/services/mockAi');

module.exports = {
  ...aiService,
  aiValidator,
  mockAi
};