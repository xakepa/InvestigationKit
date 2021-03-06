var app = app || {};

app.currentInvestigation = app.currentInvestigation || null;

(function(a) {
    var viewModel = kendo.observable({
        title: ""
    });
    
    function init(e) {
        if (app.currentInvestigation) {
            app.currentInvestigation = null;
        }
        kendo.bind(e.view.element, viewModel);       
    }
    
    function start() {
        if (!viewModel.title.length) {
            navigator.notification.alert("The title should not be empty", null, "Must not be empty!");
        }
        else {
            insertRecord(viewModel.title);
            a.application.navigate("views/investigation-view.html#investigation-view");
        }
    }
    
    function insertRecord(t) {
        app.db.transaction(function(tx) {
            var cDate = new Date();
            tx.executeSql("INSERT INTO investigations (title, created) VALUES (?,?)", [t, cDate]);
            app.currentInvestigation = new Investigation(t, cDate);
            tx.executeSql("SELECT MAX(id) as maxId FROM investigations", [], function (x, y) {
                app.currentInvestigation.id = y.rows.item(0)["maxId"];
            }, a.error);
        });
    };
    
    a.newInvestigation = {
        init: init,
        start: start
    };
}(app));