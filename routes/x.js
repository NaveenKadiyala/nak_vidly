
// POST /api/returns {customerId, movieId}

// Return 401 if client is not loggedIn
// Return 400 if customerId was not provided
// Return 400 if movieId was not provided
// Return 404 if not rental found for this customer/movie
// Return 400 if rental already processed
// set the return date
// calculate the rental fee
// Increase the stock
// Return the rental as summary