(function () {

    window.App.Views.Issues = function () {

        var viewInstance = null;

        var initialize = function (view) {
            viewInstance = view;

            var settingsButton = view.querySelector(".settings-button");
            settingsButton.addEventListener("click", toggleAppSettings);

            var navUpButton = view.querySelector(".scroll-nav .up-button");
            navUpButton.addEventListener("click", scrollUp);

            var navDownButton = view.querySelector(".scroll-nav .down-button");
            navDownButton.addEventListener("click", scrollDown);

            /*
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            addSpellingIssue("partay", "party");
            addPassiveVoiceIssue();
            addConfusedWordIssue("PAX");
            addPunctuationIssue("then;", "then,");
            addGrammarIssue("Leger, Matisse,");
            addPassiveVoiceIssue();
            addConfusedWordIssue("foobar");
            */

            WordDocumentManager.addEventListener("documentChanged", function (e) {
                App.showNotification("documentChanged", "documentChanged: " + e.detail.documentText);
            });

            WordDocumentManager.addEventListener("documentCleared", function (e) {
                App.showNotification("documentCleared", "documentCleared");
            });

            WordDocumentManager.addEventListener("selectionChanged", function (e) {
                App.showNotification("selectionChanged", "selectionChanged: " + e.detail.selectionText);
            });

            WordDocumentManager.addEventListener("selectionCleared", function (e) {
                App.showNotification("selectionCleared", "selectionCleared");
            });

            WordDocumentManager.addEventListener("wordSelected", function (e) {
                App.showNotification("wordSelected", "wordSelected: " + e.detail.word);
            });

            WordDocumentManager.options.interval = 300;
            WordDocumentManager.start();

            // Turn on the loader to show that we are actively scanning the document
            var loader = view.querySelector(".loader");
            loader.classList.add("on");

            // This bit of JS hides the scroll bar by pushing it out of the frame.
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.style.marginRight = issueList.clientWidth - issueList.offsetWidth + "px";
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

        var scrollUp = function () {
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.scrollTop = 0;
        };

        var scrollDown = function () {
            var issueList = viewInstance.querySelector(".issue-list");
            issueList.scrollTop = issueList.clientHeight;
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

            addIssue(iconView, contentView);
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

            var itemTemplate = document.getElementById("issue-item-template");
            var itemView = itemTemplate.cloneNode(true);
            itemView.removeAttribute("id");
            itemView.classList.remove("template");

            var icon = itemView.querySelector(".icon");
            icon.appendChild(iconView);

            var issueContent = itemView.querySelector(".issue-content");
            issueContent.appendChild(issueContentView);

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

            var close = itemView.querySelector(".close");
            close.addEventListener("click", function () {
                this.parentNode.removeChild(this);
            }.bind(itemView));

            if (viewInstance) {
                var issueList = viewInstance.querySelector(".issue-list");
                issueList.appendChild(itemView);
            }
        };

        this.templateId = "issues-template";
        this.initialize = initialize;
    };

})();