var app = app || {};

app.currentInvestigation = app.currentInvestigation || null;

app.currentImage = app.currentImage || null;

(function(a) {
    var viewModel = kendo.observable({
        data: []
    });
    
    function init(e) {
        if (app.currentImage) {
            app.currentImage = null;
        }
        getAll().then(function(results) {
            viewModel.set("data", results);
            kendo.bind(e.view.element, viewModel, kendo.mobile.ui);
        }, a.error);
    }
    
    function addNewImage(e) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var lat = position.coords.latitude;
            var long = position.coords.longitude;
            navigator.camera.getPicture(function (url) {
                insertRecord(url, lat, long);
            }, a.error, {
                destinationType: 1
            });
        }, a.error, {
            enableHighAccuracy: true
        });
    }
    
    function insertRecord(url, latitude, longitude) {
        app.db.transaction(function(tx) {
            var cDate = new Date();
            tx.executeSql("INSERT INTO investigation_images (url, created, latitude, longitude, inv_id) VALUES (?,?,?,?,?)", [url, cDate, latitude, longitude, app.currentInvestigation.id]);
            var image = new Image(url, cDate, latitude, longitude, app.currentInvestigation.id);
            tx.executeSql("SELECT MAX(id) as maxId FROM investigation_images", [], function (x, y) {
                image.id = y.rows.item(0)["maxId"];
                viewModel.data.push(image);
            }, a.error);
        });
    };
        
    function getAll() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            app.db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM investigation_images WHERE inv_id = ?", [app.currentInvestigation.id], function(x, y) {
                    var results = [];
                    for (var i = 0; i < y.rows.length; i++) {
                        results.push(convertToModel(y.rows.item(i)));
                    }
                        
                    resolve(results);
                }, function(error) {
                    reject(error);
                });
            });
        });
            
        return promise;
    };
    
    function onTouch(e) {
        setById(e.target.context.id);
    };
    
    function setById(id) {
        app.db.transaction(function(tx) {
            tx.executeSql("SELECT * FROM investigation_images WHERE id = ?", [id], function(x, y) {
                app.currentImage = convertToModel(y.rows.item(0));
                a.application.navigate("views/google-maps-view.html#google-maps-view");
            }, a.error);
        });
    };
    
    function convertToModel(sqliteModel) {
        var newModel = new Image(sqliteModel.url, sqliteModel.created, sqliteModel.latitude, sqliteModel.longitude, sqliteModel.inv_id);
        newModel.id = sqliteModel.id;
        return newModel;
    };
    
    a.images = {
        init: init,
        add: addNewImage,
        onTouch: onTouch
    };
}(app));