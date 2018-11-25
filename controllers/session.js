module.exports = function(app) {

    app.all('/*', function(req, res, next) {
        console.log('Filtering request...');
        
        next();
    });

};