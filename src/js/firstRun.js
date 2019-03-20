(function () {
    window.App.Views.FirstRun = function () {

        var back = function () {
            console.log("back clicked");
        };

        var next = function () {
            console.log("next clicked");
        };

        var skip = function () {
            App.navigate(App.Views.Issues);
        };

        var initialize = function (view) {

            var skipButton = view.querySelector(".skip-button");
            skipButton.addEventListener("click", skip);

            var backButton = view.querySelector(".back-button");
            backButton.addEventListener("click", back);

            var nextButton = view.querySelector(".next-button");
            nextButton.addEventListener("click", next);

            // This bit of JS hides the scroll bar by pushing it out of the frame.
            var scrollPanel = view.querySelector(".scroll-panel");
            scrollPanel.style.width = "calc(100vw + " + (scrollPanel.offsetWidth - scrollPanel.clientWidth) + "px)";
        };

        this.templateId = "first-run-template";
        this.initialize = initialize;
    };
})();