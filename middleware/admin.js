module.exports = function (req, res, next) {
    // 401 -> UnAuthorized (Means you haven't sent the auth token)
    // 403 -> Forbidden (Means dont try again you dont have access)
    if (!req.user.isAdmin) return res.status(403).send('Access Denied!!')
    next()
}