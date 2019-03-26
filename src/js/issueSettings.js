(function () {

    window.App.Views.IssueSettings = function () {

        var initialize = function (view) {
            
            var closeButton = view.querySelector(".close-button");
            closeButton.addEventListener("click", function() {
                view.classList.add("collapsed");
            });
        };

        this.templateId = "issue-settings-template";
        this.initialize = initialize;
    };

})();