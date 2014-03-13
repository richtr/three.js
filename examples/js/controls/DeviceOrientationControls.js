/**
 * @author richt / http://richt.me
 *
 * W3C Device Orientation control (http://www.w3.org/TR/orientation-event/)
 */

THREE.DeviceOrientationControls = function ( object ) {

	this.object = object;

	this.freeze = true;

	this.deviceOrientation = {};
	this.screenOrientation = 0;

	var degtorad = Math.PI / 180;

	var _objectQuaternion = new THREE.Quaternion();
        var _tmpQuaternion = new THREE.Quaternion();

        var _ROTATIONFACTOR = 0.7071067811865475; // == Math.sin( ( 90  * degtorad ) / 2 ) == Math.cos( ( 90  * degtorad ) / 2 )

	this.onDeviceOrientationChangeEvent = function( rawEvtData ) {
		this.deviceOrientation = rawEvtData;
	};

	this.onScreenOrientationChangeEvent = function() {
		this.screenOrientation = window.orientation || 0;
	};

        this.setObjectQuaternionFromDeviceOrientation = function() {
                var _x = this.deviceOrientation.beta  ? this.deviceOrientation.beta  * degtorad : 0; // beta
                var _y = this.deviceOrientation.gamma ? this.deviceOrientation.gamma * degtorad : 0; // gamma
                var _z = this.deviceOrientation.alpha ? this.deviceOrientation.alpha * degtorad : 0; // alpha

                var cX = Math.cos( _x/2 );
                var cY = Math.cos( _y/2 );
                var cZ = Math.cos( _z/2 );
                var sX = Math.sin( _x/2 );
                var sY = Math.sin( _y/2 );
                var sZ = Math.sin( _z/2 );

                //
                // ZXY quaternion construction.
                //

                var w = cX * cY * cZ - sX * sY * sZ;
                var x = sX * cY * cZ - cX * sY * sZ;
                var y = cX * sY * cZ + sX * cY * sZ;
                var z = cX * cY * sZ + sX * sY * cZ;

                _objectQuaternion.set( x, y, z, w );

                return _objectQuaternion;

        }

        function rotateObjectQuaternionByQuaternionValues( x, y, z, w ) {

                _tmpQuaternion.set( x, y, z, w );

                _tmpQuaternion.normalize();

                _objectQuaternion.multiply( _tmpQuaternion );

                return _objectQuaternion;

        }

	this.remapObjectQuaternionFromScreenOrientation = function() {

		switch( this.screenOrientation ) {
			case 90:
			case -270:
                                rotateObjectQuaternionByQuaternionValues( 0, 0, - _ROTATIONFACTOR, _ROTATIONFACTOR );

				break;
			case 180:
			case -180:
                                rotateObjectQuaternionByQuaternionValues( 0, 0, 0, 1 );

				break;
			case 270:
			case -90:
				rotateObjectQuaternionByQuaternionValues( 0, 0, _ROTATIONFACTOR, _ROTATIONFACTOR );

				break;
			default:
				// Same as input deviceorientation so do nothing
                                // rotateObjectQuaternionByQuaternionValues( 0, 0, 1, 0  );

				break;
		}

		return _objectQuaternion;
	};

	this.update = function( delta ) {
		if ( this.freeze ) {
			return;
		}

		this.setObjectQuaternionFromDeviceOrientation();

		this.remapObjectQuaternionFromScreenOrientation();

		this.object.quaternion.copy( _objectQuaternion );
	};

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	};

	this.connect = function() {
		this.onScreenOrientationChangeEvent(); // run once on load

		window.addEventListener( 'orientationchange', bind( this, this.onScreenOrientationChangeEvent ), false );
		window.addEventListener( 'deviceorientation', bind( this, this.onDeviceOrientationChangeEvent ), false );

		this.freeze = false;
	};

	this.disconnect = function() {
		this.freeze = true;

		window.removeEventListener( 'orientationchange', bind( this, this.onScreenOrientationChangeEvent ), false );
		window.removeEventListener( 'deviceorientation', bind( this, this.onDeviceOrientationChangeEvent ), false );
	};

};
