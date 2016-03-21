

//======================================================================================= Action creator
var actionCreator = function() { return { type: 'AN_ACTION' } }


//================================================================================== The store / reducer


//store / reducer. This recieves the current state object & an action then returns the next state object
//action { type: ..., state: ... }

var userReducer = function (state = {}, action) {
	console.log('userReducer was called with state', state, 'and action', action);

	switch (action.type) {
		case 'SET_NAME':
			return {
				name: action.name
			}
		default:
			return state;
	}
}

var itemsReducer = function (state = [], action) {
	console.log('itemsReducer was called with state', state, 'and action', action);

	switch (action.type) {
		case 'ADD_ITEM':
			return [
				action.item
			]
		default:
			return state;
	}
}

//import { createStore, combineReducers } from 'redux';
var createStore = require('redux').createStore;
var combineReducers = require('redux').combineReducers;

var reducer = combineReducers({
	user: userReducer,
	items: itemsReducer
})

//reduxify the reducer as 'store'
var store = createStore(reducer);

console.log('store state after initialization:', store.getState())

//Dispatch AN_ACTION
store.dispatch({
    type: 'AN_ACTION'
})


//==================================================================================