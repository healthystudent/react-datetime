'use strict';

var React = require('react'),
	createClass = require('create-react-class'),
	assign = require('object-assign')
	;

var DateTimePickerTime = createClass({
	getInitialState: function() {
		return this.calculateState( this.props );
	},

	calculateState: function( props ) {
		var date = props.selectedDate || props.viewDate,
			format = props.timeFormat,
			counters = []
			;

		if ( format.toLowerCase().indexOf('h') !== -1 ) {
			counters.push('hours');
			if ( format.indexOf('m') !== -1 ) {
				counters.push('minutes');
				if ( format.indexOf('s') !== -1 ) {
					counters.push('seconds');
				}
			}
		}

		var hours = date.format( 'H' );

		var daypart = false;
		if ( this.state !== null && this.props.timeFormat.toLowerCase().indexOf( ' a' ) !== -1 ) {
			if ( this.props.timeFormat.indexOf( ' A' ) !== -1 ) {
				daypart = ( hours >= 12 ) ? 'PM' : 'AM';
			} else {
				daypart = ( hours >= 12 ) ? 'pm' : 'am';
			}
		}

		return {
			hours: hours,
			minutes: date.format( 'mm' ),
			seconds: date.format( 'ss' ),
			milliseconds: date.format( 'SSS' ),
			daypart: daypart,
			counters: counters
		};
	},

	renderCounter: function( type ) {
		if ( type !== 'daypart' ) {
			var value = this.state[ type ];
			if ( type === 'hours' && this.props.timeFormat.toLowerCase().indexOf( ' a' ) !== -1 ) {
				value = ( value - 1 ) % 12 + 1;

				if ( value === 0 ) {
					value = 12;
				}
			return React.createElement('div', { key: type, className: 'rdtCounter' }, [
				React.createElement('span', { key: 'up', className: 'rdtBtn', onMouseDown: this.onStartClicking('increase', type), onContextMenu: this.disableContextMenu }, '▲'),
				React.createElement('div', { key: 'c', className: 'rdtCount' },
					React.createElement('input', {
						className: 'rdtTimeInput', type: 'text', value: value, onFocus: this.handleOnFocus,
						ref: (el) => { this[`_input${type}`] = el; }, onChange: event => this.handleChange(event, 'manualEntry', type), onContextMenu: this.disableContextMenu
					})),
				React.createElement('span', { key: 'do', className: 'rdtBtn', onMouseDown: this.onStartClicking('decrease', type), onContextMenu: this.disableContextMenu }, '▼')
			]);
		}
		return '';
	},
	renderDayPart: function() {
		return React.createElement('div', { key: 'dayPart', className: 'rdtCounter' }, [
			React.createElement('span', { key: 'up', className: 'rdtBtn', onMouseDown: this.onStartClicking( 'toggleDayPart', 'hours'), onContextMenu: this.disableContextMenu }, '▲' ),
			React.createElement('div', { key: this.state.daypart, className: 'rdtCount' }, this.state.daypart ),
			React.createElement('span', { key: 'do', className: 'rdtBtn', onMouseDown: this.onStartClicking( 'toggleDayPart', 'hours'), onContextMenu: this.disableContextMenu }, '▼' )
		]);
	},

	render: function() {
		var me = this,
			counters = []
		;

		this.state.counters.forEach( function( c ) {
			if ( counters.length )
				counters.push( React.createElement('div', { key: 'sep' + counters.length, className: 'rdtCounterSeparator' }, ':' ) );
			counters.push( me.renderCounter( c ) );
		});

		if ( this.state.daypart !== false ) {
			counters.push( me.renderDayPart() );
		}

		if ( this.state.counters.length === 3 && this.props.timeFormat.indexOf( 'S' ) !== -1 ) {
			counters.push( React.createElement('div', { className: 'rdtCounterSeparator', key: 'sep5' }, ':' ) );
			counters.push(
				React.createElement('div', { className: 'rdtCounter rdtMilli', key: 'm' },
					React.createElement('input', { value: this.state.milliseconds, type: 'text', onChange: this.updateMilli } )
					)
				);
		}

		return React.createElement('div', { className: 'rdtTime' },
			React.createElement('table', {}, [
				this.renderHeader(),
				React.createElement('tbody', { key: 'b'}, React.createElement('tr', {}, React.createElement('td', {},
					React.createElement('div', { className: 'rdtCounters' }, counters )
				)))
			])
		);
	},

	componentWillMount: function() {
		var me = this;
		me.timeConstraints = {
			hours: {
				min: 0,
				max: 23,
				step: 1
			},
			minutes: {
				min: 0,
				max: 59,
				step: 1
			},
			seconds: {
				min: 0,
				max: 59,
				step: 1
			},
			milliseconds: {
				min: 0,
				max: 999,
				step: 1
			}
		};
		['hours', 'minutes', 'seconds', 'milliseconds'].forEach( function( type ) {
			assign(me.timeConstraints[ type ], me.props.timeConstraints[ type ]);
		});
		this.setState( this.calculateState( this.props ) );
	},

	componentWillReceiveProps: function( nextProps ) {
		this.setState( this.calculateState( nextProps ) );
	},

	updateMilli: function( e ) {
		var milli = parseInt( e.target.value, 10 );
		if ( milli === e.target.value && milli >= 0 && milli < 1000 ) {
			this.props.setTime( 'milliseconds', milli );
			this.setState( { milliseconds: milli } );
		}
	},

	renderHeader: function() {
		if ( !this.props.dateFormat )
			return null;

		var date = this.props.selectedDate || this.props.viewDate;
		return React.createElement('thead', { key: 'h' }, React.createElement('tr', {},
			React.createElement('th', { className: 'rdtSwitch', colSpan: 4, onClick: this.props.showView( 'days' ) }, date.format( this.props.dateFormat ) )
		));
	},
		
	componentDidMount: function () {
		this._inputhours.select();
	},
	
	reFocusHour: function () {
		//this[`_input${type}`].select();
		this._inputhours.select();
	},
	reFocusMin: function () {
		//this[`_input${type}`].select();
		this._inputminutes.select();
	},
		
	handleChange: function (e, action, type) {
		let me = this;
		let manualInput = e.target.value;
		if (manualInput > this.timeConstraints[type].max || manualInput === NaN || manualInput === undefined) {
			
			manualInput = 0;
			//this.reFocus();
			console.log(`_input${type}`);
			if (type === 'hours') {
				setTimeout(this.reFocusHour, 100);
			}
			else {
				setTimeout(this.reFocusMin, 100);
			}
			
		}
		// else if (manualInput === NaN || manualInput === undefined) {
		// 	manualInput = 0;
		// 	this.reFocus;
		// }
		/* else */ // used if
		if (manualInput.length > 2) { //hour.length > 2
			manualInput = manualInput.substr(-2);
			manualInput = parseInt(manualInput);
			let update = {};
			//console.log(manualInput, action, type, "handleChange");
			update[type] = me[action](type, manualInput);
			me.setState(update);
			//console.log(update, type, typeof type, action, manualInput, 'updatefrom');
			this.props.setTime(type.toString(), manualInput);
			this.setState({ [type]: manualInput });
			//console.log(this.setState({ [type]: manualInput }));
			//console.log('thisprpsetTime setState');
			//this.reFocus();
		}
		else {
			manualInput = parseInt(manualInput, 10);
			let update = {};
			console.log(manualInput, action, type, "handleChange");
			update[type] = me[action](type, manualInput);
			me.setState(update);
			console.log(update, type, typeof type, action, manualInput, 'updatefrom');
			this.props.setTime(type.toString(), manualInput);
			this.setState({ [type]: manualInput });
			console.log(this.setState({ [type]: manualInput }));
			console.log('thisprpsetTime setState');
			//this.reFocus();
		}
	},

	onStartClicking: function( action, type ) {
		var me = this;

		return function() {
			var update = {};
			update[ type ] = me[ action ]( type );
			me.setState( update );

			me.timer = setTimeout( function() {
				me.increaseTimer = setInterval( function() {
					update[ type ] = me[ action ]( type );
					me.setState( update );
				}, 70);
			}, 500);

			me.mouseUpListener = function() {
				clearTimeout( me.timer );
				clearInterval( me.increaseTimer );
				me.props.setTime( type, me.state[ type ] );
				document.body.removeEventListener( 'mouseup', me.mouseUpListener );
				document.body.removeEventListener( 'touchend', me.mouseUpListener );
			};

			document.body.addEventListener( 'mouseup', me.mouseUpListener );
			document.body.addEventListener( 'touchend', me.mouseUpListener );
		};
	},

	disableContextMenu: function( event ) {
		event.preventDefault();
		return false;
	},

	padValues: {
		hours: 1,
		minutes: 2,
		seconds: 2,
		milliseconds: 3
	},

	toggleDayPart: function( type ) { // type is always 'hours'
		var value = parseInt( this.state[ type ], 10) + 12;
		if ( value > this.timeConstraints[ type ].max )
			value = this.timeConstraints[ type ].min + ( value - ( this.timeConstraints[ type ].max + 1 ) );
		return this.pad( type, value );
	},

	increase: function( type ) {
		var value = parseInt( this.state[ type ], 10) + this.timeConstraints[ type ].step;
		if ( value > this.timeConstraints[ type ].max )
			value = this.timeConstraints[ type ].min + ( value - ( this.timeConstraints[ type ].max + 1 ) );
		return this.pad( type, value );
	},

	decrease: function( type ) {
		var value = parseInt( this.state[ type ], 10) - this.timeConstraints[ type ].step;
		if ( value < this.timeConstraints[ type ].min )
			value = this.timeConstraints[ type ].max + 1 - ( this.timeConstraints[ type ].min - value );
		return this.pad( type, value );
	},
	
	manualEntry: function (type, hour) {
		var value = parseInt(hour, 10);
		if (isNaN(value)) {
			value = 0;
		}
		else {
			console.log(value, 'from_mE');
			return this.pad(type, value);
		}

	},

	pad: function( type, value ) {
		var str = value + '';
		while ( str.length < this.padValues[ type ] )
			str = '0' + str;
		return str;
	},
	
	handleOnFocus: function (e) {
		e.target.select();
		// console.log(this.refs.inputRef.value)
		// this.refs.inputRef.value;
	}
});

module.exports = DateTimePickerTime;
