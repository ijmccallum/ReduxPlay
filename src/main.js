// https://github.com/happypoulp/redux-tutorial


/* ================================================================================== Reducers
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



/* ================================================================================== Actions
 * All information is passed through actions.
 * These are objects that can take any form but I'm using: https://github.com/acdlite/flux-standard-action
 * There's even an action compliance test on that repo if we use this
 * {
 *     type: String,
 *     payload: Any,
 *     error: Boolean,
 *     meta: Any
 * }
 */

var USER_ACTIONS = require('./actionTypes.js').USER_ACTIONS;

var AsyncSetNameActionCreator = function (name) {
	//returning a function that is passed dispatch so that this may dispatch the action when async completes
	//but this doesn't work as actions have to be simple objects - not functions like this guy
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
			// your middleware-specific code goes here
			//this is thunk, it lets us handle async ... I think? TODO: needs work
			console.log('middleware_1: action received: ', action);
			return typeof action === 'function' ?
                action(dispatch, getState) :
                next(action)
		}
	}
}

 var middleware_2 = function ({ dispatch, getState }) {
	return function(next) {
		return function (action) {
			console.log('middleware_2: action received: ', action);
            return next(action);
		}
	}
}



/* ================================================================================== Redux
 * This is where we pass the above reducers to Redux
 * redux.combineReducers lets us bundle multiple reducers 
 *  - (so we can split hendlers for different 'slices' of the state object)
 * redux.createStore wraps the bundled reducers in ... magic
 */

//import { createStore, combineReducers } from 'redux';
var createStore = require('redux').createStore;
var combineReducers = require('redux').combineReducers;
var applyMiddleware = require('redux').applyMiddleware;


const middlewareBuild = applyMiddleware(middleware_1, middleware_2)(createStore);

var reducerBuild = combineReducers({
	user: userReducer,
	items: itemsReducer
})

//reduxify the reducer as 'store'
var store = middlewareBuild(reducerBuild);

console.groupEnd(); //end initialization console group



/* ================================================================================== Subscribe
 * 
 */

store.subscribe(function() {
    console.log('store has been updated. Latest store state:', store.getState());
    // Update your views here
})

//TODO: get state in subscription

//TODO: unsubscribe

//TODO: where is the global state again? in the store, we have to call getState() to get it









//See it in action!
console.groupCollapsed("dispatch1");
	console.log('before: ', store.getState());
	store.dispatch(AsyncSetNameActionCreator('bob 1'));
	console.log('after : ', store.getState());
console.groupEnd();