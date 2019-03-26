(function () {

    window.App.Views.Issues = function () {

        var viewInstance = null;
        var issueBindings = null;

        var initialize = function (view) {
            viewInstance = view;
            issueBindings = {};

            var settingsButton = view.querySelector(".settings-button");
            settingsButton.addEventListener("click", toggleAppSettings);

            var navUpButton = view.querySelector(".scroll-nav .up-button");
            navUpButton.addEventListener("click", scrollUp);

            var navDownButton = view.querySelector(".scroll-nav .down-button");
            navDownButton.addEventListener("click", scrollDown);

            WordDocumentManager.addEventListener("documentChanged", function (e) {
                //App.showNotification("documentChanged", "documentChanged: " + e.detail.documentText);
            });

            WordDocumentManager.addEventListener("documentCleared", function (e) {
                //App.showNotification("documentCleared", "documentCleared");
            });

            WordDocumentManager.addEventListener("selectionChanged", function (e) {
                //App.showNotification("selectionChanged", "selectionChanged: " + e.detail.selectionText);
            });

            WordDocumentManager.addEventListener("selectionCleared", function (e) {
                //App.showNotification("selectionCleared", "selectionCleared");
            });

            WordDocumentManager.addEventListener("wordSelected", function (e) {
                //App.showNotification("wordSelected", "wordSelected: " + e.detail.word);

                var bindingId = "binding_" + e.detail.word;

                if (issueBindings[bindingId]) return;

                // Bind to the currently selected text in the document
                Office.context.document.bindings.addFromSelectionAsync(Office.BindingType.Text, { id: bindingId }, function (asyncResult) {
                    if (asyncResult.status !== Office.AsyncResultStatus.Succeeded)  return;
                       
                    var binding = asyncResult.value;
                    issueBindings[binding.id] = binding;

                    // Create the new issue item view and set the binding id
                    var issueView = addGrammarIssue(e.detail.word);
                    issueView.id = binding.id;

                    // Register binding handlers
                    var onBindingDataChanged = function() {
                        //App.showNotification("onBindingDataChanged: " + binding.id);
                    };
                    binding.addHandlerAsync(Office.EventType.BindingDataChanged, onBindingDataChanged);

                    var onBindingSelectionChanged = function() {
                        //App.showNotification("onBindingSelectionChanged: " + binding.id);
                        scrollToIssue(binding.id);
                        unfocusAll();
                        issueView.classList.add("focused");
                    };
                    binding.addHandlerAsync(Office.EventType.BindingSelectionChanged, onBindingSelectionChanged);

                    // Click on close button
                    // - Deregister event handlers
                    // - Remove binding
                    var close = issueView.querySelector(".close");
                    close.addEventListener("click", function () {
                        binding.removeHandlerAsync(Office.EventType.BindingDataChanged, onBindingDataChanged);
                        binding.removeHandlerAsync(Office.EventType.BindingSelectionChanged, onBindingSelectionChanged);
                        Office.context.document.bindings.releaseByIdAsync(binding.id);
                        issueBindings[binding.id] = undefined;
                    });
                    
                    // Click on content
                    // - Focus on binding
                    issueView.addEventListener("click", function () {
                        Office.context.document.goToByIdAsync(binding.id, Office.GoToType.Binding);
                        unfocusAll();
                        issueView.classList.add("focused");
                    });

                    unfocusAll();
                    issueView.classList.add("focused");
                });
            });

            WordDocumentManager.options.interval = 300;
            WordDocumentManager.start();

            // Turn on the loader to show that we are actively scanning the document
            var loader = view.querySelector(".loader");
            loader.classList.add("on");

            // This bit of JS hides the scroll bar by pushing it out of the frame.
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.style.marginRight = issueList.offsetWidth - viewInstance.clientWidth + "px";
        };

        var unfocusAll = function () {
            var issueList = viewInstance.querySelector(".issue-list");
            for(var i = 0; i < issueList.children.length; i++) {
                var issue = issueList.children[i];
                if (issue && issue.classList.contains("focused")) {
                    issue.classList.remove("focused");
                }
            }
        };

        var toggleAppSettings = function () {

            var appSettingsView = viewInstance.querySelector(".app-settings");

            // If the pane does not yet exist, create it.
            if (!appSettingsView) {
                var appSettingsTemplate = document.getElementById("app-settings-template");
                appSettingsView = appSettingsTemplate.cloneNode(true);
                appSettingsView.removeAttribute("id");
                appSettingsView.classList.remove("template");

                viewInstance.appendChild(appSettingsView);
                return;
            }

            // Toggle the pane
            if (appSettingsView.classList.contains("collapsed")) {
                appSettingsView.classList.remove("collapsed");
            }
            else {
                appSettingsView.classList.add("collapsed");
            }
        };

        var scrollToIssue = function (issueId) {            
            var issueList = viewInstance.querySelector(".issue-list");
            var issue = issueList.querySelector("#" + issueId);
            issueList.scrollTop = issue.offsetTop - issue.clientHeight;
        }

        var scrollUp = function () {
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.scrollTop = 0;
        };

        var scrollDown = function () {
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.scrollTop = issueList.scrollHeight;
        };

        var addSpellingIssue = function (mistakeWord, correctionWord) {
            var iconView = document.createElement("span");
            iconView.classList.add("mdl2");
            iconView.classList.add("mdl2-edit");

            var contentTemplate = document.getElementById("spelling-issue-content-template");
            var contentView = contentTemplate.cloneNode(true);
            contentView.removeAttribute("id");
            contentView.classList.remove("template");

            var mistake = contentView.querySelector(".mistake");
            mistake.innerText = mistakeWord;

            var correction = contentView.querySelector(".correction");
            correction.innerText = correctionWord;

            var expandedContentTemplate = document.getElementById("spelling-issue-expanded-content-template");
            var expandedContentView = expandedContentTemplate.cloneNode(true);
            expandedContentView.removeAttribute("id");
            expandedContentView.classList.remove("template");

            var wordElements = expandedContentView.getElementsByClassName("word");
            for (var i in wordElements) {
                wordElements[i].innerText = mistakeWord;
            }

            addIssue(iconView, contentView, expandedContentView);
        };

        var addGrammarIssue = function (correctionWord) {
            var iconView = document.createElement("span");
            iconView.classList.add("mdl2");
            iconView.classList.add("mdl2-page");

            var contentTemplate = document.getElementById("grammar-issue-content-template");
            var contentView = contentTemplate.cloneNode(true);
            contentView.removeAttribute("id");
            contentView.classList.remove("template");

            var correction = contentView.querySelector(".correction");
            correction.innerText = correctionWord;

            return addIssue(iconView, contentView);
        };

        var addConfusedWordIssue = function (word) {
            var iconView = document.createElement("span");
            iconView.classList.add("mdl2");
            iconView.classList.add("mdl2-edit");

            var contentTemplate = document.getElementById("confused-word-issue-content-template");
            var contentView = contentTemplate.cloneNode(true);
            contentView.removeAttribute("id");
            contentView.classList.remove("template");

            var confusedWord = contentView.querySelector(".confused-word");
            confusedWord.innerText = word;

            addIssue(iconView, contentView);
        };

        var addPassiveVoiceIssue = function () {
            var iconView = document.createElement("span");
            iconView.classList.add("mdl2");
            iconView.classList.add("mdl2-page");

            var contentTemplate = document.getElementById("passive-voice-issue-content-template");
            var contentView = contentTemplate.cloneNode(true);
            contentView.removeAttribute("id");
            contentView.classList.remove("template");

            addIssue(iconView, contentView);
        };

        var addPunctuationIssue = function (mistakeWord, correctionWord) {
            var iconView = document.createElement("span");
            iconView.classList.add("mdl2");
            iconView.classList.add("mdl2-edit");

            var contentTemplate = document.getElementById("spelling-issue-content-template");
            var contentView = contentTemplate.cloneNode(true);
            contentView.removeAttribute("id");
            contentView.classList.remove("template");

            var mistake = contentView.querySelector(".mistake");
            mistake.innerText = mistakeWord;

            var correction = contentView.querySelector(".correction");
            correction.innerText = correctionWord;

            addIssue(iconView, contentView);
        };

        var addIssue = function (iconView, issueContentView, expandedView) {

            // Get the template, clone, and prep
            var itemTemplate = document.getElementById("issue-item-template");
            var itemView = itemTemplate.cloneNode(true);
            itemView.removeAttribute("id");
            itemView.classList.remove("template");

            // Icon
            var icon = itemView.querySelector(".icon");
            icon.appendChild(iconView);

            // Content
            var issueContent = itemView.querySelector(".issue-content");
            issueContent.appendChild(issueContentView);

            // Expanded content (if any)
            var expand = itemView.querySelector(".expand");
            if (expandedView) {
                var expanderPanel = itemView.querySelector(".expander-panel");
                expanderPanel.appendChild(expandedView);

                expand.addEventListener("click", function () {

                    if (expanderPanel.classList.contains("collapsed")) {
                        expanderPanel.classList.remove("collapsed");
                    }
                    else {
                        expanderPanel.classList.add("collapsed");
                    }

                }.bind(itemView));
            }
            else {
                expand.classList.add("hidden");
            }

            // Close button
            var close = itemView.querySelector(".close");
            close.addEventListener("click", function () {
                this.parentNode.removeChild(this);

                var criticalCount = viewInstance.querySelector(".issue-count .critical-count");
                var count = parseInt(criticalCount.innerText) - 1;
                criticalCount.innerText = count;

                var emptyStatePanel = viewInstance.querySelector(".empty-state-panel");
                if (count <= 0) {
                    emptyStatePanel.classList.remove("hidden");
                }
            }.bind(itemView));

            // Append issue to the list
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.appendChild(itemView);
            scrollDown();

            // Update the issue counter
            var criticalCount = viewInstance.querySelector(".issue-count .critical-count");
            criticalCount.innerText = parseInt(criticalCount.innerText) + 1;

            // Hide the empty state panel
            var emptyStatePanel = viewInstance.querySelector(".empty-state-panel");
            if (!emptyStatePanel.classList.contains("hidden")) {
                emptyStatePanel.classList.add("hidden");
            }

            return itemView;
        };

        this.templateId = "issues-template";
        this.initialize = initialize;
    };

})();