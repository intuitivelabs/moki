import React, {
    Component,
    Fragment
} from "react";
import PropTypes from "prop-types";
import { parseExpression } from '@moki-client/gui';
const OPERATORS_API = ["=", "~", ">", "<"];
const LOGICAL_OPERATORS_API = ["&"];
const LOGICAL_OPERATORS_ES = ["OR", "AND"];

class Autocomplete extends Component {
    static propTypes = {
        suggestions: PropTypes.instanceOf(Array)
    };

    static defaultProps = {
        suggestions: []
    };

    /*
state: 0 - attribute
state: 1 - operator  (in ES case missing)
state: 2 - value
state: 3 - logical operator
*/
    constructor(props) {
        super(props);

        this.state = {
            // The active selection's index
            activeSuggestion: -1,
            // The suggestions that match the user's input
            filteredSuggestions: [],
            // Whether or not the suggestion list is shown
            showSuggestions: false,
            // What the user has entered
            userInput: this.props.enter ? this.props.enter : "",
            tags: this.props.tags,
            //fisnihed input without the part that users is actually writing
            finishedInput: this.props.enter ? this.props.enter : "",
            //if should close suggestions window
            blur: null,
            deleting: false,
            state: null
        };
    }

    //string ends with any of those characters
    endsWithAny(suffixes, string) {
        return suffixes.some(function (suffix) {
            return string.endsWith(suffix);
        });
    }

    // Event fired when the input value is changed
    onChange = e => {
        const {
            suggestions
        } = this.props;
        let userInput = e.currentTarget.value;

        if (this.props.type === "api") {
            var LOGICAL_OPERATORS = LOGICAL_OPERATORS_API;
            var OPERATORS = OPERATORS_API;
        }
        else {
            var LOGICAL_OPERATORS = LOGICAL_OPERATORS_ES;
            var OPERATORS = [];
        }
        let state = parseExpression(userInput, "parse");
        if (state && state.logicalOp) {
            userInput = "";
        }

        //if parse exp return json object, show operator
        if (state && state.constructor == Object && !state.logicalOp) {
            state = 3;
        }

        if (state === 0 && userInput.includes("&")) {
            let userInputWhole = userInput;
            userInput = userInput.substr(userInput.lastIndexOf("&") + 1, userInput.length);
            if (userInput.charAt(0) === " ") userInput = userInput.substr(1, userInput.length);
            this.setState({
                finishedInput: userInputWhole.replace(userInput, '')
            })
        }

        // Filter our suggestions that don't contain the user's input
        let filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        if (this.props.id) {
            document.getElementById(this.props.id + "input").focus();
        }
        else {
            document.getElementById("searchBar").focus();
        }

        //attr selected, show operator: =, ~ >, <, undef
        if (state === 1) {
            filteredSuggestions = OPERATORS;
        }

        if (state === 1 && userInput.endsWith(" ")) {
            filteredSuggestions = OPERATORS;
        }

        if (state === 2 && this.endsWithAny(LOGICAL_OPERATORS, userInput)) {
            filteredSuggestions = "";
        }

        //show logical operator
        if (state === 3 && (!this.endsWithAny(LOGICAL_OPERATORS, userInput) || userInput.endsWith(" "))) {
            filteredSuggestions = LOGICAL_OPERATORS;
        }

        //attrs
        if (state === 3 && (this.endsWithAny(LOGICAL_OPERATORS, userInput) || userInput.endsWith(" "))) {
        }


        // Update the user input and filtered suggestions, reset the active
        // suggestion and make sure the suggestions are shown
        this.setState({
            activeSuggestion: -1,
            filteredSuggestions: filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value,
            state: state
        });

        if (userInput === "tags:" || userInput === "tags: ") {
            this.setState({
                filteredSuggestions: this.state.tags,
                showSuggestions: true
            });
        }
    };

    // Event fired when the input value is changed
    onClickInput = e => {
        if (this.state.userInput.length === 0) {
            this.setState({
                activeSuggestion: -1,
                filteredSuggestions: this.props.suggestions,
                showSuggestions: true
            });
        }
        // hide suggestions
        else {
            this.setState({
                activeSuggestion: -1,
                filteredSuggestions: [],
                showSuggestions: false
            });
        }
    };

    onBlur = e => {
        let blur = setTimeout(() => {
            this.setState({ showSuggestions: false });
        }, 300);

        this.setState({
            blur: blur
        });
    }

