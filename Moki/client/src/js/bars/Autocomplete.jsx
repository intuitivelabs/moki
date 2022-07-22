import React, {
    Component,
    Fragment
} from "react";
import PropTypes from "prop-types";
import { parseExpression } from "../helpers/match";

const LOGICAL_OPERATORS_ES = ["OR", "AND"];
const OPERATORS_API = ["=", "~", ">", "<"];
const LOGICAL_OPERATORS_API = ["&"];

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
            finishedInput: this.props.enter ? this.props.enter : "",
            saveInput: false
        };
    }

    endsWithAny(suffixes, string) {
        return suffixes.some(function (suffix) {
            return string.endsWith(suffix);
        });
    }

    // Event fired when the input value is changed
    onChange = e => {
        console.log("on change");
        const {
            suggestions
        } = this.props;
        let userInput = e.currentTarget.value;

        //remove finish input
        //userInput = userInput.substring(this.state.finishedInput.length, userInput.length);

        // Filter our suggestions that don't contain the user's input
        let filteredSuggestions = suggestions.filter(
            suggestion =>
                suggestion.toLowerCase().indexOf(userInput.toLowerCase()) > -1
        );

        console.log("focus!!");
        if (this.props.id) {
            console.log(  document.getElementById(this.props.id+"input"));
            document.getElementById(this.props.id+"input").focus();

        }

        console.log(this.state.finishedInput);
        console.log(e.currentTarget.innerText);
        console.log(e.currentTarget.value);
        console.log("userInput");
        console.log(userInput);

        console.log("---------state-----------");
        console.log(parseExpression(userInput));
        let state = parseExpression(userInput); 

        //if parse exp return json object, show operator
        if (state.constructor == Object) {
            state = 3;
        }

        // console.log(this.state.state);
        //check if input value finished so it can switch state to 3
        //if " or ' was closed and last char is space
        /*  let increaseState = false;
          if (((userInput.match(/"/g) || []).length % 2 === 0) && ((userInput.match(/"/g) || []).length % 2 === 0) && userInput.endsWith(" ")) {
              increaseState = true;
              console.log("increase break");
  
          }
  
          if (((userInput.match(/"/g) || []).length % 2 === 0) && ((userInput.match(/"/g) || []).length % 2 === 0) && this.endsWithAny(OPERATORS_API, userInput)) {
              console.log("increase operators");
              increaseState = true;
          }
  
  
          console.log("increaseState");
          console.log(increaseState);
          */
        //show attr
        if (state === 0) {
            console.log("suggestions attrs ");
            // filteredSuggestions = this.props.suggestions;
        }


        //attr selected, show operator: =, ~ >, <, undef
        if (state === 1 ) {
            console.log(" operators ")
            filteredSuggestions = OPERATORS_API;
        }

        if (state === 1 && userInput.endsWith(" ")) {
            console.log(" operators ")
            filteredSuggestions = OPERATORS_API;
            this.setState({saveInput: true})
        }

        if (state === 2 && this.endsWithAny(LOGICAL_OPERATORS_API, userInput)) {
            console.log(" value ")
            filteredSuggestions = "";
            this.setState({saveInput: true})
        }

        //show logical operator
        if (state === 3 && !(this.endsWithAny(LOGICAL_OPERATORS_API, userInput) || userInput.endsWith(" ")))  {
            console.log(" logical ope");
            filteredSuggestions = LOGICAL_OPERATORS_API;
        }

        //attrs
        if (state === 3 && (this.endsWithAny(LOGICAL_OPERATORS_API, userInput) || userInput.endsWith(" "))) {
            console.log(" show attr suggestion ");
           // filteredSuggestions = LOGICAL_OPERATORS_API;
        }

       /* if (increaseState) {
            this.setState({
                state: this.state.state + 1,
                finishedInput: e.currentTarget.value
            })
        }*/

        console.log( e.currentTarget.value ); 

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

    onBlur = e => {
        console.log("looooost focus");
        this.setState({
            showSuggestions: false
        });
    }

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
            console.log("---------state click-----------");
            console.log(this.state.finishedInput);
            console.log(e.currentTarget.innerText);
            console.log(e.currentTarget.value);
            console.log(this.state.userInput);
            console.log("this.state.state");
            console.log(this.state.state);
            var input = this.state.finishedInput + e.currentTarget.innerText;


            if(this.state.state === 2 || this.state.saveInput){
                input = this.state.userInput + e.currentTarget.innerText;
            }
            console.log(parseExpression(input));
            var state = parseExpression(this.state.finishedInput + e.currentTarget.innerText);

            //if parse exp return json object, show operator
            if (state && state.constructor == Object) state = 3;

            /*     console.log("this.state.userInput");
     
                 console.log(this.state.userInput);
                 console.log("e.currentTarget.innerText");
     
                 console.log(e.currentTarget.innerText);
     
                 console.log(input);
                 console.log("this.state.finishedInput");
     
                 console.log(this.state.finishedInput);
                 */
            if (state === 0 && this.props.type === "es") {
                input = input + ": ";
            }

            var filteredSuggestions = [];
            /*      console.log(this.props.type);
                  console.log("input");
                  console.log(input);
                  console.log("this.state.finishedInput");
                  console.log(this.state.finishedInput);
                  */

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
                    console.log("shoowing suggestions");
                    filteredSuggestions = this.props.suggestions;
                }
                //attribute case
                else if (state === 0) {
                    console.log("showing operators");
                    filteredSuggestions = OPERATORS_API;
                }
                //logical operator case
                else if (state === 3) {
                    console.log("showing logical operators");

                    filteredSuggestions = LOGICAL_OPERATORS_API;
                    //state = -1;
                }
            }

            console.log("focus!");
            if (this.props.id) {
                document.getElementById(this.props.id+"input").focus();

            }
            console.log(filteredSuggestions);

            this.setState({
                userInput: input,
                //activeSuggestion: -1,
                filteredSuggestions: filteredSuggestions,
                showSuggestions: true,
                finishedInput: input,
                state: state,
                saveInput: false
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
                    <ul className={this.props.type === "api" ? "suggestions" : "suggestions suggestionsMargin"}> {
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
                id={this.props.id ? this.props.id+"input" : "searchBar"}
                className={this.props.type === "api" ? "searchBar" : "searchBar searchBarNoMargin"}
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
