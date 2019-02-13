function logError(method, path, err) {
    console.error(`An error occured during ${method} (${path}): ${err}`);
}

module.exports = function (req, m, p, e) {
    logError(m, p, e);
    return req.flash("error", "An error occured, try again or contact web admin!");
};