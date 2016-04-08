/* Recently I've been lucky enough to start out on a greenfield project, (and it's a whopper!) lucky lucky me! 
 * Now although there's a lot of nifty techniques being used, there's one that I'm really excited about: our
 * data is coming through as JSON :D. We're getting to write a 'smart' front end! Not the whole site though,
 * that would be a but much, just the more 'app-like' areas. This means we're going to have to handle some 
 * state, and if you're following fashion that means REACT... which is amazing! But, possibly a little overkill.
 * There's a lot we don't need, but also a couple of parts I'd really really like: flux and a single state object.
 *
 * Enter Redux. ~700 lines of JS (unminified & with comments) that give us state handling like flux (but streamlined) 
 * and the niftiest state object I've ever seen. React and Redux are both new to me, Redux more so. So, I ran through
 * a few tutorials, this one particularly stood out https://github.com/happypoulp/redux-tutorial, and put together
 * the most minimal (while remaining actually useful) implementation of Redux to get my head around it and hopefully
 * allow the other FEDs on the team to decide if it's worth bringing into a production project. The following is 
 * that demo filled with comments that attempt to tell the story of an Action in Redux. I hope you like it.
 *
 * Also, if you want to give the demo a shot it's all here: https://github.com/ijmccallum/ReduxPlay
 */

/*
 * Redux! It only deals with application state which is held in a single object - "the store".
 * Although it's an object, we don't access it directly, instead we have to ask it for itself
 * eg store.getState(); or fire an action to make updates, eg: store.dispatch(an action);
 * We can also subscribe to the store to get notified of state changes. This is essentially 
 * how all changes will happen:
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
 *  | Middleware functions are run on every action before it hits the |
 *  |    store, we can have 1, none or many. A middleware function    |
 *  |    might do something like capitalize a name: 'Bob', or log the |
 *  |    action, or do some kind of validation before the action hits |
 *  |    the heart and soul of Redux:                                 |
 *  | Reducers are functions built into the store that handle state   |
 *  |    updates. But - they don't update the state directly. Instead |
 *  |    the store creates a new state object. This new state object  |
 *  |    is mutated with whatever the reducers return. This new state |
 *  |    object is now the current state object. When all the reducers|
 *  |    are finished - all the subscribers are informed.             |
 *  -------------------------------------------------------------------
 *
 * Just to clear somethign up, the reducers and middleware functions are what's knowen as
 * pure' functions. They don't reach out and modify anyting, they recieve something, 
 * tweak that somethign and return it. Like a math function.
 * http://www.sitepoint.com/functional-programming-pure-functions/
 * "It’s a coffee grinder: beans go in, powder comes out, end of story."
 * Redux doesn't enforce this, it's up to us to keep to the princnciple.
 *
 * That covers the overview, now into Redux we go.
 */



/* =========================================================== Actions
 * All information is passed through actions. These are objects that 
 * can take any form but: https://github.com/acdlite/flux-standard-action
 * There's even an action compliance test on that repo to ensure the
 * standard is adheared to. Here's a JSON description of what a 
 * standard action would look like:
 * 
 * {
 *     type: String,
 *     payload: Any,
 *     error: Boolean,
 *     meta: Any
 * }
 * 
 */

/* To set up a list of actions we cuold use plain strings, 
 * but: http://redux.js.org/docs/recipes/ReducingBoilerplate.html
 */
const USER_ACTIONS = {
	CREATE: 'CREATE_USER',
	SET_NAME: 'SET_NAME',
	DELETE: 'DELETE_USER'
};

/* The action itself.
 * For each action we create a function that will build the correct 
 * structure, this makes our life much simpler when we get to firing 
 * off actions from other parts of the project.
 */
var AsyncSetNameActionCreator = function (name) {
	/* to deal with asyncronus requests we return a function which you'll 
	 * note has been passed dispatch. That allows it to dispatch the action
	 * by itself when the async request completes.
	 * For ease in setting up the demo, the below "async" is stubbed with 
	 * a timeout, how very fancy!
	 * Note that normally actions are passed straight through to the reducers
	 * which only accept objects, so we need a bit of middleware called "thunk",
	 * that'll hold onto this function until it dispatches the action within
	 * the timeout and then pass that object to the reducers. We'll get to that.
	 */
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

/* ======================================================== Middleware
 * These have a crazy looking structure, for those in the know,
 * think Currying - it's a concept I've yet to get my head into
 * So I'll just stay away from that for now.
 * 
 * First level: provides dispatch & getState to the next two levels to use.
 * Second level: provides next which we can return to move on to the next step 
 *     in the process (think express.js - or is that native to node? Can't rmember, one of the two)
 * Third level: proveds the action from dispatch or from any previous middleware that has run before this one.
 * 
 * Each piece of Middleware is registered with redux through applyMiddleware(), we'll get to that later.
 * There's a lot of pieces of middleware that have been written by others and 
 * shared here if you're interested in some examples: http://redux.js.org/docs/introduction/Ecosystem.html
 */

//First level
 var middleware_1 = function ({ dispatch, getState }) {
	//Second level
	return function(next) {
		//Third level
		return function (action) {
			//this is thunk which I mentioned above for dealing with async functions, it's tiny!
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

/* ========================================================== Reducers
 * We have arrived at the heart of Redux - these are the guys that 
 * create the state changes. We can have one big one to handle the 
 * entire state object and deal with every type of action but it makes 
 * more sense to break it out into many reducers - each handling only a 
 * part of the state object. We'll assign each reducer to it's 
 * specific bit of state in the next section.
 *
 * These recieve the bit of state they're responsible for and the action.
 * They then create a new object which is basically a copy of their bit of 
 * state and mutate that copy based on the action. That object is returned
 * and used by Redux to build the next version of the whole state object.
 * Remember that note about 'pure functions' - this is that.
 */
console.groupCollapsed("initialization");

var userReducer = function (state = {}, action) {
	console.groupCollapsed("userReducer");
		console.log('state : ', state);
		console.log('action: ', action);
	console.groupEnd();

	switch (action.type) {
		case 'SET_NAME':
			/*
			 * This reducer (userReducer) is in charge of the user section 
			 * of the state object. In this demo, the user section has a
			 * key: "name". So this reducer returns an object with the key "name" 
			 * and the value passed in by the action -  within it's payload - check
			 * AsyncSetNameActionCreator(name) to remember how it built the 
			 * action object with the correct structure. By doing this the reducer
			 * is helping redux set up the next version of the user section 
			 * to be delivered to our subscribers.
			 */
			return {
				name: action.payload
			}
		default:
			return state;
	}
}

//here's another one for fun! Haven't tested it though - looks like it might just replace the items array
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