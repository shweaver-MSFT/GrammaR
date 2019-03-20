/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

window.App = new function () {

    var messageBanner;

    var initialize = function () {

        // Initialize the FabricUI notification mechanism and hide it
        var element = document.querySelector('.ms-MessageBanner');
        messageBanner = new fabric.MessageBanner(element);
        messageBanner.hideBanner();
        if (messageBanner.classList) {
            messageBanner.classList.remove("hidden");
        }

        var contentRoot = document.getElementById("contentroot");
        contentRoot.classList.remove("hidden");

        navigate(App.Views.FirstRun);
    };

    var navigate = function (viewType) {

        if (!viewType) return;

        var vm = new viewType();
        var template = document.getElementById(vm.templateId);
        var view = template.cloneNode(true);

        view.removeAttribute("id");
        view.classList.remove("template");

        var contentRoot = document.getElementById("contentroot");
        contentRoot.innerHTML = "";
        contentRoot.appendChild(view);

        vm.initialize(view);
    };

    // Helper function for displaying notifications
    var showNotification = function (header, content) {
        document.querySelector("#notification-header").innerText = header;
        document.querySelector("#notification-body").innerText = content;
        messageBanner.showBanner();
        messageBanner.toggleExpansion();
    };

    this.initialize = initialize;
    this.navigate = navigate;
    this.showNotification = showNotification;
    this.Views = {};
};

// The initialize function must be run each time a new page is loaded.
Office.initialize = function (reason) {
    App.initialize();
};