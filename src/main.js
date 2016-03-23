/* https://github.com/happypoulp/redux-tutorial
 * 
 * Redux! It only deals with application state which is held in a single object - the store.
 * We update the store by firing actions - We don't edit the store directly.
 * We can subscribe to the store to get notified of state changes and
 * we can ask the store for a copy of the current state.
 *
 *  -------------------------------------------------------------------
 *  | Everything inside this ascii box is our other code, redux       |
 *  | doesn't care about this bit. Here we handle user interactions,  |
 *  | browser events, server events, DOM changes, asking Redux to     |
 *  | update state and recieving state updates from Redux.            |
 *  |                                                                 |
 *  |        Our subscriber                   Our dispatcher          |
 *  -------------------------------------------------------------------
 *                 ↑                                ↓
 *  -------------------------------------------------------------------
 *  |           Reducer    ←    Middleware   ←   Action               |
 *  |                                                                 |
 *  | This ascii box is Redux.                                        |
 *  | Actions comes in, they have a type eg 'SET_NAME' and sometimes  |
 *  |    data eg 'bob'.                                               |
 *  | Middleware functions run on every action before it hits the     |
 *  |    store, we can have 1, none or many. A middleware function    |
 *  |    might do something like capitalize a name: 'Bob', or log the |
 *  |    action, or do some kind of validation...                     |
 *  | Reducers are functions built into the store and handle state    |
 *  |    updates. But - they don't update the state directly. Instead |
 *  |    the store creates a new state object with the updates which  |
 *  |    the reducers make. The new state object is now the current   |
 *  |    state. When that's finished, any subscribers are notified    |
 *  |    of a state change.                                           |
 *  -------------------------------------------------------------------
 * 
 */



/* ================================================================================== Actions
 * All information is passed through actions.
 * These are objects that can take any form but: https://github.com/acdlite/flux-standard-action
 * There's even an action compliance test on that repo if we use this
 * {
 *     type: String,
 *     payload: Any,
 *     error: Boolean,
 *     meta: Any
 * }
 */

//var USER_ACTIONS = require('./actionTypes.js').USER_ACTIONS;
//we cuold use plain strings, but: http://redux.js.org/docs/recipes/ReducingBoilerplate.html
const USER_ACTIONS = {
	CREATE: 'CREATE_USER',
	SET_NAME: 'SET_NAME',
	DELETE: 'DELETE_USER'
};

var AsyncSetNameActionCreator = function (name) {
	//returning a function that is passed dispatch so that this may dispatch the action when our sudo async completes
	//this won't work without the thunk middleware function (below) as reducers won't accept functions.
	return function(dispatch) {
		setTimeout(function () {
			dispatch({
				type: USER_ACTIONS.SET_NAME,
				payload: name,
				error: false
			})
		}, 2000);
	}
}


/* ================================================================================== Middleware
 * First level: provides dispatch & getState? functions for the next two levels to use
 * Second level: provides next which we can return to move on to the next step in the process (think express.js - or is that native to node? Can't rmember, one of the two)
 * Third level: proveds the action from dispatch or from any previous middleware that has run before this one.
 * Each piece of Middleware is registered with redux through applyMiddleware()
 * http://redux.js.org/docs/introduction/Ecosystem.html
 */

//First level
 var middleware_1 = function ({ dispatch, getState }) {
	//Second level
	return function(next) {
		//Third level
		return function (action) {
			//this is thunk - it lets us process async stuff that comes from the action 
			// I think it does this by catching the distpatch fired off when the 'async' bit above resolves
			return typeof action === 'function' ?
                action(dispatch, getState) :
                next(action)
		}
	}
}

 var middleware_2 = function ({ dispatch, getState }) {
	return function(next) {
		return function (action) {
			//this is another bit of middleware, it does log!
			console.log('middleware_2: action received: ', action);
            return next(action);
		}
	}
}


/* ================================================================================== Reducers
 * Reducers handle state changes. We can have one big one to handle the entire state 
 * object, or we can have many - each handling only a bit of the state object.
 *
 * These recieve the current state object (or a part of it) & an action.
 * They create a new instance of the state object and mutate it based on that action.
 * They return the new mutated state object.
 *  - They do not mutate anything outside their own scope: http://www.sitepoint.com/functional-programming-pure-functions/
 *    "It’s a coffee grinder: beans go in, powder comes out, end of story."
 */
console.groupCollapsed("initialization");

var userReducer = function (state = {}, action) {
	console.groupCollapsed("userReducer");
		console.log('state : ', state);
		console.log('action: ', action);
	console.groupEnd();

	switch (action.type) {
		case 'SET_NAME':
			return {
				name: action.payload
			}
		default:
			return state;
	}
}

var itemsReducer = function (state = [], action) {
	console.groupCollapsed("itemsReducer");
		console.log('state : ', state);
		console.log('action: ', action);
	console.groupEnd();

	switch (action.type) {
		case 'ADD_ITEM':
			return [
				action.item
			]
		default:
			return state;
	}
}




/* ================================================================================== Redux
 * This is where we pass all the above bits to Redux: actions, middleware, and reducers.
 */

//import { createStore, combineReducers , applyMiddleware} from 'redux';
var createStore = require('redux').createStore; //the ability to instanciate THE store
var combineReducers = require('redux').combineReducers; //the ability to assign each reducer to a specific part of the state object
var applyMiddleware = require('redux').applyMiddleware; //the ability to insert middleware

//Part 1: creates THE store and registers middleware that will run in the order given
const middlewareBuild = applyMiddleware(middleware_1, middleware_2)(createStore);

//Part 2: bundle the reducers in an object that will become our entire app state
var reducerBuild = combineReducers({
	user: userReducer,
	items: itemsReducer
})

//Part 3: apply the bundled reducer store object thing to the simple store we created in Part 1.
var store = middlewareBuild(reducerBuild);

console.groupEnd(); //end initialization console group - Redux is now set up.



/* ================================================================================== 
 * ==================================================================================
 * now we play! This is the code from the top ascii box.
 */


//This handles user input
document.getElementById("go").addEventListener("click", function(){
    var inputVal = document.getElementById('input').value;

    //our dispatcher
    store.dispatch(AsyncSetNameActionCreator(inputVal));
});

//our subscriber
store.subscribe(function() {
	var newState = store.getState();
    document.getElementById('result').innerHTML = newState.user.name;

    //TODO: how do we know which part of teh state object changed?
});

//TODO: how to unsubscribe?
//TODO: how to expose the store - I'm not seeing it in the global scope, is this due to browserify doing it's thing? 


/* ================================================================================== In review: 
 *
 * Pros: 
 * 	 - Predictable state: 'pure' funcions don't have side effects: http://www.sitepoint.com/functional-programming-pure-functions/
 *   - Single source of truth (though this would also be the case if we just use a plain old simple object for state without redux)
 *   - easy testing (tests don't need to set up a context, they just run!)
 *   - live state history (undo / redo)
 *   - Easy to integrate a virtual DOM if we want to later on.
 * 
 * Cons: 
 *   - Adds some overhead (both mental for devs & js running), 
 *   - the entire state object gets rebuilt for every change
 */