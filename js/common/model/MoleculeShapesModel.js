//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var extend = require( 'PHET_CORE/extend' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @constructor
   *
   * TODO: verify that these are triggered and handled
   * Triggered events:
   * - mouseEvent
   * - keyboardEvent
   * - beforeFrameRender
   * - timeChangeNotifier
   */
  function MoleculeShapesModel( isBasicsVersion, options ) {
    this.isBasicsVersion = isBasicsVersion;

    PropertySet.call( this, extend( {
      molecule: null, // {Molecule}, assumed not to change in the 1st screen (model)
      moleculeQuaternion: new THREE.Quaternion(), // {THREE.Quaternion}, describes the rotation of the molecule view
      showBondAngles: false,
      showLonePairs: !isBasicsVersion,
      showMolecularShapeName: false,
      showElectronShapeName: false
    }, options ) );
  }

  return inherit( PropertySet, MoleculeShapesModel, {

    reset: function() {
      PropertySet.prototype.reset.call( this );
    },

    step: function( dt ) {
      this.molecule.update( Math.min( dt, 1 ) ); // cap at 1 second
    }
  } );
} );