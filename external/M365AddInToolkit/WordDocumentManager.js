/*
 WordDocumentManager

Events:
- DocumentChanged
- DocumentCleared
- SelectionChanged
- SelectionCleared
- WordSelected
 */

(function () {
    var WordDocumentManager = function () {

        var options = {
            interval: 200
        };

        var intervalId = null;

        var states = {
            isExecuting: false
        };

        var trackers = {
            documentHash: null,
            documentText: null,
            selectionText: null,
            selectedWord: null
        };

        var events = {
            onDocumentChanged: function () {
                var eventInitDict = {
                    detail: {
                        documentText: trackers.documentText
                    },
                    bubbles: true,
                    cancelable: true
                };
                var event = new CustomEvent("documentChanged", eventInitDict);
                dispatchEvent(event);
            },

            onDocumentCleared: function () {
                var eventInitDict = {
                    detail: {},
                    bubbles: true,
                    cancelable: true
                };
                var event = new CustomEvent("documentCleared", eventInitDict);
                dispatchEvent(event);
            },

            onSelectionChanged: function () {
                var eventInitDict = {
                    detail: {
                        selectionText: trackers.selectionText
                    },
                    bubbles: true,
                    cancelable: true
                };
                var event = new CustomEvent("selectionChanged", eventInitDict);
                dispatchEvent(event);
            },

            onSelectionCleared: function () {
                var eventInitDict = {
                    detail: {},
                    bubbles: true,
                    cancelable: true
                };
                var event = new CustomEvent("selectionCleared", eventInitDict);
                dispatchEvent(event);
            },

            onWordSelected: function () {
                var eventInitDict = {
                    detail: {
                        word: trackers.selectedWord
                    },
                    bubbles: true,
                    cancelable: true
                };
                var event = new CustomEvent("wordSelected", eventInitDict);
                dispatchEvent(event);
            }
        };

        var start = function () {
            if (intervalId) {
                stop();
            }

            states.isWordAvailable = typeof Word !== 'undefined';
            if (!states.isWordAvailable) {
                console.log("Warning: WordEventManager.js is loaded outside of Word");
            }

            if (!options.interval || options.interval <= 0) {
                stop();
                return;
            }

            intervalId = setInterval(
                function () {
                    try {
                        if (!states.isExecuting) {
                            states.isExecuting = true;
                            Word.run(checkDocument);
                            states.isExecuting = false;
                        }
                    }
                    catch (e) {
                        console.log("Error: WordEventManager: " + e);
                        stop();
                    }
                },
                options.interval);
        };

        var stop = function () {
            if (intervalId) {
                clearInterval(intervalId);
            }

            intervalId = null;

            states.isInitialized = false;
            states.isExecuting = false;
            states.isWordAvailable = null;

            for (var tracker in trackers) {
                trackers[tracker] = null;
            }
        };

        var checkDocument = function (context) {

            var selection = context.document.getSelection();
            context.load(selection, 'text');

            var body = context.document.body;
            context.load(body, 'text');

            context.sync()
                .then(function (e) {

                    // Selection*
                    var selectionText = selection.text;
                    if (selectionText || trackers.selectionText) {

                        // SelectionCleared
                        if (!selectionText && trackers.selectionText) {
                            trackers.selectionText = null;
                            trackers.selectedWord = null;
                            events.onSelectionCleared();
                        }

                        // SelectionChanged
                        else if (selectionText && selectionText !== trackers.selectionText) {
                            trackers.selectionText = selectionText;
                            events.onSelectionChanged();

                            // WordSelected
                            var word = selectionText.trim();
                            if (word !== trackers.selectedWord) {
                                if (!/\s/.test(word)) {
                                    trackers.selectedWord = word;
                                    events.onWordSelected();
                                }
                                else {
                                    trackers.selectedWord = null;
                                }
                            }
                        }
                    }

                    // Document*
                    var documentText = body.text;
                    if (documentText || trackers.documentHash) {

                        // DocumentCleared
                        if (!documentText && trackers.documentHash) {
                            trackers.documentHash = null;
                            trackers.documentText = null;
                            events.onDocumentCleared();
                        }

                        // DocumentChanged
                        else if (documentText) {
                            var documentHash = documentText.hashCode();

                            if (documentHash !== trackers.documentHash) {
                                trackers.documentHash = documentHash;
                                trackers.documentText = documentText;
                                events.onDocumentChanged();
                            }
                        }
                    }
                });
        };

        // Implement EventTarget to support eventing on this custom object
        eventify(this);

        var dispatchEvent = function (event) {
            this.dispatchEvent(event);
        }.bind(this);

        this.options = options;
        this.start = start.bind(this);
        this.stop = stop.bind(this);
    };

    // Set instance on window. WordDocumentManager should be consumed as a singleton.
    window.WordDocumentManager = new WordDocumentManager();
})();