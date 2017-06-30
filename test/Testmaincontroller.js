var assert = require('assert');
// Tests are hierarchical. Here we define a test suite for our calculator.
describe('Tests', function() {
	// And then we describe our testcases.
	it('returns 1+1=2', function(done) {
		assert.equal(1+1, 2);
		// Invoke done when the test is complete.
		done();
	});

});