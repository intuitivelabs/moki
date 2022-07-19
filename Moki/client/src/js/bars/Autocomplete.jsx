import React, {
    Component,
    Fragment
} from "react";
import PropTypes from "prop-types";

const LOGICAL_OPERATORS_ES = ["OR", "AND"];
const OPERATORS_API = ["=", "~", ">", "<"];
const LOGICAL_OPERATORS_API = ["|", "&"];

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
            state: this.props.enter ? 2 : 0,
            finishedInput: ""
        };
    }

    // Event fired when the input value is changed
    onChange = e => {
        console.log("on change");

        const {
            suggestions
        } = this.props;
        const userInput = e.currentTarget.value;
        // Filter our suggestions that don't contain the user's input
        let filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        console.log("state");
        console.log(this.state.state);
        //check if input value finished so it can switch state to 3
        //if " or ' was closed and last char is space
        let increaseState = false;
        if(((userInput.match(/"/g) || []).length % 4 === 0) && ((userInput.match(/"/g) || []).length % 4 === 0) && userInput.endsWith(" ")){
            increaseState = true;
        }

         //show attr
         if ((increaseState && this.state.state+1 % 4 === 0) || this.state.state % 4 === 0) {
            console.log("suggestions attrs");
            //filteredSuggestions = this.props.suggestions;
        }


        //attr selected, show operator: =, ~ >, <, undef
        if ((increaseState && this.state.state+1 % 4 === 1) || this.state.state % 4 === 1) {
            console.log(" operators ")
            filteredSuggestions = OPERATORS_API;
        }

        //show logical operator
        if ((increaseState && this.state.state+1 % 4 === 3) || this.state.state % 4 === 3) {
            console.log(" logical ope");
            filteredSuggestions = LOGICAL_OPERATORS_API;
        }

        if(increaseState){
            this.setState({
                state: this.state.state +1,
                finishedInput: e.currentTarget.value
            })
        }

        console.log(filteredSuggestions);

        // Update the user input and filtered suggestions, reset the active
        // suggestion and make sure the suggestions are shown
        this.setState({
            activeSuggestion: -1,
            filteredSuggestions: filteredSuggestions,
            showSuggestions: true,
            userInput: e.currentTarget.value
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
        console.log("onClickInput hide ---");
        console.log(this.state.userInput);
        if (this.state.userInput.length === 0) {
            console.log("show suggestion");
            console.log(this.props.suggestions);
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

    // Event fired when the user clicks on a suggestion
    onClick = e => {
        console.log("onclick");
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
            console.log("-----------------------------");

            var input = this.state.finishedInput + e.currentTarget.innerText;
            console.log("this.state.userInput");

            console.log(this.state.userInput);
            console.log("e.currentTarget.innerText");

            console.log(e.currentTarget.innerText);

            console.log(input);
            console.log("this.state.finishedInput");

            console.log(this.state.finishedInput);
            if (this.state.state % 4 === 0 && this.props.type === "es") {
                input = input + ": ";
            }

            var filteredSuggestions = [];
            console.log(this.props.type);
            console.log("input");
            console.log(input);
            console.log("this.state.finishedInput");
            console.log(this.state.finishedInput);
            console.log("this.state.state");
            console.log(this.state.state);
            if (this.props.type === "es") {
                if (this.state.state % 4 === 0) {
                    filteredSuggestions = [];
                }
                else if (this.state.state % 4 === 3) {
                    filteredSuggestions = LOGICAL_OPERATORS_ES;
                }
            }
            else if (this.props.type === "api") {
                if (this.state.state % 4 === 2) {
                    filteredSuggestions = this.props.suggestions;
                }
                else if (this.state.state % 4 === 0) {
                    filteredSuggestions = OPERATORS_API;
                }
                else if (this.state.state % 4 === 3) {
                    filteredSuggestions = LOGICAL_OPERATORS_API;
                }
            }

            console.log(filteredSuggestions);

            this.setState({
                userInput: input,
                //activeSuggestion: -1,
                filteredSuggestions: filteredSuggestions,
                showSuggestions: true,
                finishedInput: input,
                state: this.state.state + 1
            });
        }

        //document.getElementById("searchBar").focus();
    };


    // Event fired when the user presses a key down
    onKeyDown = e => {
        const {
            activeSuggestion,
            filteredSuggestions
        } = this.state;

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
                    <ul className="suggestions" > {
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
        return (<Fragment>
            <input
                type="text"
                onChange={onChange}
                onKeyDown={onKeyDown}
                onClick={onClickInput}
                value={userInput}
                id="searchBar"
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