    // Event fired when the user clicks on a suggestion
    onClick = e => {
        clearTimeout(this.state.blur);
        this.setState({ blur: null });
        // if you already wrote whole tags string
        if (this.state.userInput === "tags:" || this.state.userInput === "tags: ") {
            this.setState({
                userInput: this.state.userInput + e.currentTarget.innerText,
                activeSuggestion: -1,
                filteredSuggestions: [],
                showSuggestions: false,
            });
        }
        //if you choose tag from dropdown, axtivate tags options
        else if (e.currentTarget.innerText === "tags") {

            this.setState({
                userInput: e.currentTarget.innerText + ": ",
                filteredSuggestions: this.state.tags,
                showSuggestions: true
            });
        } else {
            var input = this.state.finishedInput + e.currentTarget.innerText;
            if (this.state.deleting) {
                if (this.state.state !== 0) input = this.state.userInput + e.currentTarget.innerText;
            }
            var state = parseExpression(input, "parse");

            if (state && state.logicalOp) {
                state = 1;
            }

            //if parse exp return json object, show operator
            if (state && state.constructor == Object) state = 3;
            if (state === 0 && this.props.type === "es") {
                input = input + ": ";
            }

            var filteredSuggestions = [];
            // let state = this.state.state + 1;
            if (this.props.type === "es") {
                //attribute case
                if (state === 0) {
                    filteredSuggestions = [];
                }
                //logical operator case
                else if (state === 3) {
                    filteredSuggestions = LOGICAL_OPERATORS_ES;
                }
            }
            else if (this.props.type === "api") {
                //value case
                if (state === 1) {
                    filteredSuggestions = this.props.suggestions;
                }
                //attribute case
                else if (state === 0) {
                    filteredSuggestions = OPERATORS_API;
                }
                //logical operator case
                else if (state === 3) {
                    filteredSuggestions = LOGICAL_OPERATORS_API;
                }
            }

            if (this.props.id) {
                document.getElementById(this.props.id + "input").focus();
            }
            else {
                document.getElementById("searchBar").focus();
            }

            this.setState({
                userInput: input,
                //activeSuggestion: -1,
                filteredSuggestions: filteredSuggestions,
                showSuggestions: true,
                finishedInput: input,
                state: state,
                blur: false,
                deleting: false
            });
        }
    };


    // Event fired when the user presses a key down
    onKeyDown = e => {
        const {
            activeSuggestion,
            filteredSuggestions
        } = this.state;

        //whe user deletes something, store it
        if (e.keyCode == 8 || e.keyCode == 46) {
            this.setState({
                deleting: true
            });
        }

        // User pressed the enter key, update the input and close the
        // suggestions
        if (e.keyCode === 13) {
            //if suggestion was selected
            if (this.state.activeSuggestion !== -1) {
                this.setState({
                    activeSuggestion: -1,
                    showSuggestions: false,
                    userInput: filteredSuggestions[activeSuggestion]
                });
            }
            //no suggestion selected, create new filter on enter
            else {
                if (document.getElementById("filterButton")) document.getElementById("filterButton").click();
            }

        }
        // User pressed the up arrow, decrement the index
        else if (e.keyCode === 38) {
            if (activeSuggestion === 0) {
                return;
            }

            this.setState({
                activeSuggestion: activeSuggestion - 1
            });
        }
        // User pressed the down arrow, increment the index
        else if (e.keyCode === 40) {
            if (activeSuggestion - 1 === filteredSuggestions.length) {
                return;
            }

            this.setState({
                activeSuggestion: activeSuggestion + 1
            });
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.enter !== this.props.userInput) {
            this.setState({
                userInput: ""
            });
        }

        if (nextProps.tags !== this.props.tags) {
            this.setState({
                tags: nextProps.tags
            });
        }
    }


    render() {
        const {
            onChange,
            onClick,
            onClickInput,
            onKeyDown,
            onBlur,
            state: {
                activeSuggestion,
                filteredSuggestions,
                showSuggestions,
                userInput
            }
        } = this;

        let suggestionsListComponent;

        if (showSuggestions && userInput) {
            if (filteredSuggestions.length) {
                suggestionsListComponent = (
                    <ul className={this.props.type === "api" ? "suggestions" : "suggestions suggestionsMargin"} id={this.props.id ? this.props.id + "suggestions" : "suggestions"}> {
                        filteredSuggestions.map((suggestion, index) => {
                            let className;
                            // Flag the active suggestion with a class
                            if (index === activeSuggestion) {
                                className = "suggestion-active";
                            }

                            return (<li className={className}
                                key={suggestion}
                                onClick={onClick}
                                tabIndex={0}
                            > {suggestion} </li>
                            );
                        })
                    } </ul>
                );
            } else {
                suggestionsListComponent = (<div className="no-suggestions" >
                </div>
                );
            }
        }

        let barWidth = "94%";
        if (window.location.pathname === "/connectivityCA") barWidth = "70%";
        if (window.location.pathname === "/conference") barWidth = "84%";
        if (this.props.type === "api") barWidth = "300px";
        return (<Fragment>
            <input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                onClick={onClickInput}
                onBlur={onBlur}
                value={userInput}
                id={this.props.id ? this.props.id + "input" : "searchBar"}
                className={this.props.type !== "api" ? "searchBar" : "searchBar searchBarNoMargin"}
                placeholder={this.props.placeholder ? this.props.placeholder : "FILTER: attribute:value"}
                autoComplete="new-password"
                style={{ "width": barWidth }}
            />
            {suggestionsListComponent}
        </Fragment>
        );
    }
}

export default Autocomplete;
